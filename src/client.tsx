import React from 'react'
import ReactDOM from 'react-dom/client'
import { hydrateRoot } from 'react-dom/client'

// Client-side hydration
if (typeof window !== 'undefined') {
  const root = document.getElementById('root')
  if (root && root.hasChildNodes()) {
    // SSR hydration
    hydrateRoot(root, <div />)
  } else {
    // Client-only rendering (for development)
    ReactDOM.createRoot(root!).render(<div />)
  }
}