# Vertex Search Sanity Context

This document (`vertex-search.ndjson`) defines the `sanity.agentContext` configuration for the Sanity Context MCP endpoint.

## Why NDJSON import instead of Studio plugin?

The `@sanity/context` Studio plugin currently lags this Studio's Sanity major version. Per `AGENTS.md` §12, the context document is managed via dataset import rather than installing an incompatible plugin.

## Re-importing after edits

To update or re-import the context document into Sanity:

```bash
npm run context:import
```

Or directly via the Sanity CLI from `studio/`:

```bash
npx sanity dataset import scripts/context/vertex-search.ndjson production --replace
```
