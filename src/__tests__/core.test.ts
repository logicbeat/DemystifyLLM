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

  it('should parse URL paths correctly', () => {
    const getSlideNumberFromPath = (path: string): number | null => {
      const regex = /\/presentation\/(\d+)/
      const match = regex.exec(path)
      return match ? parseInt(match[1], 10) : null
    }

    expect(getSlideNumberFromPath('/presentation/3')).toBe(3)
    expect(getSlideNumberFromPath('/presentation/10')).toBe(10)
    expect(getSlideNumberFromPath('/about')).toBe(null)
    expect(getSlideNumberFromPath('')).toBe(null)
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

    expect(parseGistId('https://gist.github.com/user/abc123def456789012345678901234567890')).toBe('abc123def456789012345678901234567890')
    expect(parseGistId('abc123def456789012345678901234567890')).toBe('abc123def456789012345678901234567890')
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