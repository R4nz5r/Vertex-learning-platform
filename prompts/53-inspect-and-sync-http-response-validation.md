# Implementation Prompt: HTTP Response Validation in Course Inspection & Sync Scripts

## Goal

Ensure HTTP responses are checked for success before consuming response bodies or reporting results in seed utilities:
1. **`studio/scripts/seed/inspect-courses.mjs`**: Check `res.ok` before parsing `res.json()` or printing `json.result`, and throw an error for unsuccessful responses.
2. **`studio/scripts/seed/merge-and-sync.mjs`**: Check `queryRes.ok` during the post-mutation verification step, logging an error and terminating with `process.exit(1)` when the query is unsuccessful.

---

## Skills and Docs Read

- `AGENTS.md` (Section 2 How to work, Section 13 Checks).
- `sanity-best-practices` (`references/groq.md`).
- `studio/scripts/seed/inspect-courses.mjs`.
- `studio/scripts/seed/merge-and-sync.mjs`.

---

## Code Inspected

- `studio/scripts/seed/inspect-courses.mjs`:
  - Lines 22-26: Awaits `fetch(...)` and immediately calls `await res.json()`, printing `json.result` without validating `res.ok`. An HTTP error prints `undefined` and exits with code 0 instead of surfacing failures.
- `studio/scripts/seed/merge-and-sync.mjs`:
  - Lines 105-110: In the post-import verification phase, calls `fetch(queryUrl, ...)` and immediately calls `await queryRes.json()` without verifying `queryRes.ok`. A verification failure is masked and silently logs `undefined` counts.

---

## Decisions and Assumptions

1. **Explicit `res.ok` Guard in `inspect-courses.mjs`**:
   - Inspect `res.ok`. If false, read `res.text()` and throw an `Error` detailing status code and response body.
2. **Hard Failure on Verification Failure in `merge-and-sync.mjs`**:
   - Inspect `queryRes.ok`. If false, read `queryRes.text()`, log error with status code and body, and call `process.exit(1)`.

---

## Files to Create or Change

```text
studio/scripts/seed/inspect-courses.mjs    [MODIFY] Check res.ok and throw Error on failure before parsing JSON
studio/scripts/seed/merge-and-sync.mjs    [MODIFY] Check queryRes.ok and call process.exit(1) on failure during verification
```

---

## Requirements

1. `inspect-courses.mjs` must check `res.ok` before calling `res.json()` or printing results, throwing an error if `!res.ok`.
2. `merge-and-sync.mjs` must check `queryRes.ok` during final verification and fail with `process.exit(1)` if `!queryRes.ok`.
3. Changes must be minimal and adhere to project standards.

---

## Security Considerations

- Ensures HTTP errors (authentication issues, invalid tokens, network outages) fail loudly rather than silently proceeding as successful operations.

---

## Acceptance Criteria

1. Non-2xx HTTP responses in `inspect-courses.mjs` throw an error and terminate execution.
2. Non-2xx verification responses in `merge-and-sync.mjs` log the error and terminate execution with exit code 1.
3. Syntax check (`node -c`) passes for both scripts.

---

## Checks to Run

- `node -c studio/scripts/seed/inspect-courses.mjs`
- `node -c studio/scripts/seed/merge-and-sync.mjs`
- `npm run seed:build` in `studio/`
- `npx tsc --noEmit`

---

## Exact Manual Test Steps

1. Inspect `studio/scripts/seed/inspect-courses.mjs` lines 20-30 to verify `res.ok` is checked before `res.json()`.
2. Inspect `studio/scripts/seed/merge-and-sync.mjs` lines 105-115 to verify `queryRes.ok` is checked and exits with code 1 if false.
3. Run `node -c` on both scripts to verify syntax.
