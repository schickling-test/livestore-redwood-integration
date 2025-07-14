import { defineConfig } from 'vite'
import rwsdk from 'rwsdk/vite'

export default defineConfig({
  plugins: [rwsdk()],
  build: {
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    https: true,
  },
  optimizeDeps: {
    exclude: ['@livestore/adapter-web', '@livestore/livestore'],
  },
})
