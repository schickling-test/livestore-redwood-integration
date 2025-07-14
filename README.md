# LiveStore + RedwoodSDK Integration Demo

This repository demonstrates the integration of [LiveStore](https://docs.livestore.dev/) (web adapter, no sync backend) with a mock RedwoodSDK implementation.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Run tests
npm test
```

Then open https://localhost:3000 in your browser.

## 🎯 Features

- **LiveStore Web Adapter**: Uses the dev version (0.3.2-dev.10) with OPFS storage
- **Effect Framework**: Built using [Effect](https://effect.website/) for type-safe error handling
- **Mock RedwoodSDK**: Demonstrates how LiveStore would integrate with RedwoodSDK
- **Todo Application**: Full CRUD operations with real-time updates
- **Playwright Tests**: Comprehensive E2E test suite

## 📁 Project Structure

```
├── src/
│   ├── index.html          # Entry HTML file
│   ├── main.ts            # Main application logic
│   ├── schema/            # Database schema definitions
│   └── livestore.worker.ts # LiveStore web worker
├── tests/                 # Playwright test suite
├── biome.json            # Linting and formatting config
├── vite.config.ts        # Vite configuration
└── playwright.config.ts  # Playwright test configuration
```

## 🏗️ Architecture

### LiveStore
- Runs in a dedicated Web Worker for optimal performance
- Uses OPFS (Origin Private File System) for persistence
- SQLite WASM for local data storage
- Shared Worker enables cross-tab synchronization

### Mock RedwoodSDK
- Simulates state group functionality
- Logs all operations to console
- Demonstrates integration points

### Effect Framework
- Type-safe error handling
- Functional programming patterns
- Clean separation of concerns

## 🧪 Testing

The project includes comprehensive Playwright tests:

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui
```

Tests cover:
- LiveStore initialization
- Todo CRUD operations
- Data persistence
- Keyboard shortcuts
- Mock RedwoodSDK synchronization

## 📋 Requirements

- Node.js 18+
- Modern browser with OPFS support
- HTTPS (required by LiveStore)

## 🔧 Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build
```

## 📝 Notes

- The RedwoodSDK implementation is mocked since the actual npm package doesn't exist yet
- LiveStore requires HTTPS even in development
- Data is persisted in the browser's OPFS
- The dev server runs on port 3000 by default

## 🤝 Contributing

Feel free to open issues or submit pull requests to improve this demo!

## 📄 License

MIT