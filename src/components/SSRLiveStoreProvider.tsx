import { ReactNode } from 'react'
import { LiveStoreProvider, LiveStoreContext } from '@livestore/react'
import { makeAdapter } from '@livestore/adapter-node'
import { createStorePromise } from '@livestore/livestore'
import { schema, events } from '../schema'

interface Props {
  children: ReactNode
  storeId?: string
  store?: any // Pre-created store for SSR
}

// For SSR, we need to create the store before rendering
export async function createSSRStore(storeId = 'todomvc-ssr') {
  const adapter = makeAdapter({
    storage: { type: 'in-memory' },
    clientId: 'ssr-server',
    sessionId: 'ssr-session',
  })
  
  const store = await createStorePromise({
    schema,
    adapter,
    storeId,
  })
  
  // Add initial data for demo
  await store.commit(events.todoCreated({
    id: 'ssr-todo-1',
    text: 'This todo was rendered on the server!',
    createdAt: Date.now() - 60000,
  }))
  
  await store.commit(events.todoCreated({
    id: 'ssr-todo-2',
    text: 'LiveStore node adapter working with SSR',
    createdAt: Date.now() - 30000,
  }))
  
  await store.commit(events.todoToggled({
    id: 'ssr-todo-2',
    completed: true,
  }))
  
  return { store, adapter }
}

// This provider expects a pre-created store for SSR
export function SSRLiveStoreProvider({ children, store }: Props) {
  if (!store) {
    return <div>Error: Store not provided for SSR</div>
  }
  
  // Use the context directly instead of LiveStoreProvider to avoid boot phase
  // The context expects an object with stage and store
  const contextValue = {
    stage: 'running' as const,
    store,
  }
  
  return (
    <LiveStoreContext.Provider value={contextValue}>
      {children}
    </LiveStoreContext.Provider>
  )
}