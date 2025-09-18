import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchRawContent, getFileContent } from '../gistFetcher';

// Mock fetch globally
global.fetch = vi.fn();

describe('gistFetcher truncated file handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchRawContent', () => {
    it('should fetch content from raw URL successfully', async () => {
      const mockContent = 'This is the full content from raw URL';
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockContent)
      });

      const result = await fetchRawContent('https://gist.githubusercontent.com/123/raw/file.md');
      
      expect(fetch).toHaveBeenCalledWith('https://gist.githubusercontent.com/123/raw/file.md');
      expect(result).toBe(mockContent);
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(fetchRawContent('https://invalid-url.com')).rejects.toThrow(
        'Failed to fetch raw content: 404 Not Found'
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchRawContent('https://invalid-url.com')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getFileContent', () => {
    it('should return content directly when file is not truncated', async () => {
      const file = {
        content: 'Direct content',
        truncated: false,
        raw_url: 'https://example.com/raw'
      };

      const result = await getFileContent(file);
      expect(result).toBe('Direct content');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should fetch from raw URL when file is truncated', async () => {
      const file = {
        content: 'Truncated...',
        truncated: true,
        raw_url: 'https://gist.githubusercontent.com/123/raw/file.md'
      };

      const fullContent = 'This is the complete content from raw URL';
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(fullContent)
      });

      const result = await getFileContent(file);
      
      expect(fetch).toHaveBeenCalledWith('https://gist.githubusercontent.com/123/raw/file.md');
      expect(result).toBe(fullContent);
    });

    it('should return empty string when content is undefined', async () => {
      const file = {
        truncated: false,
        raw_url: 'https://example.com/raw'
      };

      const result = await getFileContent(file);
      expect(result).toBe('');
    });

    it('should fetch from raw URL even when content is undefined but file is truncated', async () => {
      const file = {
        truncated: true,
        raw_url: 'https://gist.githubusercontent.com/123/raw/file.md'
      };

      const fullContent = 'Content from raw URL';
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(fullContent)
      });

      const result = await getFileContent(file);
      
      expect(fetch).toHaveBeenCalledWith('https://gist.githubusercontent.com/123/raw/file.md');
      expect(result).toBe(fullContent);
    });
  });
});