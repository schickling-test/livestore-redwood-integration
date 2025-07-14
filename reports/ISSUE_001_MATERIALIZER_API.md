# Issue #001: LiveStore Materializer API Type Mismatch

## Problem Description

When trying to use materializers in the LiveStore schema definition, TypeScript throws errors indicating that the materializer return types don't match the expected `MaterializerResult` type.

## Error Messages

```
src/schema.ts(64,54): error TS2322: Type '{ todos: { id: any; text: any; completed: boolean; createdAt: any; }[]; }' is not assignable to type 'SingleOrReadonlyArray<MaterializerResult>'.
src/schema.ts(67,48): error TS2322: Type '{ todos: { id: any; $op: string; completed: any; }; }' is not assignable to type 'SingleOrReadonlyArray<MaterializerResult>'.
```

## Investigation

### 1. Current Code

```typescript
materializers: {
  'v1.TodoCreated': ({ id, text, createdAt }) => ({
    todos: [{ id, text, completed: false, createdAt }],
  }),
  'v1.TodoToggled': ({ id, completed }) => ({
    todos: { id, $op: 'update', completed },
  }),
  // ... more materializers
}
```

### 2. Expected Type

The TypeScript error indicates that the return type should be `SingleOrReadonlyArray<MaterializerResult>`, but the actual return format is unclear from the dev version documentation.

### 3. Possible Issues

1. The materializer API might have changed in the dev version
2. The return format might need to be wrapped in an array
3. The `$op` syntax might be incorrect
4. The `MaterializerResult` type might have specific requirements not documented

## Attempted Solutions

1. **Direct object return**: Current approach, results in type error
2. **Need to investigate**: The correct `MaterializerResult` type structure

## Next Steps

1. Search for `MaterializerResult` type definition in LiveStore source
2. Look for example materializers in the LiveStore codebase
3. Check if there's a specific import needed for materializer operations

## Impact

This blocks the ability to properly define how events are materialized into database state, which is a core feature of LiveStore's event sourcing architecture.