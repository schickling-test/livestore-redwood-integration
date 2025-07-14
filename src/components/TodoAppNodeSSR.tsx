import { useState, useMemo } from 'react'
import { useStore, useQuery } from '@livestore/react'
import { queryDb, Schema } from '@livestore/livestore'
import { events } from '../schema'
import './TodoApp.css'

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
export function TodoAppNodeSSR() {
  const { store } = useStore()
  const [newTodoText, setNewTodoText] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

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
  const completedCount = completedTodos.length
  const allCompleted = allTodos.length > 0 && remainingCount === 0

  // Event handlers
  const handleNewTodo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTodoText.trim()) {
      store.commit(
        events.todoCreated({
          id: crypto.randomUUID(),
          text: newTodoText.trim(),
          createdAt: Date.now(),
        })
      )
      setNewTodoText('')
    }
  }

  const handleToggle = (id: string, completed: boolean) => {
    store.commit(events.todoToggled({ id, completed: !completed }))
  }

  const handleToggleAll = () => {
    store.commit(events.allTodosCompleted({ completed: !allCompleted }))
  }

  const handleClearCompleted = () => {
    store.commit(events.completedTodosCleared({}))
  }

  const handleDelete = (id: string) => {
    store.commit(events.todoDeleted({ id }))
  }

  const handleStartEdit = (id: string, text: string) => {
    setEditingId(id)
    setEditText(text)
  }

  const handleSaveEdit = () => {
    if (editingId && editText.trim()) {
      store.commit(events.todoTextUpdated({ id: editingId, text: editText.trim() }))
    }
    setEditingId(null)
    setEditText('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <input
          className="new-todo"
          placeholder="What needs to be done?"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyDown={handleNewTodo}
          autoFocus
        />
      </header>

      {allTodos.length > 0 && (
        <>
          <section className="main">
            <input
              id="toggle-all"
              className="toggle-all"
              type="checkbox"
              checked={allCompleted}
              onChange={handleToggleAll}
            />
            <label htmlFor="toggle-all">Mark all as complete</label>
            
            <ul className="todo-list">
              {visibleTodos.map((todo) => (
                <li
                  key={todo.id}
                  className={[
                    todo.completed ? 'completed' : '',
                    editingId === todo.id ? 'editing' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <div className="view">
                    <input
                      className="toggle"
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggle(todo.id, todo.completed)}
                    />
                    <label onDoubleClick={() => handleStartEdit(todo.id, todo.text)}>
                      {todo.text}
                    </label>
                    <button
                      className="destroy"
                      onClick={() => handleDelete(todo.id)}
                    />
                  </div>
                  {editingId === todo.id && (
                    <input
                      className="edit"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit()
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                      autoFocus
                    />
                  )}
                </li>
              ))}
            </ul>
          </section>

          <footer className="footer">
            <span className="todo-count">
              <strong>{remainingCount}</strong> {remainingCount === 1 ? 'item' : 'items'} left
            </span>
            
            <ul className="filters">
              <li>
                <a
                  href="#/"
                  className={filter === 'all' ? 'selected' : ''}
                  onClick={() => setFilter('all')}
                >
                  All
                </a>
              </li>
              <li>
                <a
                  href="#/active"
                  className={filter === 'active' ? 'selected' : ''}
                  onClick={() => setFilter('active')}
                >
                  Active
                </a>
              </li>
              <li>
                <a
                  href="#/completed"
                  className={filter === 'completed' ? 'selected' : ''}
                  onClick={() => setFilter('completed')}
                >
                  Completed
                </a>
              </li>
            </ul>
            
            {completedCount > 0 && (
              <button
                className="clear-completed"
                onClick={handleClearCompleted}
              >
                Clear completed
              </button>
            )}
          </footer>
        </>
      )}

      <div style={{ marginTop: 20, padding: 10, background: '#f9f9f9', fontSize: 12 }}>
        <strong>SSR Status:</strong> This app is rendered on the server with real LiveStore data using the node adapter!
      </div>
    </section>
  )
}