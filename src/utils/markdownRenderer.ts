// Utility functions for markdown rendering

/**
 * Basic markdown sanitization
 * For now, we'll rely on react-markdown's built-in sanitization
 * In the future, we might want to add DOMPurify for additional security
 */
export const sanitizeMarkdown = (content: string): string => {
  // Remove any potential script tags as a basic security measure
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

/**
 * Extract title from markdown content
 * Looks for the first H1 heading
 */
export const extractTitle = (markdownContent: string): string | null => {
  const lines = markdownContent.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check for # Title format
    if (trimmedLine.startsWith('# ')) {
      return trimmedLine.substring(2).trim();
    }
    
    // Check for Title followed by === underline
    const nextLineIndex = lines.indexOf(line) + 1;
    if (nextLineIndex < lines.length) {
      const nextLine = lines[nextLineIndex].trim();
      if (/^=+$/.exec(nextLine)) {
        return trimmedLine;
      }
    }
  }
  
  return null;
};

/**
 * Extract a brief description from markdown content
 * Returns the first paragraph after the title
 */
export const extractDescription = (markdownContent: string): string | null => {
  const lines = markdownContent.split('\n');
  let foundTitle = false;
  let description = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip title lines
    if (trimmedLine.startsWith('#') || /^=+$/.exec(trimmedLine) || /^-+$/.exec(trimmedLine)) {
      foundTitle = true;
      continue;
    }
    
    // If we've found a title and this is a non-empty line, start collecting description
    if (foundTitle && trimmedLine) {
      description += trimmedLine + ' ';
      
      // Stop at the end of the first paragraph or after 200 characters
      if (description.length > 200) {
        break;
      }
    } else if (foundTitle && description) {
      // Empty line after description - we're done
      break;
    }
  }
  
  return description.trim() || null;
};

/**
 * Process markdown content for presentation slides
 * Applies sanitization and any slide-specific transformations
 */
export const processSlideMarkdown = (content: string): string => {
  const processed = sanitizeMarkdown(content);
  
  // Add any slide-specific processing here
  // For example, we might want to enhance code blocks, add slide transitions, etc.
  
  return processed;
};