# Redwood Protocol Integration Report

## Executive Summary

This report documents the attempt to integrate LiveStore (v0.3.2-dev.10) with the Redwood protocol (@redwood.dev/client v0.3.13). While the integration code was successfully implemented, there are fundamental infrastructure requirements that prevent the integration from functioning without additional backend services.

## Integration Status: **Blocked**

The integration cannot function due to missing backend infrastructure requirements.

## Key Findings

### 1. Redwood Protocol Architecture

The Redwood protocol is a distributed, realtime database system that implements the Braid protocol for state synchronization. Unlike LiveStore's local-first approach, Redwood requires:

- A running Redwood node (server) for coordination
- HTTP endpoint (default: http://localhost:8080)
- RPC endpoint (default: http://localhost:8081)
- Peer-to-peer connectivity for state synchronization

### 2. Integration Code Status

The integration code in `src/main-redwood.ts` is complete and includes:

- ✅ LiveStore initialization with OPFS persistence
- ✅ Redwood client creation with random identity
- ✅ Authorization flow implementation
- ✅ State subscription mechanism
- ✅ Transaction creation for syncing todos
- ✅ UI for manual sync triggering

### 3. Blocking Issues

#### 3.1 Missing Backend Infrastructure
**Primary Blocker**: The Redwood client requires a running Redwood node to:
- Authorize client connections
- Handle RPC subscriptions
- Coordinate peer discovery
- Manage distributed state synchronization

Without this infrastructure, the client fails at the authorization step:
```javascript
yield* Effect.promise(() => redwoodClient.authorize())
```

#### 3.2 Network Requirements
- The Redwood protocol expects HTTP/RPC endpoints to be available
- CORS configuration would be needed for browser-based clients
- No offline-only mode available in the client library

#### 3.3 Protocol Mismatch
- **LiveStore**: Designed as a local-first, client-only database with optional sync
- **Redwood**: Designed as a distributed database requiring server coordination
- These architectural differences make direct integration challenging

### 4. Technical Details

#### 4.1 Redwood Client API
The @redwood.dev/client package provides:
```javascript
// Identity management
const identity = Redwood.identity.random()

// Peer creation
const redwoodClient = Redwood.createPeer({
  identity,
  httpHost: 'http://localhost:8080',
  rpcEndpoint: 'http://localhost:8081',
  onFoundPeersCallback: (peers) => { /* ... */ }
})

// Authorization
await redwoodClient.authorize()

// State subscription
await redwoodClient.rpc.subscribe({ stateURI: 'example.com/state' })

// Transaction submission
await redwoodClient.put({
  stateURI,
  id: Redwood.utils.randomID(),
  parents: [],
  patches: [`.data = ${Redwood.utils.JSON.stringify(data)}`]
})
```

#### 4.2 Integration Approach
The implemented integration:
1. Uses LiveStore for local storage and queries
2. Attempts to sync to Redwood on user action
3. Would receive updates via Redwood subscriptions

### 5. Potential Solutions

#### Option 1: Run Redwood Node Locally
- Set up a local Redwood node instance
- Configure CORS for browser access
- Provide documentation for node setup

#### Option 2: Mock Redwood Backend
- Create a mock server implementing Redwood's HTTP/RPC interface
- Useful for development and testing
- Already implemented basic mock in `src/main.ts`

#### Option 3: Alternative Sync Solutions
- Consider other sync protocols that align better with LiveStore's architecture
- Examples: Yjs, Automerge, or custom WebSocket sync

#### Option 4: Redwood WebAssembly
- Investigate if Redwood core can be compiled to WASM
- Would allow running Redwood logic in the browser
- No current WASM build available in the official repository

### 6. Recommendations

1. **For Development**: Use the mock implementation (`src/main.ts`) to demonstrate LiveStore functionality
2. **For Production**: Either:
   - Deploy Redwood infrastructure and update connection endpoints
   - Choose a sync solution better aligned with client-only architecture
3. **For Testing**: The current Playwright tests work with the mock implementation

### 7. Code Artifacts

- `src/main-redwood.ts`: Complete Redwood integration attempt
- `src/index-redwood.html`: UI with Redwood requirements notice
- `src/main.ts`: Working mock implementation
- `tests/integration.spec.ts`: Comprehensive test suite

### 8. Conclusion

While LiveStore and Redwood are both innovative database solutions, their architectural assumptions differ significantly. LiveStore's strength is its client-only, local-first approach, while Redwood excels at distributed, multi-peer synchronization with server coordination. Successfully integrating them would require running Redwood backend infrastructure, which goes beyond the original goal of using LiveStore's web adapter without a sync backend.

The mock implementation demonstrates how LiveStore can work with a sync abstraction, providing a path forward for integration with other sync protocols that better match LiveStore's client-first architecture.