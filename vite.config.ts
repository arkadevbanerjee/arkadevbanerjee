import { defineConfig } from 'vite'

export default defineConfig({
  // Custom domain: served at https://arkadevbanerjee.is-a.dev/
  base: '/',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
  },
})
