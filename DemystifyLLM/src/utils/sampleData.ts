// Sample presentation data for testing Phase 2
// This simulates what would be fetched from a GitHub Gist

import type { PresentationData } from '../types';

// Sample markdown content for testing
const sampleMarkdownContent = {
  slide1: `# Welcome to Interactive Presentations

This is the **first slide** of our sample presentation. This system allows you to create dynamic presentations using GitHub Gists.

## Key Features

- **Markdown Content**: Write slides in simple markdown
- **Dynamic Loading**: Load presentations from GitHub Gists
- **Interactive Labs**: Embed external content via iframes
- **Modern Tech**: Built with React, Redux, and TypeScript

> "The best way to learn is by doing!" - This presentation system makes it easy to create engaging content.

Let's explore what this system can do!`,

  slide2: `# Phase 2: Gist Fetching & Markdown Rendering

We've now implemented the core functionality for loading and rendering presentations!

## What's New

\`\`\`typescript
// Fetch Gist content
const gistData = await fetchGistContent(gistUrl);
const slides = await parseSlidesFromGist(gistData);
\`\`\`

### Markdown Features Supported

- **Headers** (H1, H2, H3)
- *Italic* and **bold** text
- \`inline code\` and code blocks
- > Blockquotes
- Lists (ordered and unordered)
- [Links](https://github.com) with external opening

All content is sanitized for security and styled for presentations.`,

  slide3: `# Advanced Markdown Features

This slide demonstrates more complex markdown rendering capabilities.

## Code Example

\`\`\`javascript
function createPresentation(gistUrl) {
  const slides = await fetchGistContent(gistUrl);
  return slides.map(slide => ({
    ...slide,
    content: processMarkdown(slide.content)
  }));
}
\`\`\`

## Lists and Structure

1. **Ordered lists** work perfectly
2. With proper styling and spacing
3. Making content easy to read

- Unordered lists too
  - With nested items
  - Properly indented
- Multiple levels supported

### Important Notes

> Always validate your Gist URLs and ensure the content is publicly accessible.

This system provides a robust foundation for interactive learning experiences.`,

  slide4: `# Navigation & User Experience

## Keyboard Controls

- **Left Arrow**: Previous slide
- **Right Arrow**: Next slide
- **Home**: First slide
- **End**: Last slide

## URL-Based Navigation

Each slide has its own URL:
- \`/presentation/1\` - First slide
- \`/presentation/2\` - Second slide
- And so on...

This enables:
- **Bookmarking** specific slides
- **Sharing** links to particular content
- **Browser navigation** (back/forward buttons)

## Responsive Design

The interface adapts to different screen sizes automatically.`,

  slide5: `# Next Steps: Phase 3 & Beyond

## Coming Soon

### Phase 3: Enhanced Navigation
- Persistent control bar positioning
- Theme switching (light/dark mode)
- Advanced keyboard shortcuts

### Phase 4: Interactive Labs
- Iframe embedding for external content
- Lab resizing and positioning
- Offline content caching

### Phase 5: Polish & Testing
- Comprehensive test suite
- Performance optimizations
- Accessibility improvements

## Try It Yourself!

1. Create a GitHub Gist with a JSON array of slide definitions
2. Each slide should have \`slideIndex\` and \`slideContentGist\`
3. Load your Gist URL in this presentation system
4. Share your presentation with the world!

*Thank you for exploring the Interactive Presentation SPA!*`
};

export const samplePresentationData: PresentationData = {
  metadata: {
    title: "Interactive Presentation SPA Demo",
    author: "Development Team",
    description: "A demonstration of Phase 2: Gist fetching and markdown rendering capabilities"
  },
  slides: [
    {
      slideIndex: 1,
      slideContentGist: "data:text/markdown;base64," + btoa(sampleMarkdownContent.slide1),
      slideLabUrl: "https://example.com/lab1"
    },
    {
      slideIndex: 2,
      slideContentGist: "data:text/markdown;base64," + btoa(sampleMarkdownContent.slide2)
    },
    {
      slideIndex: 3,
      slideContentGist: "data:text/markdown;base64," + btoa(sampleMarkdownContent.slide3),
      slideLabUrl: "https://example.com/lab3"
    },
    {
      slideIndex: 4,
      slideContentGist: "data:text/markdown;base64," + btoa(sampleMarkdownContent.slide4)
    },
    {
      slideIndex: 5,
      slideContentGist: "data:text/markdown;base64," + btoa(sampleMarkdownContent.slide5)
    }
  ]
};

// Helper function to simulate loading sample data
export const loadSampleData = () => {
  return Promise.resolve(samplePresentationData);
};