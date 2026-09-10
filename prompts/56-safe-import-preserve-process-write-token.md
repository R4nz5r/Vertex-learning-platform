# Implementation Prompt: Safe Import Preserve Process Write Token

## Goal

Update the environment parsing and token assignment logic in `studio/scripts/seed/safe-import.mjs` around line 16 so that an existing `process.env.SANITY_API_WRITE_TOKEN` (or `process.env.SANITY_API_TOKEN`) is never overwritten by values parsed from `.env.local` (including `SANITY_API_READ_TOKEN` or `.env.local`'s write token). Only assign parsed tokens from `.env.local` when no process write token was supplied, ensuring that the mutation Authorization header (`Authorization: Bearer ${token}`) strictly preserves the process-level write token.

---

## Skills and Docs Read

- `AGENTS.md` (Section 2 How to work, Section 12 Things that will trip you up, Section 13 Checks).
- `studio/scripts/seed/safe-import.mjs`.

---

## Code Inspected

- `studio/scripts/seed/safe-import.mjs`:
  - Lines 10-25:
    ```javascript
    // Read write token from environment or .env.local
    let writeToken = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN || ''
    let readToken = process.env.SANITY_API_READ_TOKEN || ''
    if (fs.existsSync(envLocalPath)) {
      const envContent = fs.readFileSync(envLocalPath, 'utf-8')
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim()
        if (trimmed.startsWith('SANITY_API_WRITE_TOKEN=')) {
          writeToken = trimmed.split('=')[1].trim()
        } else if (trimmed.startsWith('SANITY_API_READ_TOKEN=')) {
          readToken = trimmed.split('=')[1].trim()
        }
      }
    }

    const token = writeToken || readToken
    ```
  - When `process.env.SANITY_API_WRITE_TOKEN` is passed via the shell or process environment, parsing `.env.local` unconditionally reassigns `writeToken` (and `readToken`). If `.env.local` has a stale/different token or if `readToken` is evaluated under different ordering, the explicitly supplied process token can be overridden.

---

## Decisions and Assumptions

1. **Explicit Check for Process-Supplied Write Token**:
   - Determine whether a process-level write token was provided:
     ```javascript
     const hasProcessWriteToken = Boolean(process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN)
     let writeToken = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN || ''
     let readToken = process.env.SANITY_API_READ_TOKEN || ''
     ```
2. **Guard Assignment in the Parsing Loop**:
   - Only assign `writeToken` or `readToken` from `.env.local` when no process write token was supplied (`!hasProcessWriteToken`):
     ```javascript
     if (fs.existsSync(envLocalPath)) {
       const envContent = fs.readFileSync(envLocalPath, 'utf-8')
       for (const line of envContent.split('\n')) {
         const trimmed = line.trim()
         if (!hasProcessWriteToken) {
           if (trimmed.startsWith('SANITY_API_WRITE_TOKEN=')) {
             writeToken = trimmed.split('=')[1].trim()
           } else if (trimmed.startsWith('SANITY_API_READ_TOKEN=')) {
             readToken = trimmed.split('=')[1].trim()
           }
         }
       }
     }
     ```
3. **Preserve Fallback and Mutation Auth**:
   - `const token = writeToken || readToken` will evaluate to the untouched `process.env.SANITY_API_WRITE_TOKEN` whenever supplied by the process environment.
   - When no process write token is provided, it falls back to `.env.local`'s `SANITY_API_WRITE_TOKEN`, then `SANITY_API_READ_TOKEN`, then `process.env.SANITY_API_READ_TOKEN`.
   - The mutation Authorization header (`Authorization: Bearer ${token}`) remains intact and uses the verified write token.

---

## Files to Create or Change

```text
studio/scripts/seed/safe-import.mjs    [MODIFY] Guard token assignment so process write token is never overwritten by .env.local
```

---

## Requirements

1. An existing `process.env.SANITY_API_WRITE_TOKEN` (or `process.env.SANITY_API_TOKEN`) must never be overwritten by values from `.env.local`.
2. Parsed values from `.env.local` should only be assigned when no process write token was supplied.
3. The mutation Authorization header must retain the write token.
4. Syntax and checks must pass with exit code 0.

---

## Security Considerations

- Prevents permission denied mutation failures or accidental writes using unauthorized or read-only tokens by guaranteeing that explicitly passed write tokens take precedence over local configuration files.

---

## Acceptance Criteria

1. `studio/scripts/seed/safe-import.mjs` checks for process write token existence and prevents `.env.local` from overwriting it.
2. `node -c studio/scripts/seed/safe-import.mjs` passes with exit code 0.
3. `npx tsc --noEmit` passes with exit code 0.

---

## Checks to Run

- `node -c studio/scripts/seed/safe-import.mjs`
- `npx tsc --noEmit`

---

## Exact Manual Test Steps

1. Inspect `studio/scripts/seed/safe-import.mjs` lines 10-25 to verify the guard `!hasProcessWriteToken` prevents `.env.local` from overriding process write tokens.
2. Run a dry invocation or syntax check with `node -c studio/scripts/seed/safe-import.mjs` to ensure clean parsing.
3. Verify with a inline node one-liner that when `SANITY_API_WRITE_TOKEN` is passed via env, it retains its value regardless of `.env.local`.
