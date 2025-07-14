# Issue #001 Update: LiveStore Materializer API - RESOLVED

## Solution Found

The MaterializerResult type expects one of:
1. An object with `sql`, `bindValues`, and optionally `writeTables`
2. A QueryBuilder instance
3. A raw SQL string

## Correct Approach

Instead of returning objects like `{ todos: [...] }`, materializers should return SQL statements or QueryBuilder operations.

### Example Fix

Instead of:
```typescript
'v1.TodoCreated': ({ id, text, createdAt }) => ({
  todos: [{ id, text, completed: false, createdAt }],
})
```

Should be:
```typescript
'v1.TodoCreated': ({ id, text, createdAt }) => 
  `INSERT INTO todos (id, text, completed, createdAt) VALUES ('${id}', '${text}', false, ${createdAt})`
```

Or using QueryBuilder (preferred for type safety).

## Next Steps

Rewrite all materializers to return SQL statements or use the QueryBuilder API.