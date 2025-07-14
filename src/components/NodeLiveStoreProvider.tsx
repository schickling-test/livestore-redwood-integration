import { useState, useEffect, ReactNode } from 'react'
import { LiveStoreProvider } from '@livestore/react'
import { makeAdapter } from '@livestore/adapter-node'
import { unstable_batchedUpdates } from 'react-dom'
import { schema, events } from '../schema'

interface Props {
  children: ReactNode
  storeId?: string
}

// Create a singleton adapter for server-side rendering
let serverAdapter: any = null

export function NodeLiveStoreProvider({ children, storeId = 'todomvc-node-ssr' }: Props) {
  const [isClient, setIsClient] = useState(false)
  const [adapter, setAdapter] = useState<any>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsClient(true)
    
    // On client, switch to web adapter
    const initializeClientAdapter = async () => {
      try {
        // Dynamic imports to avoid SSR issues
        const { default: LiveStoreWorker } = await import('../livestore.worker?worker')
        const { default: LiveStoreSharedWorker } = await import('@livestore/adapter-web/shared-worker?sharedworker')
        const { makePersistedAdapter } = await import('@livestore/adapter-web')
        
        const clientAdapter = makePersistedAdapter({
          storage: { type: 'opfs' },
          worker: LiveStoreWorker,
          sharedWorker: LiveStoreSharedWorker,
        })
        
        setAdapter(clientAdapter)
      } catch (err) {
        console.error('Failed to initialize client LiveStore:', err)
        setError(err as Error)
      }
    }
    
    initializeClientAdapter()
  }, [])

  // Server-side or initial client render
  if (!isClient) {
    // Use node adapter for SSR - this needs to be synchronous for SSR
    // In a real app, this would be initialized once at server startup
    const nodeAdapter = serverAdapter || makeAdapter({
      storage: { type: 'in-memory' },
      clientId: 'ssr-server',
      sessionId: 'ssr-session',
    })
    
    return (
      <LiveStoreProvider
        schema={schema}
        adapter={nodeAdapter}
        storeId={storeId}
        batchUpdates={unstable_batchedUpdates}
      >
        {children}
      </LiveStoreProvider>
    )
  }

  // Client-side error state
  if (error) {
    return (
      <div style={{ padding: 20, background: '#fee', color: '#c00' }}>
        <h3>LiveStore Client Initialization Error</h3>
        <pre>{error.message}</pre>
      </div>
    )
  }

  // Client-side loading state
  if (!adapter) {
    return (
      <div style={{ padding: 20, background: '#f0f0f0' }}>
        <p>Switching to client-side LiveStore...</p>
      </div>
    )
  }

  // Client-side with web adapter ready
  return (
    <LiveStoreProvider
      schema={schema}
      adapter={adapter}
      storeId={storeId}
      batchUpdates={unstable_batchedUpdates}
    >
      {children}
    </LiveStoreProvider>
  )
}