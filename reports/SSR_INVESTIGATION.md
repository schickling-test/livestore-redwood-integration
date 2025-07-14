# LiveStore SSR Investigation Report

## Core Issues for SSR with LiveStore

### 1. Browser-Only APIs

LiveStore depends on browser-only APIs that are not available in server environments:

#### 1.1 Web Workers
- **Required for**: Running SQLite WASM in a separate thread
- **SSR Issue**: `Worker` constructor doesn't exist in Node.js or Cloudflare Workers
- **Impact**: Cannot initialize LiveStore adapter

#### 1.2 SharedWorker
- **Required for**: Cross-tab synchronization
- **SSR Issue**: `SharedWorker` is browser-only
- **Impact**: Cannot enable multi-tab features

#### 1.3 OPFS (Origin Private File System)
- **Required for**: Persistent storage
- **SSR Issue**: File system APIs are browser-specific
- **Impact**: Cannot persist data on server

#### 1.4 IndexedDB
- **Required for**: Alternative storage backend
- **SSR Issue**: Not available in server environments
- **Impact**: No server-side storage option

### 2. SQLite WASM Architecture

LiveStore uses SQLite compiled to WebAssembly:

```javascript
// This happens in the worker
import sqliteWasm from '@wa-sqlite/wa-sqlite.wasm?url'
```

**SSR Issues**:
- WASM modules need special handling in workers
- Memory management is browser-specific
- Cannot share memory between server and client

### 3. LiveStore Initialization Flow

Current flow:
1. Create adapter with Worker/SharedWorker
2. Initialize SQLite in worker
3. Set up storage (OPFS/IndexedDB)
4. Create reactive queries

**SSR Incompatibility**:
- Steps 1-3 fail immediately on server
- No server-side adapter implementation

### 4. React Context Issues

LiveStore uses React Context:
```javascript
<LiveStoreProvider adapter={adapter}>
```

**SSR Problem**:
- Provider needs initialized adapter
- Adapter can't be created on server
- Context value would be undefined

## Potential Solutions for PoC

### Solution 1: Client-Only Rendering

```javascript
// In the worker
export default defineApp([
  route('/', () => {
    // Don't render React on server
    return new Response(clientOnlyHTML, {
      headers: { 'Content-Type': 'text/html' }
    })
  })
])
```

**Pros**: Simple, works immediately
**Cons**: No SSR benefits

### Solution 2: Conditional Initialization

```javascript
function LiveStoreWrapper({ children }) {
  const [adapter, setAdapter] = useState(null)
  
  useEffect(() => {
    // Initialize LiveStore only on client
    const adapter = makePersistedAdapter({ /* ... */ })
    setAdapter(adapter)
  }, [])
  
  if (!adapter) {
    return <div>Loading...</div>
  }
  
  return (
    <LiveStoreProvider adapter={adapter}>
      {children}
    </LiveStoreProvider>
  )
}
```

**Pros**: Allows partial SSR
**Cons**: Hydration mismatch, no data on server

### Solution 3: Mock Server Adapter

Create a server-compatible adapter that:
- Returns empty data during SSR
- Initializes real adapter on client
- Handles hydration gracefully

```javascript
class ServerAdapter {
  async query() {
    return [] // Empty results on server
  }
}

const adapter = typeof window !== 'undefined' 
  ? makePersistedAdapter({ /* ... */ })
  : new ServerAdapter()
```

**Pros**: No hydration errors
**Cons**: Complex implementation, no server data

### Solution 4: Dual Architecture

Separate server and client state:
- Server: Traditional database (D1, PostgreSQL)
- Client: LiveStore for local state
- Sync between them post-hydration

**Pros**: True SSR with data
**Cons**: Complex architecture, sync challenges

## Technical Requirements for True SSR

To make LiveStore work with SSR, we would need:

1. **Server-Compatible Storage**
   - Replace OPFS with server file system
   - Or use in-memory SQLite

2. **Worker Polyfills**
   - Mock Worker API for server
   - Handle WASM loading differently

3. **Isomorphic SQLite**
   - Server-side SQLite implementation
   - Consistent API with client version

4. **State Transfer**
   - Serialize server state
   - Hydrate client with same data

5. **Adapter Abstraction**
   ```javascript
   interface UniversalAdapter {
     // Works on both server and client
     query<T>(sql: string): Promise<T[]>
     subscribe(callback: () => void): () => void
   }
   ```

## Recommendations for PoC

### Minimal PoC (Client-Only)
1. Use RedwoodJS SDK for routing only
2. Render static HTML shell on server
3. Initialize LiveStore entirely on client
4. No SSR for data

### Advanced PoC (Hybrid)
1. Create `ServerLiveStoreProvider` that:
   - Returns loading state on server
   - Initializes real LiveStore on client
   - Handles hydration carefully
2. Use `Suspense` boundaries
3. Progressive enhancement approach

### Code Example for Hybrid PoC

```javascript
// ServerLiveStoreProvider.tsx
export function ServerLiveStoreProvider({ children }) {
  const [isClient, setIsClient] = useState(false)
  const [adapter, setAdapter] = useState(null)
  
  useEffect(() => {
    setIsClient(true)
    const adapter = makePersistedAdapter({
      storage: { type: 'opfs' },
      worker: LiveStoreWorker,
      sharedWorker: LiveStoreSharedWorker,
    })
    setAdapter(adapter)
  }, [])
  
  // Server: render without LiveStore
  if (!isClient) {
    return (
      <div data-livestore-ssr="pending">
        {children}
      </div>
    )
  }
  
  // Client: wait for adapter
  if (!adapter) {
    return <div>Initializing LiveStore...</div>
  }
  
  // Client: full LiveStore
  return (
    <LiveStoreProvider adapter={adapter}>
      {children}
    </LiveStoreProvider>
  )
}
```

## Conclusion

LiveStore's architecture is fundamentally incompatible with traditional SSR due to its reliance on browser-specific APIs (Workers, OPFS, IndexedDB). 

For a PoC integration with RedwoodJS SDK:
1. **Short term**: Use client-only rendering for LiveStore components
2. **Medium term**: Implement hybrid approach with loading states
3. **Long term**: Would require significant LiveStore changes to support SSR

The core challenge is that LiveStore is designed as a client-first database, while SSR expects data to be available on the server. These paradigms are difficult to reconcile without major architectural changes to either system.