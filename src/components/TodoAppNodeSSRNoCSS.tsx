import { useState, useMemo } from 'react'
import { useStore, useQuery } from '@livestore/react'
import { queryDb, Schema } from '@livestore/livestore'
import { events } from '../schema'

type FilterType = 'all' | 'active' | 'completed'

interface Todo {
  id: string
  text: string
  completed: number
  createdAt: number
}

// Schema for query results
const TodoSchema = Schema.Array(Schema.Struct({
  id: Schema.String,
  text: Schema.String,
  completed: Schema.Number,
  createdAt: Schema.Number,
}))

// This component works both server-side and client-side
export function TodoAppNodeSSRNoCSS() {
  const { store } = useStore()
  const [newTodoText, setNewTodoText] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  // Queries using raw SQL - these will work on both server and client
  const allTodos$ = queryDb({
    query: 'SELECT * FROM todos ORDER BY createdAt DESC',
    schema: TodoSchema,
  })
  const allTodosRaw = useQuery(allTodos$) as Todo[]
  
  const activeTodos$ = queryDb({
    query: 'SELECT * FROM todos WHERE completed = 0 ORDER BY createdAt DESC',
    schema: TodoSchema,
  })
  const activeTodosRaw = useQuery(activeTodos$) as Todo[]
  
  const completedTodos$ = queryDb({
    query: 'SELECT * FROM todos WHERE completed = 1 ORDER BY createdAt DESC',
    schema: TodoSchema,
  })
  const completedTodosRaw = useQuery(completedTodos$) as Todo[]

  // Convert completed field from number to boolean for UI
  const allTodos = allTodosRaw.map(todo => ({ ...todo, completed: todo.completed === 1 }))
  const activeTodos = activeTodosRaw.map(todo => ({ ...todo, completed: todo.completed === 1 }))
  const completedTodos = completedTodosRaw.map(todo => ({ ...todo, completed: todo.completed === 1 }))

  const visibleTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return activeTodos
      case 'completed':
        return completedTodos
      default:
        return allTodos
    }
  }, [filter, allTodos, activeTodos, completedTodos])

  const remainingCount = activeTodos.length

  return (
    <div className="todoapp">
      <header>
        <h1>todos</h1>
      </header>

      <div>
        <p>Total todos: {allTodos.length}</p>
        <p>Active: {activeTodos.length}</p>
        <p>Completed: {completedTodos.length}</p>
      </div>

      <ul>
        {visibleTodos.map((todo) => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              readOnly
            />
            {todo.text}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 20, padding: 10, background: '#f9f9f9', fontSize: 12 }}>
        <strong>SSR Status:</strong> This app is rendered on the server with real LiveStore data using the node adapter!
      </div>
    </div>
  )
}