import { makePersistedAdapter } from '@livestore/adapter-web'
import LiveStoreSharedWorker from '@livestore/adapter-web/shared-worker?sharedworker'
import { makeLiveStore } from '@livestore/livestore'
// @ts-ignore - Old package without proper types
import Redwood from '@redwood.dev/client'
import { Effect, Schema } from 'effect'
import LiveStoreWorker from './livestore.worker.ts?worker'
import type { Schema as DbSchema } from './schema/index.js'

// Initialize LiveStore adapter
const adapter = makePersistedAdapter({
  storage: { type: 'opfs' },
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
})

// Create LiveStore instance
const livestore = makeLiveStore<DbSchema>([adapter])

// Todo schema
const TodoSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  completed: Schema.Boolean,
  createdAt: Schema.Number,
})

type Todo = typeof TodoSchema.Type

// Initialize the application
const initApp = Effect.gen(function* () {
  const statusEl = document.getElementById('status')
  const contentEl = document.getElementById('content')

  if (!statusEl || !contentEl) {
    return yield* Effect.die('Required DOM elements not found')
  }

  try {
    // Initialize Redwood identity
    const identity = Redwood.identity.random()
    console.log('Redwood identity created:', identity.address)

    // Create Redwood peer
    const redwoodClient = Redwood.createPeer({
      identity,
      httpHost: 'http://localhost:8080',
      rpcEndpoint: 'http://localhost:8081',
      onFoundPeersCallback: (peers: unknown[]) => {
        console.log('Found peers:', peers)
      },
    })

    // Authorize the client
    yield* Effect.promise(() => redwoodClient.authorize())
    console.log('Redwood client authorized')

    // Subscribe to a state URI for todo sync
    const stateURI = 'livestore-demo.com/todos'
    yield* Effect.promise(() => redwoodClient.rpc.subscribe({ stateURI }))
    console.log('Subscribed to state URI:', stateURI)

    statusEl.textContent = 'Connected to LiveStore and Redwood Protocol!'

    // Create UI elements
    const inputContainer = document.createElement('div')
    inputContainer.innerHTML = `
      <input type="text" id="todoInput" placeholder="Enter a new todo..." />
      <button id="addTodo">Add Todo</button>
      <button id="syncRedwood">Sync with Redwood</button>
      <hr />
      <div id="todoList"></div>
    `
    contentEl.appendChild(inputContainer)

    const todoInput = document.getElementById('todoInput') as HTMLInputElement
    const addButton = document.getElementById('addTodo') as HTMLButtonElement
    const syncButton = document.getElementById('syncRedwood') as HTMLButtonElement
    const todoList = document.getElementById('todoList') as HTMLDivElement

    // Function to render todos
    const renderTodos = async () => {
      const todos = await livestore.sql<Todo>`SELECT * FROM todos ORDER BY createdAt DESC`

      todoList.innerHTML = todos
        .map(
          (todo) => `
        <div style="margin: 10px 0; padding: 10px; border: 1px solid #ccc;">
          <input type="checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}" />
          <span style="${todo.completed ? 'text-decoration: line-through;' : ''}">${todo.title}</span>
          <button data-delete-id="${todo.id}" style="margin-left: 10px;">Delete</button>
        </div>
      `,
        )
        .join('')
    }

    // Function to sync todos with Redwood
    const syncWithRedwood = async () => {
      const todos = await livestore.sql<Todo>`SELECT * FROM todos`

      // Create a transaction to update the Redwood state
      const tx = {
        stateURI,
        id: Redwood.utils.randomID(),
        parents: [], // In a real app, this would track parent transactions
        patches: [`.todos = ${Redwood.utils.JSON.stringify(todos)}`],
      }

      try {
        await redwoodClient.put(tx)
        console.log('Synced todos to Redwood:', tx)
        statusEl.textContent = 'Synced with Redwood Protocol!'
        setTimeout(() => {
          statusEl.textContent = 'Connected to LiveStore and Redwood Protocol!'
        }, 2000)
      } catch (error) {
        console.error('Error syncing with Redwood:', error)
        statusEl.textContent = `Sync error: ${(error as Error).message}`
      }
    }

    // Add todo function
    const addTodo = async () => {
      const title = todoInput.value.trim()
      if (!title) return

      const todo: Todo = {
        id: crypto.randomUUID(),
        title,
        completed: false,
        createdAt: Date.now(),
      }

      // Insert into LiveStore
      await livestore.sql`INSERT INTO todos ${livestore.insertValues([todo])}`

      todoInput.value = ''
      await renderTodos()
    }

    // Toggle todo completion
    todoList.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement
      if (target.type === 'checkbox') {
        const id = target.dataset.id
        if (!id) return
        const completed = target.checked ? 1 : 0

        await livestore.sql`UPDATE todos SET completed = ${completed} WHERE id = ${id}`
        await renderTodos()
      }
    })

    // Delete todo
    todoList.addEventListener('click', async (e) => {
      const target = e.target as HTMLButtonElement
      const deleteId = target.dataset.deleteId
      if (deleteId) {
        await livestore.sql`DELETE FROM todos WHERE id = ${deleteId}`
        await renderTodos()
      }
    })

    // Add event listeners
    addButton.addEventListener('click', addTodo)
    syncButton.addEventListener('click', syncWithRedwood)
    todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addTodo()
    })

    // Subscribe to LiveStore updates
    livestore.subscribeQuery(livestore.sql`SELECT * FROM todos`, () => {
      renderTodos()
    })

    // Initial render
    renderTodos()

    // Expose for testing
    window.livestore = livestore
    window.redwood = redwoodClient
  } catch (error) {
    console.error('Error initializing:', error)
    statusEl.textContent = `Error: ${(error as Error).message}`
  }
})

// Run the application
Effect.runPromise(initApp).catch(console.error)
