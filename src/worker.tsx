import { defineApp } from 'rwsdk/worker'
import { render, route } from 'rwsdk/router'
import TodoApp from './pages/TodoApp'
import Document from './components/Document'

export default defineApp([
  render(Document, [
    route('/', () => <h1>LiveStore + RedwoodJS SDK Integration</h1>),
    route('/todos', TodoApp),
    route('/api/status', () => 
      new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
        headers: { 'Content-Type': 'application/json' }
      })
    ),
  ]),
])