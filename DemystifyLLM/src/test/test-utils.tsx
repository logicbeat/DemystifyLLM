import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'
import { store } from '../app/store'

// Test store setup
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  // Using the existing store for simplicity in tests
}

// Custom render function with providers
export function renderWithProviders(
  ui: ReactElement,
  renderOptions: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { readonly children: ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    )
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Mock slide data for testing
export const mockSlides = [
  {
    slideIndex: 1,
    slideContentGist: 'https://gist.githubusercontent.com/user/hash1/raw/content1.md',
    slideLabUrl: 'https://example.com/lab1',
  },
  {
    slideIndex: 2,
    slideContentGist: 'https://gist.githubusercontent.com/user/hash2/raw/content2.md',
  },
  {
    slideIndex: 3,
    slideContentGist: 'https://gist.githubusercontent.com/user/hash3/raw/content3.md',
    slideLabUrl: 'https://example.com/lab3',
  },
]

export const mockSlideContent = `# Test Slide

This is a test slide with **markdown** content.

- Item 1
- Item 2
- Item 3

\`\`\`javascript
console.log('Hello, world!');
\`\`\`
`

// Mock fetch responses
export function mockFetchResponse(data: any, ok = true) {
  return Promise.resolve({
    ok,
    status: ok ? 200 : 404,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(typeof data === 'string' ? data : JSON.stringify(data)),
  } as Response)
}

// Wait utility for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))