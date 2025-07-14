# Issue #004: RedwoodJS SDK Requires Node.js Compatibility Flag

## Problem Description

RedwoodJS SDK is importing Node.js modules in the worker environment, specifically `async_hooks`.

## Warning Message

```
[vite] Unexpected Node.js imports for environment "worker". Do you need to enable the "nodejs_compat" compatibility flag?
- "async_hooks" imported from "node_modules/rwsdk/dist/runtime/requestInfo/worker.js"
```

## Impact

This is a warning, not an error. The dev server still runs, but it might cause issues in production or when actually deploying to Cloudflare Workers.

## Potential Solutions

1. Enable the `nodejs_compat` flag in wrangler.toml
2. This might be expected behavior for RedwoodJS SDK when running in development

## Next Steps

Test if the application works despite this warning. If it doesn't, we may need to:
1. Add compatibility flags to wrangler.toml
2. Investigate if RedwoodJS SDK has specific requirements for client-only applications