import { defineConfig } from 'vite'

export default defineConfig({
  // Project page: served at https://arkadevbanerjee.github.io/arkadevbanerjee/
  base: '/arkadevbanerjee/',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
  },
})
