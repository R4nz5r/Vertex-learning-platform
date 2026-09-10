# Implementation Prompt: Fix Seed Scripts Write Token Loading & Enforce Write Permissions

## Goal

Ensure that seeding and sync scripts correctly load and prioritize `SANITY_API_WRITE_TOKEN` so write operations never attempt mutations with a read-only token:
1. **`studio/scripts/seed/import-seed.mjs`**: Update token loading (lines 16-20) to prioritize `SANITY_API_WRITE_TOKEN` and ensure `SANITY_API_READ_TOKEN` cannot override an explicitly provided write token.
2. **`studio/scripts/seed/merge-and-sync.mjs`**: Update token loading (lines 17-18) to require and use `SANITY_API_WRITE_TOKEN` for `createOrReplace` mutations, exiting with error if not present.
3. **`studio/scripts/seed/safe-import.mjs`**: Apply the same robust write-over-read token resolution pattern so `SANITY_API_READ_TOKEN` cannot override `SANITY_API_WRITE_TOKEN`.

---

## Skills and Docs Read

- `AGENTS.md` (Section 2 How to work, Section 5 Structure, Section 12 Things that will trip you up: *"Any write token... is server only"*).
- `sanity-best-practices` (`references/structure.md`, `references/groq.md`).
- `studio/scripts/seed/import-seed.mjs`.
- `studio/scripts/seed/merge-and-sync.mjs`.
- `studio/scripts/seed/safe-import.mjs`.

---

## Code Inspected

- `studio/scripts/seed/import-seed.mjs`:
  - Lines 11-23: When reading `.env.local` line by line, if `SANITY_API_READ_TOKEN` appears after `SANITY_API_WRITE_TOKEN` in the file or if `process.env.SANITY_API_WRITE_TOKEN` is set, `SANITY_API_READ_TOKEN` overwrites `token`, causing mutations to fail with 403 Forbidden.
- `studio/scripts/seed/merge-and-sync.mjs`:
  - Lines 12-21: Only reads `SANITY_API_READ_TOKEN=`, and then uses it as `Authorization: Bearer ${token}` for mutation requests (`mutateUrl`).
- `studio/scripts/seed/safe-import.mjs`:
  - Lines 10-22: Line-by-line loop could similarly allow a trailing `SANITY_API_READ_TOKEN` to overwrite an environment-provided `SANITY_API_WRITE_TOKEN`.

---

## Decisions and Assumptions

1. **Independent Token Accumulation & Write Token Requirement**:
   - In `import-seed.mjs` and `safe-import.mjs`, parse `writeToken` using `hasProcessWriteToken` to preserve process env tokens over `.env.local`.
   - Mutation scripts require a resolved `writeToken`; if absent, they fail with `process.exit(1)` and do not fall back to `readToken` for mutations.
   - Select `const token = writeToken`. Under no circumstances can `readToken` be used for mutation requests.
2. **Strict Write Token Requirement in `merge-and-sync.mjs`**:
   - Parse `SANITY_API_WRITE_TOKEN` from `process.env` and `.env.local`.
   - If `!token`, log an explicit error `❌ SANITY_API_WRITE_TOKEN is required for mutations in merge-and-sync.mjs.` and call `process.exit(1)`.

---

## Files to Create or Change

```text
studio/scripts/seed/import-seed.mjs       [MODIFY] Prevent SANITY_API_READ_TOKEN from overriding SANITY_API_WRITE_TOKEN
studio/scripts/seed/merge-and-sync.mjs    [MODIFY] Require and use SANITY_API_WRITE_TOKEN for mutations
studio/scripts/seed/safe-import.mjs       [MODIFY] Ensure writeToken is prioritized over readToken
```

---

## Requirements

1. `import-seed.mjs` must prioritize `SANITY_API_WRITE_TOKEN` and never let `SANITY_API_READ_TOKEN` override it.
2. `merge-and-sync.mjs` must require `SANITY_API_WRITE_TOKEN` and use it for mutation authorization.
3. Node syntax checks must pass for all modified scripts.

---

## Security Considerations

- Read tokens are strictly used for queries; write tokens are used for mutations.
- Tokens remain server-side/local script execution only and are never committed or exposed to the browser.

---

## Acceptance Criteria

1. Running `import-seed.mjs` or `safe-import.mjs` with both write and read tokens defined always selects the write token for mutations.
2. Running `merge-and-sync.mjs` without `SANITY_API_WRITE_TOKEN` exits with code 1 and a descriptive error.
3. Syntax check passes (`node -c`).

---

## Checks to Run

- `node -c studio/scripts/seed/import-seed.mjs`
- `node -c studio/scripts/seed/merge-and-sync.mjs`
- `node -c studio/scripts/seed/safe-import.mjs`
- `npm run seed:build` in `studio/`
- `npx tsc --noEmit`

---

## Exact Manual Test Steps

1. Inspect `studio/scripts/seed/import-seed.mjs` lines 10-25 to verify `writeToken` and `readToken` separation and that `token = writeToken || readToken`.
2. Inspect `studio/scripts/seed/merge-and-sync.mjs` lines 10-25 to verify `SANITY_API_WRITE_TOKEN` is parsed and required.
3. Run `node -c` syntax checks on all modified scripts to ensure zero syntax errors.
