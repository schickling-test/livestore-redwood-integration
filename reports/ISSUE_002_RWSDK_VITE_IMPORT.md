# Issue #002: RedwoodJS SDK Vite Plugin Import Error

## Problem Description

When trying to import the rwsdk Vite plugin, we get an error that the module doesn't provide a default export.

## Error Message

```
SyntaxError: The requested module 'file:///home/schickling/code/playground/2025/jul/livestore-redwood/node_modules/rwsdk/dist/vite/index.mjs' does not provide an export named 'default'
```

## Investigation

### 1. Current Import

```typescript
import rwsdk from 'rwsdk/vite'
```

### 2. Need to Check

- The actual exports from rwsdk/vite
- If it's a named export instead of default
- The correct import syntax

## Next Steps

1. Check the rwsdk package exports
2. Look at the rwsdk documentation or examples for proper Vite plugin usage