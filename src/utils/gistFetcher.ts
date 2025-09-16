// Utility functions for fetching GitHub Gist content

import { Octokit } from "octokit";
import type { PresentationMetadata, Slide } from "../types";

const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_PAT,
});

export interface GistFile {
  content: string;
  raw_url: string;
  filename?: string;
  type?: string;
  language?: string;
  size?: number;
  truncated?: boolean;
}

export interface GistOwner {
  name?: string | null;
  email?: string | null;
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  starred_at?: string;
  user_view_type?: string;
}

export interface GistResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forks?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  history?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fork_of?: any;
  url: string;
  forks_url: string;
  commits_url: string;
  id: string;
  node_id: string;
  git_pull_url: string;
  git_push_url: string;
  html_url: string;
  files: {
    [filename: string]: GistFile;
  };
  public: boolean;
  created_at: string;
  updated_at: string;
  description: string | null;
  comments: number;
  comments_enabled?: boolean;
  user: string | null;
  comments_url: string;
  owner?: GistOwner;
  truncated?: boolean;
}

/**
 * Parse a GitHub Gist URL to extract the Gist ID
 * Supports various URL formats:
 * - https://gist.github.com/username/gist_id
 * - https://gist.github.com/gist_id
 * - gist_id (direct ID)
 */
export const parseGistUrl = (url: string): string | null => {
  try {
    // If it's just a gist ID (alphanumeric string)
    if (/^[a-f0-9]+$/i.test(url.trim())) {
      return url.trim();
    }

    const urlObj = new URL(url);

    // Check if it's a GitHub Gist URL
    if (urlObj.hostname !== "gist.github.com") {
      return null;
    }

    const pathParts = urlObj.pathname
      .split("/")
      .filter((part) => part.length > 0);

    // Format: /username/gist_id or /gist_id
    if (pathParts.length >= 1) {
      const lastPart = pathParts[pathParts.length - 1];
      // Gist IDs are typically 32 character hex strings
      if (/^[a-f0-9]+$/i.test(lastPart)) {
        return lastPart;
      }
    }

    return null;
  } catch (error) {
    console.error("Error parsing Gist URL:", error);
    return null;
  }
};

/**
 * Fetch Gist content from GitHub API
 */
export const fetchGistContent = async (
  gistUrl: string
): Promise<GistResponse> => {
  const gistId = parseGistUrl(gistUrl);
  if (!gistId) {
    throw new Error("Invalid GitHub Gist URL format");
  }
  try {
    // Use Octokit to fetch the Gist
    const { data } = await octokit.rest.gists.get({ gist_id: gistId });
    // Octokit returns the data in a slightly different format, but compatible with GistResponse
    return data as unknown as GistResponse;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error(
        "Gist not found. Please check the URL and make sure the Gist is public."
      );
    } else if (error.status === 403) {
      throw new Error(
        "Access denied. The Gist may be private or you may have hit rate limits."
      );
    } else if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch Gist content");
  }
};

/**
 * Fetch markdown content from a URL (typically from a Gist raw URL)
 */
export const fetchMarkdownContent = async (
  contentUrl: string
): Promise<string> => {
  try {
    // Handle data URLs (used for sample/demo content)
    if (contentUrl.startsWith("data:text/markdown;base64,")) {
      const base64Content = contentUrl.replace(
        "data:text/markdown;base64,",
        ""
      );
      return atob(base64Content);
    }
    const gistId = parseGistUrl(contentUrl);
    if (!gistId) {
      throw new Error("Invalid GitHub Gist URL format");
    }
    const response = await octokit.rest.gists.get({ gist_id: gistId });

    if (!response?.data) {
      throw new Error(
        `Failed to fetch markdown content: ${response?.status} ${response?.status}`
      );
    }

    if (response?.data?.files && Object.keys(response.data.files).length > 0) {
      const content = Object.values(response.data.files)[0]?.content;
      return Promise.resolve<string>(content || "");
    }
    return Promise.resolve<string>("");
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch markdown content");
  }
};

/**
 * Parse slides data from Gist content
 * Looks for a JSON file containing slide definitions
 */
export const parseSlidesFromGist = async (
  gistData: GistResponse
): Promise<[Slide[], PresentationMetadata]> => {
  // Look for JSON files that might contain slide data
  const possibleSlideFiles = Object.entries(gistData.files).filter(
    ([filename]) => {
      const lowerName = filename.toLowerCase();
      return (
        lowerName.endsWith(".json") &&
        (lowerName.includes("slide") ||
          lowerName.includes("presentation") ||
          lowerName === "index.json" ||
          lowerName === "slides.json")
      );
    }
  );

  if (possibleSlideFiles.length === 0) {
    // If no specific slide file found, look for any JSON file
    const jsonFiles = Object.entries(gistData.files).filter(([, file]) =>
      file.filename?.toLowerCase().endsWith(".json")
    );

    if (jsonFiles.length === 0) {
      throw new Error(
        "No JSON file found in Gist. Please include a JSON file with slide definitions."
      );
    }

    // Use the first JSON file found
    possibleSlideFiles.push(jsonFiles[0]);
  }

  try {
    // Try to parse the first suitable JSON file
    const [, slideFile] = possibleSlideFiles[0];
    const slidesData =
      JSON.parse(slideFile.content).slides || JSON.parse(slideFile.content);

    if (!Array.isArray(slidesData)) {
      throw new Error("Slides data must be a JSON array");
    }

    // Validate slide structure
    slidesData.forEach((slide, index) => {
      if (typeof slide !== "object" || slide === null) {
        throw new Error(`Slide ${index + 1} must be an object`);
      }
      if (typeof slide.slideIndex !== "number") {
        throw new Error(`Slide ${index + 1} must have a slideIndex number`);
      }
      if (typeof slide.slideContentGist !== "string") {
        throw new Error(
          `Slide ${index + 1} must have a slideContentGist string`
        );
      }
    });

    return [slidesData, JSON.parse(slideFile.content).metadata || {}];
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON format in slides file");
    }
    throw error;
  }
};

/**
 * Load presentation data from a gist ID
 * This is useful for loading presentations from URL parameters
 */
export const loadPresentationFromGistId = async (gistId: string): Promise<[Slide[], PresentationMetadata]> => {
  try {
    const { data } = await octokit.rest.gists.get({ gist_id: gistId });
    return await parseSlidesFromGist(data as GistResponse);
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 404) {
      throw new Error("Gist not found. Please check the Gist ID and make sure it's public.");
    }
    throw new Error("Failed to fetch Gist content. Please check your internet connection and try again.");
  }
};
