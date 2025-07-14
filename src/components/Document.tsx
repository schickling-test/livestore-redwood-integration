import React from 'react'

export default function Document({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>LiveStore + RedwoodJS SDK</title>
        <script src="/src/client.tsx" type="module" />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}