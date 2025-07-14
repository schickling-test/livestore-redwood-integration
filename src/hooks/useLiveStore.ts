import { useState, useEffect, useCallback } from 'react'
import { makePersistedAdapter } from '@livestore/adapter-web'
import { createStore } from '@livestore/livestore'
import LiveStoreWorker from '../livestore.worker.ts?worker'
import LiveStoreSharedWorker from '@livestore/adapter-web/shared-worker?sharedworker'
import { schema, events } from '../schema'
import type { Todo } from '../types'

let storeInstance: Awaited<ReturnType<typeof createStore>> | null = null

export const useLiveStore = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initLiveStore = async () => {
      if (!storeInstance) {
        const adapter = makePersistedAdapter({
          storage: { type: 'opfs' },
          worker: LiveStoreWorker,
          sharedWorker: LiveStoreSharedWorker,
        })
        
        storeInstance = await createStore({
          schema,
          adapters: [adapter],
        })
      }

      // Subscribe to todos
      const unsubscribe = storeInstance.db.subscribeQuery(
        storeInstance.db.sql`SELECT * FROM todos ORDER BY createdAt DESC`,
        (results) => {
          setTodos(results as Todo[])
        }
      )

      // Initial load
      const initialTodos = await storeInstance.db.sql<Todo>`SELECT * FROM todos ORDER BY createdAt DESC`
      setTodos(initialTodos)
      setIsReady(true)

      return unsubscribe
    }

    let unsubscribe: (() => void) | undefined

    initLiveStore().then((unsub) => {
      unsubscribe = unsub
    })

    return () => {
      unsubscribe?.()
    }
  }, [])

  const addTodo = useCallback(async (title: string) => {
    if (!storeInstance) return

    await storeInstance.commit(
      events.todoCreated({
        id: crypto.randomUUID(),
        title,
        createdAt: Date.now(),
      })
    )
  }, [])

  const toggleTodo = useCallback(async (id: string) => {
    if (!storeInstance) return

    const todo = todos.find((t) => t.id === id)
    if (!todo) return

    await storeInstance.commit(
      events.todoToggled({
        id,
        completed: !todo.completed,
      })
    )
  }, [todos])

  const deleteTodo = useCallback(async (id: string) => {
    if (!storeInstance) return

    await storeInstance.commit(
      events.todoDeleted({ id })
    )
  }, [])

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    isReady,
  }
}