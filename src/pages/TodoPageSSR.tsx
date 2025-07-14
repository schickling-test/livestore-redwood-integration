import { ServerLiveStoreProvider } from '../components/ServerLiveStoreProvider'
import { TodoAppSSR } from '../components/TodoAppSSR'

export default function TodoPageSSR() {
  return (
    <ServerLiveStoreProvider>
      <TodoAppSSR />
    </ServerLiveStoreProvider>
  )
}