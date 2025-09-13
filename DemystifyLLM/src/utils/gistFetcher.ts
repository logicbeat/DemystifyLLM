// Utility functions for fetching GitHub Gist content

import type { Slide } from '../types';

export interface GistResponse {
  files: {
    [filename: string]: {
      content: string;
      raw_url: string;
      filename?: string;
      type?: string;
      language?: string;
      size?: number;
    };
  };
  description?: string;
  created_at?: string;
  updated_at?: string;
  public?: boolean;
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
    if (urlObj.hostname !== 'gist.github.com') {
      return null;
    }

    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
    
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
    console.error('Error parsing Gist URL:', error);
    return null;
  }
};

/**
 * Fetch Gist content from GitHub API
 */
export const fetchGistContent = async (gistUrl: string): Promise<GistResponse> => {
  const gistId = parseGistUrl(gistUrl);
  
  if (!gistId) {
    throw new Error('Invalid GitHub Gist URL format');
  }

  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Gist not found. Please check the URL and make sure the Gist is public.');
      } else if (response.status === 403) {
        throw new Error('Access denied. The Gist may be private or you may have hit rate limits.');
      } else {
        throw new Error(`Failed to fetch Gist: ${response.status} ${response.statusText}`);
      }
    }

    const gistData = await response.json();
    return gistData;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch Gist content');
  }
};

/**
 * Fetch markdown content from a URL (typically from a Gist raw URL)
 */
export const fetchMarkdownContent = async (contentUrl: string): Promise<string> => {
  try {
    // Handle data URLs (used for sample/demo content)
    if (contentUrl.startsWith('data:text/markdown;base64,')) {
      const base64Content = contentUrl.replace('data:text/markdown;base64,', '');
      return atob(base64Content);
    }

    const response = await fetch(contentUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch markdown content: ${response.status} ${response.statusText}`);
    }

    const content = await response.text();
    return content;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch markdown content');
  }
};

/**
 * Parse slides data from Gist content
 * Looks for a JSON file containing slide definitions
 */
export const parseSlidesFromGist = async (gistData: GistResponse): Promise<Slide[]> => {
  // Look for JSON files that might contain slide data
  const possibleSlideFiles = Object.entries(gistData.files).filter(([filename]) => {
    const lowerName = filename.toLowerCase();
    return lowerName.endsWith('.json') && 
           (lowerName.includes('slide') || lowerName.includes('presentation') || 
            lowerName === 'index.json' || lowerName === 'slides.json');
  });

  if (possibleSlideFiles.length === 0) {
    // If no specific slide file found, look for any JSON file
    const jsonFiles = Object.entries(gistData.files).filter(([, file]) => 
      file.filename?.toLowerCase().endsWith('.json')
    );
    
    if (jsonFiles.length === 0) {
      throw new Error('No JSON file found in Gist. Please include a JSON file with slide definitions.');
    }
    
    // Use the first JSON file found
    possibleSlideFiles.push(jsonFiles[0]);
  }

  try {
    // Try to parse the first suitable JSON file
    const [, slideFile] = possibleSlideFiles[0];
    const slidesData = JSON.parse(slideFile.content);
    
    if (!Array.isArray(slidesData)) {
      throw new Error('Slides data must be a JSON array');
    }

    // Validate slide structure
    slidesData.forEach((slide, index) => {
      if (typeof slide !== 'object' || slide === null) {
        throw new Error(`Slide ${index + 1} must be an object`);
      }
      if (typeof slide.slideIndex !== 'number') {
        throw new Error(`Slide ${index + 1} must have a slideIndex number`);
      }
      if (typeof slide.slideContentGist !== 'string') {
        throw new Error(`Slide ${index + 1} must have a slideContentGist string`);
      }
    });

    return slidesData;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format in slides file');
    }
    throw error;
  }
};