import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    https: true,
  },
  optimizeDeps: {
    exclude: ['@livestore/adapter-web'],
  },
})
