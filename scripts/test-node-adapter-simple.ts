import { makeAdapter } from '@livestore/adapter-node'
import { createStorePromise, queryDb } from '@livestore/livestore'
import { schema, events } from '../src/schema'

async function testNodeAdapter() {
  console.log('Testing LiveStore node adapter with simple queries...')
  
  try {
    // Create adapter
    const adapter = makeAdapter({
      storage: { type: 'in-memory' },
      clientId: 'test-client',
      sessionId: 'test-session',
    })
    
    console.log('✓ Adapter created successfully')
    
    // Create store
    const store = await createStorePromise({
      schema,
      adapter,
      storeId: 'test-store',
    })
    
    console.log('✓ Store created successfully')
    
    // Add some todos
    await store.commit(events.todoCreated({
      id: 'test-1',
      text: 'Test todo from node adapter',
      createdAt: Date.now(),
    }))
    
    await store.commit(events.todoCreated({
      id: 'test-2',
      text: 'Another test todo',
      createdAt: Date.now(),
    }))
    
    console.log('✓ Todos created successfully')
    
    // Try a raw SQL query
    const { Schema } = await import('@livestore/livestore')
    const todosQuery = queryDb({
      query: 'SELECT * FROM todos',
      schema: Schema.Array(Schema.Struct({
        id: Schema.String,
        text: Schema.String,
        completed: Schema.Number,
        createdAt: Schema.Number,
      })),
    })
    
    // Subscribe to get results
    const todos = await new Promise<any[]>((resolve) => {
      const unsubscribe = store.subscribe(todosQuery, {
        onUpdate: (result) => {
          resolve(result)
          unsubscribe()
        }
      })
    })
    
    console.log('✓ Todos queried successfully:')
    console.log(JSON.stringify(todos, null, 2))
    
    // Cleanup
    await store.shutdown()
    console.log('✓ Store shutdown successfully')
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

testNodeAdapter().then(() => {
  console.log('\n✅ Node adapter test completed successfully!')
  process.exit(0)
})