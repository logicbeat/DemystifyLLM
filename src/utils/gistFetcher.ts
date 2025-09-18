// Utility functions for fetching GitHub Gist content

import { Octokit } from "octokit";
import type { PresentationMetadata, Slide, ParsedGistInfo } from "../types";

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
 * Parse a GitHub Gist URL to extract the Gist ID and optional filename
 * Supports various URL formats:
 * - https://gist.github.com/username/gist_id
 * - https://gist.github.com/username/gist_id#file-filename-ext
 * - https://gist.github.com/gist_id
 * - gist_id (direct ID)
 */
export const parseGistUrl = (url: string): string | null => {
  const result = parseGistUrlWithFilename(url);
  return result?.gistId || null;
};

/**
 * Parse a GitHub Gist URL to extract both the Gist ID and filename
 * Returns an object with gistId and optional filename
 */
export const parseGistUrlWithFilename = (url: string): ParsedGistInfo | null => {
  try {
    // If it's just a gist ID (alphanumeric string)
    if (/^[a-f0-9]+$/i.test(url.trim())) {
      return { gistId: url.trim() };
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
        const result: ParsedGistInfo = { gistId: lastPart };
        
        // Check for filename in the fragment (hash)
        if (urlObj.hash) {
          const filename = parseFilenameFromFragment(urlObj.hash);
          if (filename) {
            result.filename = filename;
          }
        }
        
        return result;
      }
    }

    return null;
  } catch (error) {
    console.error("Error parsing Gist URL:", error);
    return null;
  }
};

/**
 * Parse filename from URL fragment
 * Handles fragments like #file-slide2-md or #file-image-png
 */
export const parseFilenameFromFragment = (fragment: string): string | null => {
  if (!fragment) return null;
  
  // Remove the # if present
  const hash = fragment.startsWith('#') ? fragment.slice(1) : fragment;
  
  // GitHub Gist fragments for files follow the pattern: file-{filename-with-dashes}-{extension}
  // Example: #file-slide2-md becomes slide2.md
  // Example: #file-flo_ppt-template_speakers_update-with-logos-png becomes flo_ppt-template_speakers_update-with-logos.png
  const fileRegex = /^file-(.+)-([a-z0-9]+)$/i;
  const fileMatch = fileRegex.exec(hash);
  if (fileMatch) {
    const [, namePart, extension] = fileMatch;
    // For most files, replace internal dashes with nothing, but for image files preserve the structure
    // Check if it's likely an image extension
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif'];
    
    if (imageExtensions.includes(extension.toLowerCase())) {
      // For image files, preserve dashes in the filename
      const filename = namePart.replace(/-/g, '-') + '.' + extension;
      return filename;
    } else {
      // For other files like markdown, remove dashes
      const filename = namePart.replace(/-/g, '') + '.' + extension;
      return filename;
    }
  }
  
  return null;
};

/**
 * Check if a filename represents an image file
 */
export const isImageFile = (filename: string): boolean => {
  if (!filename) return false;
  
  const imageExtensions = [
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif'
  ];
  
  const extension = filename.toLowerCase().split('.').pop();
  return extension ? imageExtensions.includes(extension) : false;
};

/**
 * Get the raw URL for a file in a gist
 */
export const getGistFileRawUrl = (gistId: string, filename: string): string => {
  return `https://gist.githubusercontent.com/${gistId}/raw/${filename}`;
};

/**
 * Get cache key for storing gist content in sessionStorage
 */
const getGistCacheKey = (gistId: string): string => `gist_cache_${gistId}`;

/**
 * Get cache statistics for debugging
 */
export const getCacheStats = (): { totalCachedGists: number; cacheKeys: string[] } => {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return { totalCachedGists: 0, cacheKeys: [] };
    }

    const cacheKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('gist_cache_')) {
        cacheKeys.push(key);
      }
    }
    
    return {
      totalCachedGists: cacheKeys.length,
      cacheKeys: cacheKeys.map(key => key.replace('gist_cache_', ''))
    };
  } catch (error) {
    console.warn('Failed to get cache stats:', error);
    return { totalCachedGists: 0, cacheKeys: [] };
  }
};

/**
 * Get cached gist content from sessionStorage
 */
const getCachedGistContent = (gistId: string): GistResponse | null => {
  try {
    // Check if sessionStorage is available
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return null;
    }
    
    const cacheKey = getGistCacheKey(gistId);
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData) as GistResponse;
    }
  } catch (error) {
    console.warn('Failed to retrieve cached gist content:', error);
  }
  return null;
};

/**
 * Cache gist content in sessionStorage
 */
const setCachedGistContent = (gistId: string, data: GistResponse): void => {
  try {
    // Check if sessionStorage is available
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }
    
    const cacheKey = getGistCacheKey(gistId);
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to cache gist content:', error);
  }
};

/**
 * Clear cached gist content for a specific gist ID
 */
