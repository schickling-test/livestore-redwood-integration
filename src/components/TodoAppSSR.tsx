import { useState, useMemo, useEffect } from 'react'
import { useStore, useQuery } from '@livestore/react'
import { queryDb } from '@livestore/livestore'
import { events } from '../schema'
import './TodoApp.css'

type FilterType = 'all' | 'active' | 'completed'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

// Component that can render on server (without LiveStore)
export function TodoAppShell() {
  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <input
          className="new-todo"
          placeholder="What needs to be done?"
          disabled
          autoFocus
        />
      </header>
      <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
        <p>Loading todos...</p>
      </div>
    </section>
  )
}

// Component that uses LiveStore (client-only)
export function TodoAppWithStore() {
  const { store } = useStore()
  const [newTodoText, setNewTodoText] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  // Queries
  const allTodos$ = queryDb((db: any) => db.selectFrom('todos').selectAll())
  const allTodos = useQuery(allTodos$) as Todo[]
  
  const activeTodos$ = queryDb((db: any) => 
    db.selectFrom('todos').selectAll().where('completed', '=', false)
  )
  const activeTodos = useQuery(activeTodos$) as Todo[]
  
  const completedTodos$ = queryDb((db: any) => 
    db.selectFrom('todos').selectAll().where('completed', '=', true)
  )
  const completedTodos = useQuery(completedTodos$) as Todo[]

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
    </section>
  )
}

// Main component that handles SSR gracefully
export function TodoAppSSR() {
  // Use a different approach - check if we're in the browser
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // During SSR or before LiveStore is ready
  if (!isMounted) {
    return <TodoAppShell />
  }

  // After mount, try to use LiveStore
  return <TodoAppWithStoreWrapper />
}

// Wrapper to safely use useStore hook
function TodoAppWithStoreWrapper() {
  try {
    // This will only work if we're inside LiveStoreProvider
    return <TodoAppWithStore />
  } catch (e) {
    // Still loading LiveStore
    return <TodoAppShell />
  }
}