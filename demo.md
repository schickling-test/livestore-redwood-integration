# LiveStore + RedwoodSDK Integration Demo

This project demonstrates the integration of LiveStore (web adapter, no sync backend) with a mock RedwoodSDK implementation.

## Features

- **LiveStore Web Adapter**: Uses the dev version (0.3.2-dev.10) with OPFS storage
- **Effect Framework**: Built using Effect for type-safe error handling
- **Mock RedwoodSDK**: Demonstrates how LiveStore would integrate with RedwoodSDK
- **Todo Application**: Simple todo app showing CRUD operations
- **Playwright Tests**: Comprehensive test suite to verify functionality

## Running the Demo

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open https://localhost:3000 in your browser

3. Features you can test:
   - Add new todos
   - Toggle todo completion
   - Delete todos
   - Data persists across page reloads (stored in OPFS)
   - Mock synchronization with RedwoodSDK (check console logs)

## Architecture

- **LiveStore**: Handles local data persistence using SQLite WASM
- **RedwoodSDK Mock**: Simulates state synchronization
- **Web Workers**: LiveStore runs in a dedicated worker for better performance
- **Shared Workers**: Enables cross-tab synchronization

## Testing

Run the Playwright tests:
```bash
npm test
```

Note: You may need to install browser dependencies first.

## Key Files

- `src/main.ts`: Main application logic
- `src/schema/index.ts`: Database schema definition
- `src/livestore.worker.ts`: LiveStore worker setup
- `tests/integration.spec.ts`: Playwright test suite