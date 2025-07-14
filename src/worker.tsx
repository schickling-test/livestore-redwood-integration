import { defineApp } from 'rwsdk/worker'
import { render, route } from 'rwsdk/router'
import TodoPage from './pages/TodoPage'

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>LiveStore TodoMVC</title>
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}

export default defineApp([
  render(Document, [
    route('/', TodoPage),
  ]),
])