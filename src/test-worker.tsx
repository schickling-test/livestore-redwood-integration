import { defineApp } from 'rwsdk/worker'
import { render, route } from 'rwsdk/router'

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Test</title>
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}

function HomePage() {
  return <h1>Hello from RedwoodJS SDK!</h1>
}

export default defineApp([
  render(Document, [
    route('/', HomePage),
  ]),
])