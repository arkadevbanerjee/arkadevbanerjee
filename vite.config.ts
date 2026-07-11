import { defineConfig } from 'vite'

export default defineConfig({
  // Relative assets work on both the GitHub Pages project URL and the custom domain.
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
  },
})
