# Interactive Presentation SPA Specification Document

## Overview
This specification outlines the requirements for a Single Page Application (SPA) template designed to create interactive presentations on the fly. The application will dynamically load presentation content from user-provided GitHub Gists, allowing for flexible, content-driven presentations without hardcoding slides. Each presentation consists of slides with optional interactive labs, rendered via iframes. The app will support adjustable slide controls, URL-based navigation, and persistent user preferences.

The primary goal is to provide a reusable template for educators, presenters, or developers to build presentations by simply providing a GitHub Gist URL containing the slide structure and content.

## Functional Requirements

### 1. Presentation Loading and Structure
- **Input Mechanism**: The application must accept a GitHub Gist URL as input. This Gist should contain a JSON array of slide objects.
- **Slide Object Structure**:
  ```typescript
  class Slide {
    slideIndex: number;  // Unique index for the slide (e.g., 1, 2, 3...)
    slideContentGist: string;  // URL to a GitHub Gist containing a .md file with the slide's markdown content
    slideLabUrl?: string;  // Optional URL to a cloud-hosted lab (rendered in an iframe)
  }
  ```
- **Content Rendering**:
  - Fetch and render the markdown content from `slideContentGist` within each slide.
  - If `slideLabUrl` is provided, render it as an embedded iframe within the slide.
  - Support standard markdown features (headings, lists, links, images, code blocks) for slide content.
- **Dynamic Loading**: On app initialization or when a new Gist URL is provided, fetch the slide array, parse it, and build the presentation dynamically.
- **Error Handling**: Gracefully handle invalid Gist URLs, malformed JSON, or inaccessible content (e.g., display error messages like "Failed to load slide content").

### 2. Slide Navigation and Controls
- **Navigation Controls**: A fixed bar (position adjustable by the user) containing:
  - Previous slide button
  - Next slide button
  - Current slide number display (e.g., "Slide 3 of 10")
  - First slide button
  - Last slide button
- **URL Integration**: Use React Router to reflect the current slide in the browser URL (e.g., `/presentation/3` for slide 3). This allows bookmarking, sharing, and browser back/forward navigation.
- **Keyboard Shortcuts**: Support arrow keys for navigation (left for previous, right for next).
- **Edge Case Handling**: Disable "Previous" on the first slide and "Next" on the last slide. Wrap around or stay at edges as per user preference (configurable).

### 3. User Experience and Design
- **Slide Layout**:
  - Full-screen slides with centered content.
  - Markdown content rendered in a readable format (e.g., using a markdown parser library).
  - Labs (iframes) displayed below or alongside the content, with adjustable sizing.
- **Control Bar Positioning**: The navigation bar can be positioned at the top, bottom, left, or right of the screen. The user's chosen position must be saved to localStorage and restored on app reload.
- **Responsiveness**: Ensure the layout adapts to mobile and tablet devices (e.g., stack controls vertically on small screens).
- **Theming**: Basic Tailwind-based styling with options for light/dark mode (stored in localStorage).
- **Accessibility**: Keyboard navigation, screen reader support for controls and content, and high-contrast options.
- **Loading States**: Show spinners or placeholders while fetching Gist content.

### 4. State Management
- **Redux Toolkit Usage**:
  - Store the slide array, current slide index, control bar position, and theme preferences.
  - Actions for loading slides, navigating, and updating preferences.
  - Selectors for accessing current slide data and UI state.
- **Persistence**: Use localStorage for user preferences (e.g., control bar position, theme). Slide data can be cached temporarily for performance.

### 5. Additional Features
- **Presentation Metadata**: Optionally include fields in the Gist for presentation title, author, or description, displayed in the app header.
- **Export/Share**: Allow exporting the current slide URL or generating a shareable link to the entire presentation.
- **Offline Support**: Cache fetched markdown and iframe content for offline viewing (using service workers if feasible).
- **Customization**: Allow users to override default styles via a settings panel.

## Technical Requirements

### 1. Technology Stack
- **Frontend Framework**: React 19 with TypeScript for type safety.
- **Build Tool**: Vite for fast development and building.
- **Styling**: Tailwind CSS for utility-first styling.
- **Routing**: React Router for URL-based slide navigation.
- **State Management**: Redux Toolkit for predictable state handling.
- **Markdown Rendering**: A library like `react-markdown` or `marked` to parse and render .md files.
- **HTTP Requests**: Fetch API or Axios for loading Gist content.
- **Deployment**: GitHub Pages (as per existing `pnpm run deploy` script).

### 2. Architecture
- **Component Structure**:
  - `App`: Root component with Redux provider and router setup.
  - `PresentationLoader`: Handles Gist input and slide fetching.
  - `SlideViewer`: Renders the current slide's content and lab.
  - `NavigationBar`: Fixed bar with controls, position managed via CSS classes and localStorage.
  - `SettingsPanel`: For adjusting preferences (position, theme).
- **Data Flow**:
  - User inputs Gist URL → Fetch JSON array → Store in Redux → Render slides via React Router.
  - Navigation updates Redux state and URL.
- **File Structure** (Proposed):
  ```
  src/
    components/
      NavigationBar.tsx
      SlideViewer.tsx
      PresentationLoader.tsx
      SettingsPanel.tsx
    store/
      slidesSlice.ts
      preferencesSlice.ts
    utils/
      gistFetcher.ts
      markdownRenderer.ts
    App.tsx
    main.tsx
  ```

### 3. Performance and Security
- **Optimization**: Lazy-load slides and labs to reduce initial load time.
- **Security**: Sanitize markdown content to prevent XSS. Validate iframe URLs to ensure they are from trusted domains.
- **Caching**: Use browser caching for Gist requests; implement retry logic for failed fetches.
- **Testing**: Unit tests for components and Redux logic; integration tests for navigation and content loading.

### 4. Dependencies
- Core: React, React DOM, React Router, Redux Toolkit.
- Additional: react-markdown, axios (optional), tailwindcss.
- Dev: Existing ESLint, TypeScript setup.

## Implementation Plan
1. **Phase 1**: Set up basic component skeleton.
2. **Phase 2**: Implement Gist fetching and markdown rendering.
3. **Phase 3**: Add navigation controls with localStorage persistence.
4. **Phase 4**: Integrate labs (iframes) and polish UI/UX.
5. **Phase 5**: Testing, optimization, and deployment.

## Assumptions and Constraints
- GitHub Gists are publicly accessible (no authentication required).
- Markdown content is well-formed and does not exceed reasonable size limits.
- Labs are hosted externally and compatible with iframe embedding.
- The app runs in modern browsers supporting ES modules and localStorage.

This specification provides a complete blueprint for the SPA. Once approved, we can proceed to implementation, starting with code scaffolding and iterative development. Let me know if any sections need clarification or expansion!