export const clearGistCache = (gistId?: string): void => {
  try {
    // Check if sessionStorage is available
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }
    
    if (gistId) {
      // Clear specific gist cache
      const cacheKey = getGistCacheKey(gistId);
      sessionStorage.removeItem(cacheKey);
    } else {
      // Clear all gist caches
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith('gist_cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    }
  } catch (error) {
    console.warn('Failed to clear gist cache:', error);
  }
};

/**
 * Fetch Gist content from GitHub API with sessionStorage caching
 */
export const fetchGistContent = async (
  gistUrl: string,
  forceRefresh: boolean = false
): Promise<GistResponse> => {
  const gistId = parseGistUrl(gistUrl);
  if (!gistId) {
    throw new Error("Invalid GitHub Gist URL format");
  }

  // Check cache first unless force refresh is requested
  if (!forceRefresh) {
    const cachedContent = getCachedGistContent(gistId);
    if (cachedContent) {
      console.log(`Using cached content for gist ${gistId}`);
      return cachedContent;
    }
  }

  try {
    // Use Octokit to fetch the Gist
    const { data } = await octokit.rest.gists.get({ gist_id: gistId });
    const gistResponse = data as unknown as GistResponse;
    
    // Cache the response
    setCachedGistContent(gistId, gistResponse);
    console.log(`Cached content for gist ${gistId}`);
    
    // Octokit returns the data in a slightly different format, but compatible with GistResponse
    return gistResponse;
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
 * Now supports filename specification via URL fragments and caching
 */
export const fetchMarkdownContent = async (
  contentUrl: string,
  forceRefresh: boolean = false
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
    
    const gistInfo = parseGistUrlWithFilename(contentUrl);
    if (!gistInfo?.gistId) {
      throw new Error("Invalid GitHub Gist URL format");
    }

    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cachedContent = getCachedGistContent(gistInfo.gistId);
      if (cachedContent) {
        console.log(`Using cached content for markdown from gist ${gistInfo.gistId}`);
        
        if (cachedContent?.files && Object.keys(cachedContent.files).length > 0) {
          // If a specific filename was provided in the URL fragment, try to find that file
          if (gistInfo.filename) {
            const targetFile = Object.values(cachedContent.files).find(file => 
              file && file.filename?.toLowerCase() === gistInfo.filename?.toLowerCase()
            );
            if (targetFile) {
              return Promise.resolve<string>(targetFile.content || "");
            }
            // If specific file not found, log a warning but continue with first file
            console.warn(`File "${gistInfo.filename}" not found in cached gist, using first available file`);
          }
          
          // Fall back to first file if no specific filename or file not found
          const content = Object.values(cachedContent.files)[0]?.content;
          return Promise.resolve<string>(content || "");
        }
        return Promise.resolve<string>("");
      }
    }
    
    const response = await octokit.rest.gists.get({ gist_id: gistInfo.gistId });

    if (!response?.data) {
      throw new Error(
        `Failed to fetch markdown content: ${response?.status} ${response?.status}`
      );
    }

    // Cache the gist response
    const gistResponse = response.data as unknown as GistResponse;
    setCachedGistContent(gistInfo.gistId, gistResponse);
    console.log(`Cached markdown content for gist ${gistInfo.gistId}`);

    if (response?.data?.files && Object.keys(response.data.files).length > 0) {
      // If a specific filename was provided in the URL fragment, try to find that file
      if (gistInfo.filename) {
        const targetFile = Object.values(response.data.files).find(file => 
          file && file.filename?.toLowerCase() === gistInfo.filename?.toLowerCase()
        );
        if (targetFile) {
          return Promise.resolve<string>(targetFile.content || "");
        }
        // If specific file not found, log a warning but continue with first file
        console.warn(`File "${gistInfo.filename}" not found in gist, using first available file`);
      }
      
      // Fall back to first file if no specific filename or file not found
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
 * Fetch image content from a URL (typically from a Gist raw URL)
 * Returns image metadata including the raw URL for display
 */
export const fetchImageContent = async (
  contentUrl: string,
  forceRefresh: boolean = false
): Promise<{ type: 'image'; url: string; filename?: string }> => {
  try {
    const gistInfo = parseGistUrlWithFilename(contentUrl);
    if (!gistInfo?.gistId) {
      throw new Error("Invalid GitHub Gist URL format");
    }

    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cachedContent = getCachedGistContent(gistInfo.gistId);
      if (cachedContent) {
        console.log(`Using cached content for image from gist ${gistInfo.gistId}`);
        
        if (cachedContent?.files && Object.keys(cachedContent.files).length > 0) {
          // If a specific filename was provided in the URL fragment, try to find that file
          if (gistInfo.filename) {
            const targetFile = Object.values(cachedContent.files).find(file => 
              file && file.filename?.toLowerCase() === gistInfo.filename?.toLowerCase()
            );
            if (targetFile && targetFile.raw_url) {
              return { 
                type: 'image', 
                url: targetFile.raw_url, 
                filename: targetFile.filename 
              };
            }
            // If specific file not found, log a warning but continue with first image file
            console.warn(`File "${gistInfo.filename}" not found in cached gist, looking for first image file`);
          }
          
          // Fall back to first image file if no specific filename or file not found
          const imageFile = Object.values(cachedContent.files).find(file => 
            file && file.filename && isImageFile(file.filename)
          );
          if (imageFile && imageFile.raw_url) {
            return { 
              type: 'image', 
              url: imageFile.raw_url, 
              filename: imageFile.filename 
            };
          }
        }
        throw new Error("No image file found in cached gist");
      }
    }
    
    const response = await octokit.rest.gists.get({ gist_id: gistInfo.gistId });

    if (!response?.data) {
      throw new Error(
        `Failed to fetch image content: ${response?.status} ${response?.status}`
      );
    }

    // Cache the gist response
    const gistResponse = response.data as unknown as GistResponse;
    setCachedGistContent(gistInfo.gistId, gistResponse);
    console.log(`Cached image content for gist ${gistInfo.gistId}`);

    if (response?.data?.files && Object.keys(response.data.files).length > 0) {
      // If a specific filename was provided in the URL fragment, try to find that file
      if (gistInfo.filename) {
        const targetFile = Object.values(response.data.files).find(file => 
          file && file.filename?.toLowerCase() === gistInfo.filename?.toLowerCase()
        );
        if (targetFile && targetFile.raw_url) {
          return { 
            type: 'image', 
            url: targetFile.raw_url, 
            filename: targetFile.filename 
          };
        }
        // If specific file not found, log a warning but continue with first image file
        console.warn(`File "${gistInfo.filename}" not found in gist, looking for first image file`);
      }
      
      // Fall back to first image file if no specific filename or file not found
      const imageFile = Object.values(response.data.files).find(file => 
        file && file.filename && isImageFile(file.filename)
      );
      if (imageFile && imageFile.raw_url) {
        return { 
          type: 'image', 
          url: imageFile.raw_url, 
          filename: imageFile.filename 
        };
      }
    }
    
    throw new Error("No image file found in gist");
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch image content");
  }
};

/**
 * Determine content type from gist URL and fetch appropriate content
 * Returns either markdown content (string) or image metadata (object)
 */
export const fetchSlideContent = async (
  contentUrl: string,
  forceRefresh: boolean = false
): Promise<string | { type: 'image'; url: string; filename?: string }> => {
  try {
    const gistInfo = parseGistUrlWithFilename(contentUrl);
    if (!gistInfo?.gistId) {
      throw new Error("Invalid GitHub Gist URL format");
    }

    // If a specific filename is provided, check if it's an image
    if (gistInfo.filename && isImageFile(gistInfo.filename)) {
      return await fetchImageContent(contentUrl, forceRefresh);
    }

    // Check cache first to determine file type
    if (!forceRefresh) {
      const cachedContent = getCachedGistContent(gistInfo.gistId);
      if (cachedContent?.files) {
        // If specific filename provided, check its type
        if (gistInfo.filename) {
          const targetFile = Object.values(cachedContent.files).find(file => 
            file && file.filename?.toLowerCase() === gistInfo.filename?.toLowerCase()
          );
          if (targetFile?.filename && isImageFile(targetFile.filename)) {
            return await fetchImageContent(contentUrl, forceRefresh);
          }
        } else {
          // If no specific filename, check if first file is an image
          const firstFile = Object.values(cachedContent.files)[0];
          if (firstFile?.filename && isImageFile(firstFile.filename)) {
            return await fetchImageContent(contentUrl, forceRefresh);
          }
        }
      }
    }

    // Default to fetching as markdown content
    return await fetchMarkdownContent(contentUrl, forceRefresh);
  } catch (error) {
    // If image fetch fails, try as markdown
    if (error instanceof Error && error.message.includes("image")) {
      console.warn("Image fetch failed, trying as markdown:", error.message);
      return await fetchMarkdownContent(contentUrl, forceRefresh);
    }
    throw error;
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
 * Load presentation data from a gist ID with caching support
 * This is useful for loading presentations from URL parameters
 */
export const loadPresentationFromGistId = async (
  gistId: string, 
  forceRefresh: boolean = false
): Promise<[Slide[], PresentationMetadata]> => {
  try {
    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cachedContent = getCachedGistContent(gistId);
      if (cachedContent) {
        console.log(`Using cached presentation data for gist ${gistId}`);
        return await parseSlidesFromGist(cachedContent);
      }
    }

    const { data } = await octokit.rest.gists.get({ gist_id: gistId });
    const gistResponse = data as GistResponse;
    
    // Cache the response
    setCachedGistContent(gistId, gistResponse);
    console.log(`Cached presentation data for gist ${gistId}`);
    
    return await parseSlidesFromGist(gistResponse);
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 404) {
      throw new Error("Gist not found. Please check the Gist ID and make sure it's public.");
    }
    throw new Error("Failed to fetch Gist content. Please check your internet connection and try again.");
  }
};
