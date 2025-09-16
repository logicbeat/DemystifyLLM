// Utility functions for URL handling and sharing

/**
 * Get the current presentation URL for sharing
 */
export const getCurrentPresentationUrl = (): string => {
  return window.location.href;
};

/**
 * Get a shareable URL for a specific slide
 */
export const getSlideUrl = (slideNumber: number): string => {
  const baseUrl = window.location.origin + window.location.pathname.split('/presentation')[0];
  return `${baseUrl}/presentation/${slideNumber}`;
};

/**
 * Copy URL to clipboard with fallback
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'absolute';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      // Using deprecated execCommand as fallback for older browsers
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Share URL using Web Share API with fallback to clipboard
 */
export const shareUrl = async (url: string, title: string = 'Presentation'): Promise<boolean> => {
  try {
    if (navigator.share) {
      await navigator.share({
        title,
        url,
      });
      return true;
    } else {
      // Fallback to copying to clipboard
      return await copyToClipboard(url);
    }
  } catch (error) {
    console.error('Failed to share:', error);
    // Fallback to copying to clipboard
    return await copyToClipboard(url);
  }
};

/**
 * Extract slide number from URL path
 */
export const getSlideNumberFromPath = (path: string): number | null => {
  const regex = /\/presentation\/(\d+)/;
  const match = regex.exec(path);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Validate if a slide number is valid for the current presentation
 */
export const isValidSlideNumber = (slideNumber: number, totalSlides: number): boolean => {
  return slideNumber >= 1 && slideNumber <= totalSlides;
};