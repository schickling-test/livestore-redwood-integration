import { NodeLiveStoreProvider } from '../components/NodeLiveStoreProvider'
import { TodoAppNodeSSR } from '../components/TodoAppNodeSSR'

export default function TodoPageNodeSSR() {
  return (
    <NodeLiveStoreProvider storeId="todomvc-node-ssr">
      <TodoAppNodeSSR />
    </NodeLiveStoreProvider>
  )
}