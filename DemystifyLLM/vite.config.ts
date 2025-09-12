import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig, type Plugin } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss() as Plugin[], react()],
  server: {
    port: 4100,
    strictPort: true,
    host: '0.0.0.0'
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  // GitHub Pages deployment configuration
  base: process.env.NODE_ENV === 'production' ? '/DemystifyLLM/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  }
})
