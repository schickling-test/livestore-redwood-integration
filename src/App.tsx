import { LiveStoreProvider } from '@livestore/react'
import { makePersistedAdapter } from '@livestore/adapter-web'
import { unstable_batchedUpdates } from 'react-dom'
import LiveStoreWorker from './livestore.worker?worker'
import LiveStoreSharedWorker from '@livestore/adapter-web/shared-worker?sharedworker'
import { schema } from './schema'
import { TodoApp } from './components/TodoApp'

const adapter = makePersistedAdapter({
  storage: { type: 'opfs' },
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
})

export function App() {
  return (
    <LiveStoreProvider
      schema={schema}
      adapter={adapter}
      storeId="todomvc"
      batchUpdates={unstable_batchedUpdates}
    >
      <TodoApp />
    </LiveStoreProvider>
  )
}