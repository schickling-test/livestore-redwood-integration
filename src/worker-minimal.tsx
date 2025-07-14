import { defineApp } from 'rwsdk/worker'

export default defineApp([
  (request) => {
    console.log('[Worker] Received request:', request.url)
    return new Response('Hello from worker!', {
      headers: { 'Content-Type': 'text/plain' },
    })
  },
])