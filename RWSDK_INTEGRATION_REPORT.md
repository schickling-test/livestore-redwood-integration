# RedwoodJS SDK + LiveStore Integration Report

## Executive Summary

This report documents the attempt to integrate LiveStore (v0.3.2-dev.10) with RedwoodJS SDK (rwsdk v0.1.15). While both are innovative frameworks, there are significant challenges in integrating them due to architectural differences and API changes in the LiveStore development version.

## Integration Status: **Partially Blocked**

The integration faces challenges due to:
1. LiveStore API changes in the dev version
2. Architectural mismatch between server-first RedwoodJS SDK and client-first LiveStore
3. Documentation gaps for the LiveStore dev version

## Key Findings

### 1. RedwoodJS SDK Architecture

RedwoodJS SDK (rwsdk) is a React framework for Cloudflare Workers that focuses on:
- Server-side rendering (SSR)
- React Server Components (RSC)
- Server Functions
- Edge runtime on Cloudflare Workers
- Everything is "server-first by default"

### 2. LiveStore Architecture

LiveStore is a client-centric data layer with:
- Local-first SQLite database
- Event sourcing for state management
- Cross-tab synchronization via SharedWorkers
- Optional sync backend
- Reactive queries

### 3. Integration Challenges

#### 3.1 API Changes in LiveStore Dev Version
The LiveStore v0.3.2-dev.10 has significant API changes from the stable version:
- `makeLiveStore` is now `createStore` 
- Different schema definition approach using `State.SQLite.table()`
- Event-based mutations with materializers
- The API is not well documented for the dev version

#### 3.2 Server vs Client Architecture
- **RedwoodJS SDK**: Runs primarily on the server (Cloudflare Workers)
- **LiveStore**: Designed for client-side state management
- This creates a fundamental mismatch in execution contexts

#### 3.3 Web Worker Requirements
LiveStore requires:
- Web Workers for SQLite WASM
- SharedWorkers for cross-tab sync
- HTTPS for SharedWorker support

RedwoodJS SDK's server-first approach doesn't naturally accommodate these client-side requirements.

### 4. Attempted Solutions

#### 4.1 Client-Side Integration
Created a client-side React hook (`useLiveStore`) that:
- Initializes LiveStore in the browser
- Provides reactive state management
- Works within RedwoodJS SDK's client components

#### 4.2 Schema Definition
Attempted to use the new LiveStore schema API:
```typescript
export const tables = {
  todos: State.SQLite.table({
    name: 'todos',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      title: State.SQLite.text(),
      completed: State.SQLite.boolean(),
      createdAt: State.SQLite.integer(),
    },
  }),
}
```

#### 4.3 Event-Based Mutations
Implemented event-driven state changes:
```typescript
export const events = {
  todoCreated: Events.synced({
    name: 'v1.TodoCreated',
    schema: Schema.Struct({
      id: Schema.String,
      title: Schema.String,
      createdAt: Schema.Number,
    }),
  }),
}
```

### 5. Blocking Issues

1. **Missing Materializers API**: The dev version expects materializers but the API is undocumented
2. **Effect Integration**: LiveStore uses Effect for async operations, creating type mismatches
3. **Server/Client Boundary**: Unclear how to properly integrate client-only LiveStore with server-first RedwoodJS
4. **Documentation Gap**: LiveStore dev version lacks comprehensive documentation

### 6. Recommendations

#### For Immediate Use
1. Use LiveStore stable version (0.3.1) with simpler API
2. Keep LiveStore purely on the client side
3. Use RedwoodJS SDK for server logic only

#### For Future Integration
1. Wait for LiveStore dev version to stabilize with documentation
2. Consider using LiveStore sync backend with Cloudflare Durable Objects
3. Create clear server/client boundaries in the architecture

#### Alternative Approaches
1. Use RedwoodJS SDK with Cloudflare D1 for server-side data
2. Use LiveStore independently for client-side state
3. Consider other state management solutions better suited for SSR

### 7. Conclusion

While both RedwoodJS SDK and LiveStore are powerful frameworks, their architectural assumptions differ significantly:

- **RedwoodJS SDK**: Server-first, SSR-focused, Cloudflare Workers
- **LiveStore**: Client-first, local SQLite, event sourcing

Successfully integrating them requires:
1. Clear understanding of the LiveStore dev API
2. Careful separation of server and client concerns
3. Potentially custom sync adapters for Cloudflare Workers

The integration is technically possible but requires significant effort and may not leverage the full benefits of either framework. A production implementation would benefit from waiting for LiveStore's dev version to stabilize with proper documentation.