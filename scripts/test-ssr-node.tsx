import React from 'react'
import { renderToString } from 'react-dom/server'
import { SSRLiveStoreProvider, createSSRStore } from '../src/components/SSRLiveStoreProvider'
import { TodoAppNodeSSRNoCSS } from '../src/components/TodoAppNodeSSRNoCSS'

async function testSSR() {
  console.log('Testing SSR with LiveStore node adapter...\n')
  
  try {
    // Create store with initial data
    const { store } = await createSSRStore('todomvc-ssr-test')
    
    console.log('✓ Store created with initial data')
    
    // Render the app
    const App = () => (
      <SSRLiveStoreProvider store={store}>
        <TodoAppNodeSSRNoCSS />
      </SSRLiveStoreProvider>
    )
    
    console.log('✓ Rendering to HTML...')
    
    const html = renderToString(<App />)
    
    console.log('\n📄 Rendered HTML (first 800 chars):')
    console.log(html.substring(0, 800) + '...')
    
    // Check if todos are in the HTML
    const hasTodo1 = html.includes('This todo was rendered on the server!')
    const hasTodo2 = html.includes('LiveStore node adapter') && html.includes('SSR')
    const hasCompleted = html.includes('class="completed"') || html.includes('className="completed"')
    
    console.log('\n✅ Verification:')
    console.log(`  - Todo 1 rendered: ${hasTodo1 ? '✓' : '✗'}`)
    console.log(`  - Todo 2 rendered: ${hasTodo2 ? '✓' : '✗'}`)
    console.log(`  - Completed state rendered: ${hasCompleted ? '✓' : '✗'}`)
    
    // Cleanup
    await store.shutdown()
    console.log('\n✓ Store shutdown successfully')
    
    if (hasTodo1 && hasTodo2) {
      console.log('\n🎉 SSR with LiveStore node adapter works!')
    } else {
      console.error('\n❌ SSR failed - todos not found in rendered HTML')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

testSSR().then(() => {
  console.log('\n✅ SSR test completed successfully!')
  process.exit(0)
})