# Implementation Prompt: Parameterize Merge-and-Sync Base Revision

## Goal

Update `studio/scripts/seed/merge-and-sync.mjs` to read from an explicit, parameterized prior/base git revision instead of a hardcoded `HEAD`:
1. Require an explicit git revision argument (via CLI argument or `BASE_REVISION` environment variable). Fail with exit code 1 and usage instructions if omitted.
2. Query `git show <revision>:studio/scripts/seed/seed.ndjson` dynamically.
3. Ensure the extracted base revision content is distinct from the current on-disk seed file, failing if the revision content is identical to the current seed file.
4. Preserve existing non-destructive merge behavior.

---

## Skills and Docs Read

- `AGENTS.md` (Section 2 How to work, Section 13 Checks).
- `sanity-best-practices`.
- `studio/scripts/seed/merge-and-sync.mjs`.

---

## Code Inspected

- `studio/scripts/seed/merge-and-sync.mjs`:
  - Line 34: Currently hardcodes `git show HEAD:studio/scripts/seed/seed.ndjson`.
  - Once working tree changes are committed, `HEAD` points to the current commit, making the restoration source identical to the current file on disk rather than a distinct prior base revision.

---

## Decisions and Assumptions

1. **Explicit Revision Parameter**:
   - Accept the revision as `process.argv[2] || process.env.BASE_REVISION`.
   - If not provided, output usage and exit with `process.exit(1)`.
2. **Safe Git Execution via execFileSync**:
   - Trim and sanitize the revision string.
   - Use `execFileSync('git', ['show', ...])` passing arguments separately to prevent shell interpretation.
   - Wrap in a try/catch block that reports descriptive errors and exits with code 1 if git fails to find the revision or object.
3. **Distinct Source Verification**:
   - Compare `originalNdjson.trim() === currentNdjson.trim()`.
   - If identical, fail with `process.exit(1)` and an explicit error indicating that the restoration source must be distinct from the current seed file.

---

## Files to Create or Change

```text
studio/scripts/seed/merge-and-sync.mjs    [MODIFY] Require explicit base revision argument, use in git show, and enforce distinctness from current file
```

---

## Requirements

1. Do not hardcode `HEAD` in `merge-and-sync.mjs`.
2. Require the prior/base revision as an input and exit with code 1 if missing.
3. Verify that the restoration source is distinct from the current seed file.
4. Maintain existing merge behavior across document IDs.

---

## Security Considerations

- Prevents unintentional self-merges or no-op runs that mask missing prior dataset revisions.

---

## Acceptance Criteria

1. Running `node studio/scripts/seed/merge-and-sync.mjs` without arguments exits with code 1 and displays usage instructions.
2. Running with a revision whose content equals disk exits with code 1 noting it is not distinct.
3. Running with a valid prior revision successfully extracts and parses the prior documents.
4. Syntax check (`node -c`) passes.

---

## Checks to Run

- `node -c studio/scripts/seed/merge-and-sync.mjs`
- Test execution with no args to confirm usage failure (`exit code 1`).
- `npm run seed:build` in `studio/`
- `npx tsc --noEmit`

---

## Exact Manual Test Steps

1. Run `node studio/scripts/seed/merge-and-sync.mjs` with no arguments and confirm it terminates with code 1 and displays usage instructions.
2. Run `node studio/scripts/seed/merge-and-sync.mjs HEAD` and confirm it terminates with code 1 because HEAD is identical to the current file on disk.
3. Run `node -c studio/scripts/seed/merge-and-sync.mjs` to confirm syntax.
