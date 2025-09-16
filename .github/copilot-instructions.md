# DemystifyLLM - AI Coding Guidelines

## Architecture Overview
This is a modern React 19 + Vite + TypeScript application using cutting-edge tooling:
- **Frontend**: React 19 with TypeScript, using Vite for build tooling
- **Styling**: Tailwind CSS v4 (latest major version with new @import syntax)
- **Build**: Vite with SWC plugin for fast React refresh
- **Package Manager**: pnpm with lockfile version 10.8.1+

## Key Configuration Patterns

### Build & Development
- **Dev server**: Runs on port 4100 with `strictPort: true` and `host: '0.0.0.0'`
- **Path alias**: Use `@/` for imports from `src/` directory (configured in `vite.config.ts` and `tsconfig.json`)
- **Build command**: `pnpm run build` runs TypeScript compilation first, then Vite build

### TypeScript Setup
- **Project references**: Uses separate `tsconfig.app.json` and `tsconfig.node.json` for different environments
- **Strict mode**: Enabled with `noUnusedLocals`, `noUnusedParameters`, and other strict checks
- **Module resolution**: Bundler mode with verbatim module syntax

### Styling with Tailwind CSS v4
```css
/* src/index.css */
@import "tailwindcss";
```
- Uses new v4 syntax - no configuration file needed
- Import once in `src/index.css` for global availability

### ESLint Configuration
- **Flat config**: Uses `eslint.config.js` with modern flat config format
- **Plugins**: `typescript-eslint`, `react-hooks`, `react-refresh`
- **Ignores**: `dist/` directory automatically excluded

## Development Workflow
1. **Start dev server**: `pnpm run dev` (runs on http://localhost:4100)
2. **Build**: `pnpm run build` (includes TypeScript compilation)
3. **Lint**: `pnpm run lint` (ESLint with flat config)
4. **Preview**: `pnpm run preview` (preview built app)
5. **Deploy**: `pnpm run deploy` (builds and deploys to GitHub Pages)

## Deployment to GitHub Pages

### Automated Deployment
- **GitHub Actions**: Automatic deployment on push to `main` branch via `.github/workflows/deploy.yml`
- **Base path**: Configured for repository deployment at `/DemystifyLLM/`
- **Static assets**: Built to `dist/` directory optimized for static hosting

### Manual Deployment
```bash
# Install dependencies
pnpm install

# Build for production
pnpm run build

# Deploy to GitHub Pages
pnpm run deploy
```

### Deployment Configuration
- **Vite base path**: Dynamically set to `/DemystifyLLM/` for production builds
- **Asset optimization**: Sourcemaps disabled, manual chunks configured for better caching
- **GitHub Pages settings**: Enable Pages in repository settings, set source to GitHub Actions
- **.nojekyll file**: Prevents GitHub Pages from ignoring files starting with underscores

## Code Patterns & Conventions

### Import Aliases
```typescript
// Use @ alias for src directory
import { Component } from '@/components/Component'
import styles from '@/styles/app.css'
```

### Component Structure
- React 19 functional components with hooks
- TypeScript strict typing throughout
- CSS modules or Tailwind classes (no CSS-in-JS)

### File Organization
```
src/
├── main.tsx          # App entry point with React 19 createRoot
├── App.tsx           # Main app component
├── index.css         # Global styles with Tailwind v4 import
├── App.css           # Component-specific styles
└── assets/           # Static assets
```

## Tooling Notes
- **Vite SWC plugin**: Provides fast React refresh and TypeScript support
- **Tailwind v4**: Major version upgrade - uses `@import "tailwindcss"` instead of PostCSS
- **ESLint flat config**: Modern configuration format replacing legacy `.eslintrc`
- **TypeScript project references**: Separate compilation for app and build tools

## Common Gotchas
- Port 4100 is strictly enforced - dev server won't fallback to other ports
- Tailwind v4 requires `@import "tailwindcss"` in CSS, not PostCSS configuration
- pnpm workspace features may be used if expanding to monorepo structure