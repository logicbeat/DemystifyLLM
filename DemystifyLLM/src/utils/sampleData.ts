// Sample presentation data for testing Phase 1
// This simulates what would be fetched from a GitHub Gist

import type { PresentationData } from '../types';

export const samplePresentationData: PresentationData = {
  metadata: {
    title: "Sample Interactive Presentation",
    author: "Demo Author",
    description: "A demonstration of the Interactive Presentation SPA"
  },
  slides: [
    {
      slideIndex: 1,
      slideContentGist: "https://gist.github.com/sample/slide1.md",
      slideLabUrl: "https://example.com/lab1"
    },
    {
      slideIndex: 2,
      slideContentGist: "https://gist.github.com/sample/slide2.md"
    },
    {
      slideIndex: 3,
      slideContentGist: "https://gist.github.com/sample/slide3.md",
      slideLabUrl: "https://example.com/lab3"
    },
    {
      slideIndex: 4,
      slideContentGist: "https://gist.github.com/sample/slide4.md"
    },
    {
      slideIndex: 5,
      slideContentGist: "https://gist.github.com/sample/slide5.md",
      slideLabUrl: "https://example.com/lab5"
    }
  ]
};

// Helper function to simulate loading sample data
export const loadSampleData = () => {
  return Promise.resolve(samplePresentationData);
};