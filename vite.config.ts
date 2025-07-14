import { defineConfig } from 'vite'
import { redwood } from 'rwsdk/vite'

export default defineConfig({
  plugins: [redwood()],
  server: {
    port: 3000,
    https: true,
  },
  optimizeDeps: {
    exclude: ['@livestore/adapter-web', '@livestore/livestore'],
  },
})