# DemystifyLLM

A modern React 19 single-page application built with Vite, TypeScript, and Tailwind CSS v4. This project is configured for static deployment to GitHub Pages.

## 🚀 Features

- **React 19** with modern hooks and concurrent features
- **TypeScript** with strict type checking
- **Vite** for fast development and optimized builds
- **Tailwind CSS v4** for utility-first styling
- **ESLint** with flat config and React-specific rules
- **GitHub Pages** deployment with automated CI/CD

## 🛠️ Development

### Prerequisites
- Node.js 20+
- pnpm 10.8.1+

### Setup
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The development server will run at `http://localhost:4100`.

### Available Scripts
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run lint` - Run ESLint
- `pnpm run preview` - Preview production build
- `pnpm run deploy` - Build and deploy to GitHub Pages

## 🚀 Deployment

This project is configured for automatic deployment to GitHub Pages:

### Automated Deployment
Push to the `main` branch to trigger automatic deployment via GitHub Actions.

### Manual Deployment
```bash
pnpm run deploy
```

### GitHub Pages Setup
1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions"
4. The app will be available at `https://[username].github.io/DemystifyLLM/`

## 🏗️ Build Configuration

- **Base Path**: Automatically configured for GitHub Pages deployment
- **Asset Optimization**: Sourcemaps disabled for production
- **TypeScript**: Project references for separate app/node compilation
- **ESLint**: Flat config with React hooks and refresh plugins

## 📁 Project Structure

```
src/
├── main.tsx          # Application entry point
├── App.tsx           # Main React component
├── index.css         # Global styles with Tailwind
├── App.css           # Component styles
└── assets/           # Static assets
```

## 🔧 Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS 4
- **Linting**: ESLint with flat config
- **Package Manager**: pnpm
- **Deployment**: GitHub Pages
