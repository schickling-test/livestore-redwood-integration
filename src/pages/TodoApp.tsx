'use client'

import React, { useState, useEffect } from 'react'
import { useLiveStore } from '../hooks/useLiveStore'
import type { Todo } from '../types'

export default function TodoApp() {
  const { todos, addTodo, toggleTodo, deleteTodo, isReady } = useLiveStore()
  const [inputValue, setInputValue] = useState('')

  const handleAddTodo = () => {
    const title = inputValue.trim()
    if (!title) return
    
    addTodo(title)
    setInputValue('')
  }

  if (!isReady) {
    return <div>Loading LiveStore...</div>
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h1>Todo App with LiveStore</h1>
      
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
          placeholder="Enter a new todo..."
          style={{ padding: 8, marginRight: 10, width: 300 }}
        />
        <button onClick={handleAddTodo} style={{ padding: 8 }}>
          Add Todo
        </button>
      </div>

      <div>
        {todos.length === 0 ? (
          <p>No todos yet. Add one above!</p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              style={{
                padding: 10,
                margin: '10px 0',
                border: '1px solid #ccc',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span
                  style={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                  }}
                >
                  {todo.title}
                </span>
              </div>
              <button onClick={() => deleteTodo(todo.id)} style={{ padding: 4 }}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}