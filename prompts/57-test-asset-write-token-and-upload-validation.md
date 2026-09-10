# Implementation Prompt: Test Asset Write Token and Upload Validation

## Goal

Update `studio/scripts/seed/test-asset.mjs` to:
1. Parse and require a non-empty `SANITY_API_WRITE_TOKEN` (instead of `SANITY_API_READ_TOKEN`), checking `process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN` and `.env.local`, and exiting with an error if no write token is found.
2. In `testAssetUpload()`, check `uploadRes.ok` after calling the Sanity asset API and throw an error with the response status and body if the upload fails, ensuring the process terminates with an exit code of 1.

---

## Skills and Docs Read

- `AGENTS.md` (Section 2 How to work, Section 12 Things that will trip you up, Section 13 Checks).
- `studio/scripts/seed/test-asset.mjs`.

---

## Code Inspected

- `studio/scripts/seed/test-asset.mjs`:
  - Lines 9-18:
    ```javascript
    let token = ''
    if (fs.existsSync(envLocalPath)) {
      const envContent = fs.readFileSync(envLocalPath, 'utf-8')
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim()
        if (trimmed.startsWith('SANITY_API_READ_TOKEN=')) {
          token = trimmed.split('=')[1].trim()
        }
      }
    }
    ```
    Reads `SANITY_API_READ_TOKEN` instead of write token, does not check environment variables (`process.env.SANITY_API_WRITE_TOKEN`), and does not enforce that a token is provided before proceeding.
  - Lines 27-40:
    ```javascript
    const uploadRes = await fetch(uploadUrl, { ... })
    const uploadJson = await uploadRes.json()
    console.log('Upload response:', uploadJson)
    ```
    Does not verify `uploadRes.ok`. If the mutation fails (e.g. 401 Unauthorized or 403 Forbidden), it logs the response and finishes with exit code 0.

---

## Decisions and Assumptions

1. **Token Loading and Requirement**:
   - Read from `process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN || ''`.
   - If not set in process environment, parse `.env.local` looking for `SANITY_API_WRITE_TOKEN=`.
   - If `!token`, log an error message and exit with `process.exit(1)`.
2. **Upload Response Validation**:
   - After `const uploadJson = await uploadRes.json()`, check `if (!uploadRes.ok)`.
   - If unsuccessful, throw `new Error(\`Asset upload failed with status \${uploadRes.status}: \${JSON.stringify(uploadJson)}\`)`.
   - The `.catch()` block on `testAssetUpload()` catches this and calls `process.exit(1)`.

---

## Files to Create or Change

```text
studio/scripts/seed/test-asset.mjs    [MODIFY] Require SANITY_API_WRITE_TOKEN and validate uploadRes.ok
```

---

## Requirements

1. Token parsing must read and require a non-empty `SANITY_API_WRITE_TOKEN` instead of `SANITY_API_READ_TOKEN`.
2. Missing write token must fail the script with `process.exit(1)`.
3. `uploadRes.ok` must be checked in the upload flow; unsuccessful responses must throw an error causing the script to exit with code 1.
4. Syntax and lint/type checks must pass.

---

## Security Considerations

- Asset uploads require mutation/write permissions; attempting uploads with read tokens or without tokens causes authorization failures. Enforcing write tokens prevents silent permission failures.

---

## Acceptance Criteria

1. `studio/scripts/seed/test-asset.mjs` reads `SANITY_API_WRITE_TOKEN` and exits if missing.
2. `uploadRes.ok` is checked and throws an error on non-OK responses.
3. `node -c studio/scripts/seed/test-asset.mjs` passes with code 0.
4. `npx tsc --noEmit` passes with code 0.

---

## Checks to Run

- `node -c studio/scripts/seed/test-asset.mjs`
- `node studio/scripts/seed/test-asset.mjs` (test error handling without token)
- `npx tsc --noEmit`

---

## Exact Manual Test Steps

1. Inspect `studio/scripts/seed/test-asset.mjs` lines 9-28 to confirm `SANITY_API_WRITE_TOKEN` is parsed and required.
2. Inspect lines 38-48 to confirm `if (!uploadRes.ok)` throws an error.
3. Run `node studio/scripts/seed/test-asset.mjs` in an environment without `SANITY_API_WRITE_TOKEN` to ensure it reports an error and exits with code 1.
