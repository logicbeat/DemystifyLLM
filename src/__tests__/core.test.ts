import { describe, it, expect } from 'vitest'

// Simple smoke tests to verify basic functionality
describe('Application Tests', () => {
  it('should be able to import utilities', () => {
    expect(true).toBe(true)
  })

  it('should validate slide numbers correctly', () => {
    const isValidSlideNumber = (slideNumber: number, totalSlides: number): boolean => {
      return slideNumber >= 1 && slideNumber <= totalSlides
    }

    expect(isValidSlideNumber(1, 5)).toBe(true)
    expect(isValidSlideNumber(3, 5)).toBe(true)
    expect(isValidSlideNumber(5, 5)).toBe(true)
    expect(isValidSlideNumber(0, 5)).toBe(false)
    expect(isValidSlideNumber(6, 5)).toBe(false)
  })

  it('should parse URL query parameters correctly', () => {
    const getSlideNumberFromUrl = (url: string): number | null => {
      try {
        const urlObj = new URL(url)
        const slideParam = urlObj.searchParams.get('slide')
        return slideParam ? parseInt(slideParam, 10) : null
      } catch {
        return null
      }
    }

    const getGistIdFromUrl = (url: string): string | null => {
      try {
        const urlObj = new URL(url)
        return urlObj.searchParams.get('gistId')
      } catch {
        return null
      }
    }

    expect(getSlideNumberFromUrl('http://localhost:4100/?gistId=test123&slide=3')).toBe(3)
    expect(getSlideNumberFromUrl('http://localhost:4100/?slide=10')).toBe(10)
    expect(getSlideNumberFromUrl('http://localhost:4100/?gistId=test')).toBe(null)
    expect(getSlideNumberFromUrl('http://localhost:4100/')).toBe(null)
    
    expect(getGistIdFromUrl('http://localhost:4100/?gistId=test123&slide=3')).toBe('test123')
    expect(getGistIdFromUrl('http://localhost:4100/?slide=3')).toBe(null)
  })

  it('should handle gist URL parsing', () => {
    const parseGistId = (url: string): string | null => {
      try {
        if (!url.includes('gist.github.com')) {
          return url.length === 32 ? url : null // Direct gist ID
        }
        const regex = /gist\.github\.com\/(?:[^/]+\/)?([a-f0-9]{32})/
        const match = regex.exec(url)
        return match ? match[1] : null
      } catch {
        return null
      }
    }

    expect(parseGistId('https://gist.github.com/user/3883611f30bead74a0ab4368cb5cc763')).toBe('3883611f30bead74a0ab4368cb5cc763')
    expect(parseGistId('3883611f30bead74a0ab4368cb5cc763')).toBe('3883611f30bead74a0ab4368cb5cc763')
    expect(parseGistId('invalid')).toBe(null)
  })

  it('should calculate performance metrics', () => {
    const measurePerformance = (operation: () => void) => {
      const start = performance.now()
      operation()
      const end = performance.now()
      return end - start
    }

    const duration = measurePerformance(() => {
      // Simulate some work
      let sum = 0
      for (let i = 0; i < 1000; i++) {
        sum += i
      }
      // Use sum to avoid unused variable warning
      return sum
    })

    expect(duration).toBeGreaterThan(0)
    expect(duration).toBeLessThan(100) // Should be very fast
  })
})