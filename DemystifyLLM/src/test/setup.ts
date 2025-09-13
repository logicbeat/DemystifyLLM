import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'

// Global cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.location
beforeAll(() => {
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:4100',
      origin: 'http://localhost:4100',
      pathname: '/',
      search: '',
      hash: '',
      reload: vi.fn(),
      assign: vi.fn(),
      replace: vi.fn(),
    },
    writable: true,
  })
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

// Mock console.error for cleaner test output
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})