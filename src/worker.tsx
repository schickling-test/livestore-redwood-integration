import { defineApp } from 'rwsdk/worker'
import { render, route } from 'rwsdk/router'
import TodoPage from './pages/TodoPage'
import TodoPageDebug from './pages/TodoPageDebug'

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>LiveStore TodoMVC</title>
        <link rel="modulepreload" href="/src/client.tsx" />
      </head>
      <body>
        <div id="root">{children}</div>
        <script>import("/src/client.tsx")</script>
      </body>
    </html>
  )
}

export default defineApp([
  render(Document, [
    route('/', TodoPageDebug),
    route('/todo', TodoPage),
    route('/ssr', async () => {
      // Dynamically import to avoid issues during worker initialization
      const { default: TodoPageSSR } = await import('./pages/TodoPageSSR')
      return <TodoPageSSR />
    }),
    route('/node-ssr', async () => {
      // Node adapter SSR - with actual server-side data
      const { default: TodoPageNodeSSR } = await import('./pages/TodoPageNodeSSR')
      return <TodoPageNodeSSR />
    }),
  ]),
])