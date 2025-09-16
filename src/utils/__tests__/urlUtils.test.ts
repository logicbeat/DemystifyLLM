import { describe, it, expect, vi, beforeAll } from 'vitest'
import { 
  getCurrentPresentationUrl, 
  getSlideUrl, 
  getSlideNumberFromPath, 
  isValidSlideNumber 
} from '../urlUtils'

describe('URL Utils Tests', () => {
  // Mock window.location
  const mockLocation = {
    href: 'http://localhost:4100/presentation/3',
    origin: 'http://localhost:4100',
    pathname: '/presentation/3'
  }

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    })
  })

  it('getCurrentPresentationUrl returns current URL', () => {
    expect(getCurrentPresentationUrl()).toBe('http://localhost:4100/presentation/3')
  })

  it('getSlideUrl generates correct slide URL', () => {
    expect(getSlideUrl(5)).toBe('http://localhost:4100/presentation/5')
  })

  it('getSlideNumberFromPath extracts slide number correctly', () => {
    expect(getSlideNumberFromPath('/presentation/3')).toBe(3)
    expect(getSlideNumberFromPath('/presentation/10')).toBe(10)
    expect(getSlideNumberFromPath('/about')).toBe(null)
    expect(getSlideNumberFromPath('')).toBe(null)
  })

  it('isValidSlideNumber validates slide numbers', () => {
    expect(isValidSlideNumber(1, 5)).toBe(true)
    expect(isValidSlideNumber(3, 5)).toBe(true)
    expect(isValidSlideNumber(5, 5)).toBe(true)
    expect(isValidSlideNumber(0, 5)).toBe(false)
    expect(isValidSlideNumber(6, 5)).toBe(false)
    expect(isValidSlideNumber(-1, 5)).toBe(false)
  })
})

describe('GistFetcher Tests', () => {
  it('fetches gist content correctly', async () => {
    const mockGistData = {
      files: {
        'slides.json': {
          content: JSON.stringify([
            { slideIndex: 1, slideContentGist: 'gist1.md' },
            { slideIndex: 2, slideContentGist: 'gist2.md' },
          ]),
          raw_url: 'https://gist.githubusercontent.com/user/hash/raw/slides.json'
        }
      }
    }
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGistData),
    })

    const { fetchGistContent } = await import('../gistFetcher')
    const result = await fetchGistContent('https://gist.github.com/user/hash')
    
    expect(result).toEqual(mockGistData)
  })

  it('handles fetch errors gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    const { fetchGistContent } = await import('../gistFetcher')
    
    await expect(fetchGistContent('invalid-url')).rejects.toThrow('Network error')
  })

  it('fetches markdown content correctly', async () => {
    const mockContent = '# Test Slide\n\nContent here'
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockContent),
    })

    const { fetchMarkdownContent } = await import('../gistFetcher')
    const result = await fetchMarkdownContent('https://gist.githubusercontent.com/user/hash/raw/slide1.md')
    
    expect(result).toBe(mockContent)
  })

  it('parses gist URL correctly', () => {
    const { parseGistUrl } = require('../gistFetcher')
    
    expect(parseGistUrl('https://gist.github.com/user/abc123')).toBe('abc123')
    expect(parseGistUrl('https://gist.github.com/abc123')).toBe('abc123')
    expect(parseGistUrl('abc123')).toBe('abc123')
    expect(parseGistUrl('invalid-url')).toBe(null)
  })
})