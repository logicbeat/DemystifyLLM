// Sample presentation data for testing Phase 2
// This simulates what would be fetched from a GitHub Gist

import type { PresentationData } from '../types';

// Helper function to safely encode Unicode strings to base64
export const encodeToBase64 = (str: string): string => {
  try {
    // Use TextEncoder for proper UTF-8 encoding
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    
    // Convert Uint8Array to binary string
    let binaryString = '';
    for (const byte of data) {
      binaryString += String.fromCharCode(byte);
    }
    
    return btoa(binaryString);
  } catch (error) {
    console.warn('Failed to encode string to base64:', error);
    // Fallback: remove problematic characters and try again
    const cleanStr = str.replace(/[^ -~]/g, ''); // Remove non-ASCII printable characters
    return btoa(cleanStr);
  }
};

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

Each slide has its own URL with query parameters:
- \`/?gistId=demo&slide=1\` - First slide
- \`/?gistId=demo&slide=2\` - Second slide
- And so on...

This enables:
- **Bookmarking** specific slides
- **Sharing** links to particular content
- **Browser navigation** (back/forward buttons)

## Responsive Design

The interface adapts to different screen sizes automatically.`,

  slide5: `# Phase 4 Complete: Interactive Labs & UI Polish!

## 🎉 What's New in Phase 4

### Interactive Labs Integration
- **Real iframe embedding** for external content
- **Lab controls**: Minimize/expand, open in new tab
- **Smart error handling** with retry functionality
- **Security features**: URL validation and sandboxing

### Enhanced User Experience
- **Smooth animations** and transitions
- **Improved dark mode** support throughout
- **Better responsive design** for all screen sizes
- **Enhanced accessibility** with proper ARIA labels

## 🔬 Try the Interactive Labs!

This slide includes a **live coding environment** where you can experiment with React and TypeScript!

### Lab Features:
- ✅ **Sandboxed execution** for security
- ✅ **Lazy loading** for performance
- ✅ **Error recovery** with user-friendly messages
- ✅ **Mobile responsive** iframe sizing

## 🚀 What's Next?

### Phase 5: Testing & Optimization
- Comprehensive test coverage
- Performance optimizations
- Final accessibility audit
- Production deployment

**Thank you for exploring our Enhanced Interactive Presentation SPA!**

*Now featuring full iframe labs integration and polished UI/UX.*`
};

export const samplePresentationData: PresentationData = {
  metadata: {
    title: "Interactive Presentation SPA Demo",
    author: "Development Team",
    description: "A demonstration of Phase 4: Labs integration and UI/UX polish"
  },
  slides: [
    {
      slideIndex: 1,
      slideContentGist: "data:text/markdown;base64," + encodeToBase64(sampleMarkdownContent.slide1),
      slideLabUrl: "https://codepen.io/team/codepen/embed/PNaGbb?default-tab=result"
    },
    {
      slideIndex: 2,
      slideContentGist: "data:text/markdown;base64," + encodeToBase64(sampleMarkdownContent.slide2)
    },
    {
      slideIndex: 3,
      slideContentGist: "data:text/markdown;base64," + encodeToBase64(sampleMarkdownContent.slide3),
      slideLabUrl: "https://replit.com/@templates/Simple-Calculator"
    },
    {
      slideIndex: 4,
      slideContentGist: "data:text/markdown;base64," + encodeToBase64(sampleMarkdownContent.slide4)
    },
    {
      slideIndex: 5,
      slideContentGist: "data:text/markdown;base64," + encodeToBase64(sampleMarkdownContent.slide5),
      slideLabUrl: "https://stackblitz.com/edit/react-ts-hello-world?embed=1&file=App.tsx"
    }
  ]
};

// Helper function to simulate loading sample data
export const loadSampleData = () => {
  return Promise.resolve(samplePresentationData);
};