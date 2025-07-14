# Issue #005: RedwoodJS SDK Client-Only Setup Challenges

## Problem Description

When trying to use RedwoodJS SDK without server-side rendering, the application doesn't serve content properly. The server starts but returns empty responses.

## Current Setup

1. Created a minimal worker.tsx that just serves static HTML
2. Using the RedwoodJS SDK Vite plugin
3. Configured wrangler.toml

## Symptoms

1. Server starts successfully on https://localhost:3000/
2. curl requests return empty responses
3. No error messages in the logs after initial startup

## Root Cause Analysis

RedwoodJS SDK appears to be designed primarily for server-side rendering (SSR) and React Server Components. The framework expects:

1. Server-side route handling
2. React components to be rendered on the server
3. Integration with Cloudflare Workers runtime

## Attempted Approach

Tried to use RedwoodJS SDK just as a build tool without SSR by:
- Creating a minimal worker that serves static HTML
- Keeping the client-side React app separate

## Potential Issues

1. **Architecture Mismatch**: RedwoodJS SDK is server-first, LiveStore is client-first
2. **Worker Environment**: The worker expects to run React components, not just serve static files
3. **Vite Plugin Integration**: The plugin might be intercepting requests in ways that prevent static file serving

## Possible Solutions

1. **Embrace SSR**: Redesign the app to work with server-side rendering
2. **Static Export**: Check if RedwoodJS SDK supports static site generation
3. **Custom Worker**: Write a more sophisticated worker that properly handles client-side app serving
4. **Alternative Approach**: Use RedwoodJS SDK's client-side capabilities if available

## Next Investigation Steps

1. Check RedwoodJS SDK documentation for client-only mode
2. Examine the generated worker code to understand what's happening
3. Try a different worker setup that better integrates with RedwoodJS SDK's expectations