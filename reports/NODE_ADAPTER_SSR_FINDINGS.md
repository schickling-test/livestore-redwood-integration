# LiveStore Node Adapter SSR Findings

## Executive Summary

I successfully implemented server-side rendering (SSR) with LiveStore using the node adapter (`@livestore/adapter-node`). This demonstrates that LiveStore can render data on the server, overcoming the browser-only limitations of the web adapter.

## Key Achievements

### 1. Node Adapter Works Server-Side
- Successfully used `@livestore/adapter-node` version 0.3.2-dev.10
- Created in-memory store that runs in Node.js environment
- No browser APIs required for basic functionality

### 2. Full SSR Implementation
- Server renders actual LiveStore data
- Todos are visible in the initial HTML response
- State management (completed/active) works server-side
- Events and materializers execute correctly

### 3. Verified SSR Output
```html
<li class="completed">
  <input type="checkbox" readOnly="" checked=""/>
  LiveStore node adapter working with SSR
</li>
<li class="">
  <input type="checkbox" readOnly=""/>
  This todo was rendered on the server!
</li>
```

## Technical Implementation

### Key Components

1. **SSRLiveStoreProvider**
   - Pre-creates store before rendering
   - Bypasses LiveStore's async boot phase
   - Provides proper context value with `stage: 'running'`

2. **Query Syntax Adjustment**
   - The Kysely-style syntax (`db.selectFrom`) is not available by default
   - Used raw SQL queries with Schema definitions:
   ```typescript
   const todosQuery = queryDb({
     query: 'SELECT * FROM todos ORDER BY createdAt DESC',
     schema: TodoSchema,
   })
   ```

3. **Store Creation Pattern**
   ```typescript
   const adapter = makeAdapter({
     storage: { type: 'in-memory' },
     clientId: 'ssr-server',
     sessionId: 'ssr-session',
   })
   
   const store = await createStorePromise({
     schema,
     adapter,
     storeId,
   })
   ```

## Challenges Overcome

### 1. Async Boot Phase
- **Problem**: LiveStoreProvider has an async boot phase incompatible with SSR
- **Solution**: Pre-create store and use LiveStoreContext directly

### 2. Context Requirements
- **Problem**: useStore hook expects specific context shape
- **Solution**: Provide context with `{ stage: 'running', store }`

### 3. Query Builder Syntax
- **Problem**: Kysely-style syntax not available
- **Solution**: Use raw SQL queries with Schema definitions

### 4. CSS Imports in Node
- **Problem**: CSS imports fail in Node.js
- **Solution**: Create SSR-specific components without CSS imports

## Production Considerations

### 1. State Hydration
- Server and client use different adapters (node vs web)
- Need mechanism to transfer initial state from server to client
- Current implementation recreates state on client

### 2. Storage Options
- Node adapter supports:
  - `in-memory`: Good for SSR (ephemeral)
  - `fs`: File system persistence

### 3. Session Management
- Each SSR request creates new store instance
- Consider caching stores for performance
- Session isolation important for multi-tenant apps

### 4. Performance
- Store creation overhead on each request
- Consider pre-warming stores
- Connection pooling for persistent storage

## Integration with RedwoodJS SDK

While the node adapter SSR works standalone, integrating with RedwoodJS SDK requires:

1. **Cloudflare Workers Compatibility**
   - Node adapter uses Node.js APIs (worker_threads, fs)
   - Would need Cloudflare-compatible adapter

2. **Async Rendering**
   - RedwoodJS SDK needs to support async component rendering
   - Store must be created before render begins

3. **Hybrid Approach**
   - SSR with node adapter for initial render
   - Switch to web adapter after hydration
   - Complex state synchronization required

## Recommendations

### For SSR with LiveStore

1. **Use Node Adapter for Server**
   - Works well for traditional Node.js SSR
   - Supports all LiveStore features server-side

2. **Pre-create Store**
   - Initialize store before rendering
   - Avoid async boot phase during render

3. **Consider Hybrid Architecture**
   - SSR for initial page load
   - Client-side LiveStore for interactivity
   - State transfer mechanism needed

### For Production Use

1. **Implement State Serialization**
   - Serialize server state to JSON
   - Hydrate client store with initial state

2. **Optimize Store Creation**
   - Cache stores where appropriate
   - Pre-warm common queries

3. **Handle Edge Cases**
   - Error boundaries for store failures
   - Graceful degradation without JavaScript

## Conclusion

LiveStore's node adapter successfully enables server-side rendering with real data. While this overcomes the browser-only limitations, production use requires careful consideration of state hydration, performance optimization, and the complexity of maintaining separate server/client adapters.

The successful SSR implementation proves LiveStore's flexibility and opens possibilities for:
- SEO-friendly applications
- Faster initial page loads
- Progressive enhancement strategies
- Server-side data validation

However, the mismatch between server (node adapter) and client (web adapter) architectures presents challenges that need addressing for seamless SSR integration.