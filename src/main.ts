import { makePersistedAdapter } from '@livestore/adapter-web'
import LiveStoreSharedWorker from '@livestore/adapter-web/shared-worker?sharedworker'
import { makeLiveStore } from '@livestore/livestore'
import { Effect, Schema } from 'effect'
import LiveStoreWorker from './livestore.worker.ts?worker'
import type { Schema as DbSchema } from './schema/index.js'

// Mock RedwoodClient for demonstration
const RedwoodClient = {
  default: async (config: { indexedDBName: string; secure: boolean }) => {
    console.log('Initializing mock RedwoodClient with config:', config)
    const stateGroups = new Map<string, Map<string, string>>()

    return {
      getOrCreateStateGroup: async (name: string) => {
        if (!stateGroups.has(name)) {
          stateGroups.set(name, new Map())
        }
        const group = stateGroups.get(name)
        if (!group) throw new Error(`StateGroup ${name} not found`)

        return {
          set: async (key: string, value: string) => {
            group.set(key, value)
            console.log(`RedwoodClient: Set ${key} in ${name}`)
          },
          get: async (key: string) => group.get(key),
          delete: async (key: string) => {
            group.delete(key)
            console.log(`RedwoodClient: Deleted ${key} from ${name}`)
          },
        }
      },
    }
  },
}

// Initialize LiveStore adapter
const adapter = makePersistedAdapter({
  storage: { type: 'opfs' },
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
})

// Create LiveStore instance
const livestore = makeLiveStore<DbSchema>([adapter])

// Todo schema for RedwoodSDK
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
    // Initialize RedwoodSDK client
    const redwood = yield* Effect.promise(() =>
      RedwoodClient.default({
        indexedDBName: 'redwood-livestore-demo',
        secure: false,
      }),
    )

    // Create a stategroup for todos
    const todosStategroup = yield* Effect.promise(() => redwood.getOrCreateStateGroup('todos'))

    statusEl.textContent = 'Connected to LiveStore and RedwoodSDK!'

    // Create UI elements
    const inputContainer = document.createElement('div')
    inputContainer.innerHTML = `
      <input type="text" id="todoInput" placeholder="Enter a new todo..." />
      <button id="addTodo">Add Todo</button>
      <hr />
      <div id="todoList"></div>
    `
    contentEl.appendChild(inputContainer)

    const todoInput = document.getElementById('todoInput') as HTMLInputElement
    const addButton = document.getElementById('addTodo') as HTMLButtonElement
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

      // Also sync with RedwoodSDK
      for (const todo of todos) {
        await todosStategroup.set(todo.id, JSON.stringify(todo))
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

      // Sync with RedwoodSDK
      await todosStategroup.set(todo.id, JSON.stringify(todo))

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

        // Update in RedwoodSDK
        const [todo] = await livestore.sql<Todo>`SELECT * FROM todos WHERE id = ${id}`
        if (todo) {
          await todosStategroup.set(id, JSON.stringify(todo))
        }

        await renderTodos()
      }
    })

    // Delete todo
    todoList.addEventListener('click', async (e) => {
      const target = e.target as HTMLButtonElement
      const deleteId = target.dataset.deleteId
      if (deleteId) {
        await livestore.sql`DELETE FROM todos WHERE id = ${deleteId}`
        await todosStategroup.delete(deleteId)
        await renderTodos()
      }
    })

    // Add event listeners
    addButton.addEventListener('click', addTodo)
    todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addTodo()
    })

    // Subscribe to LiveStore updates
    livestore.subscribeQuery(livestore.sql`SELECT * FROM todos`, () => {
      renderTodos()
    })

    // Initial render
    renderTodos()

    // Log some info
    console.log('LiveStore initialized:', livestore)
    console.log('RedwoodSDK initialized:', redwood)

    // Expose for testing
    window.livestore = livestore
    window.redwood = redwood
  } catch (error) {
    console.error('Error initializing:', error)
    statusEl.textContent = `Error: ${(error as Error).message}`
  }
})

// Run the application
Effect.runPromise(initApp).catch(console.error)
