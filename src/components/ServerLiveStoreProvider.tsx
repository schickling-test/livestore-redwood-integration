import { useState, useEffect, ReactNode } from 'react'
import { LiveStoreProvider } from '@livestore/react'
import { makePersistedAdapter } from '@livestore/adapter-web'
import { unstable_batchedUpdates } from 'react-dom'
import { schema } from '../schema'

interface Props {
  children: ReactNode
}

export function ServerLiveStoreProvider({ children }: Props) {
  const [isClient, setIsClient] = useState(false)
  const [adapter, setAdapter] = useState<any>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsClient(true)
    
    // Dynamic imports to avoid SSR issues
    const initializeAdapter = async () => {
      try {
        // Import workers only on client
        const { default: LiveStoreWorker } = await import('../livestore.worker?worker')
        const { default: LiveStoreSharedWorker } = await import('@livestore/adapter-web/shared-worker?sharedworker')
        
        const adapter = makePersistedAdapter({
          storage: { type: 'opfs' },
          worker: LiveStoreWorker,
          sharedWorker: LiveStoreSharedWorker,
        })
        
        setAdapter(adapter)
      } catch (err) {
        console.error('Failed to initialize LiveStore:', err)
        setError(err as Error)
      }
    }
    
    initializeAdapter()
  }, [])

  // Server-side rendering
  if (!isClient) {
    return (
      <div data-livestore-ssr="pending">
        <div style={{ padding: 20, background: '#f0f0f0' }}>
          <p>LiveStore will initialize on client...</p>
        </div>
        {children}
      </div>
    )
  }

  // Client-side error state
  if (error) {
    return (
      <div style={{ padding: 20, background: '#fee', color: '#c00' }}>
        <h3>LiveStore Initialization Error</h3>
        <pre>{error.message}</pre>
      </div>
    )
  }

  // Client-side loading state
  if (!adapter) {
    return (
      <div style={{ padding: 20, background: '#f0f0f0' }}>
        <p>Initializing LiveStore...</p>
      </div>
    )
  }

  // Client-side with adapter ready
  return (
    <LiveStoreProvider
      schema={schema}
      adapter={adapter}
      storeId="todomvc"
      batchUpdates={unstable_batchedUpdates}
    >
      {children}
    </LiveStoreProvider>
  )
}