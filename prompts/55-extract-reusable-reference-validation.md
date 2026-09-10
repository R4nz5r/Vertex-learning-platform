# Implementation Prompt: Extract Reusable Reference Validation for Merged Dataset

## Goal

Extract reference validation logic from `buildNdjson()` in `studio/scripts/seed/build-ndjson.mjs` into an exported, reusable `validateReferences(docs)` function, and invoke it in `studio/scripts/seed/merge-and-sync.mjs` on `mergedDocs` immediately before `writeFileSync` and the upload loop:
1. **Reusable `validateReferences(docs)`**: Export `validateReferences(docs)` in `build-ndjson.mjs` to validate unique IDs and missing references for `instructor`, `category`, and `lesson` references.
2. **Preserve `buildNdjson()` Behavior**: Keep all existing pre-merge document loading, reference validation, hierarchy enforcement (4 modules/course, 3 lessons/module, 20 courses, 240 lessons), and file formatting intact.
3. **Invoke on `mergedDocs` in `merge-and-sync.mjs`**: Call `validateReferences(mergedDocs)` immediately before `fs.writeFileSync(seedFilePath, ...)` and the Sanity mutation loop. Abort with `process.exit(1)` if any broken references or ID errors are found.

---

## Skills and Docs Read

- `AGENTS.md` (Section 2 How to work, Section 8 Data Model, Section 13 Checks).
- `studio/scripts/seed/build-ndjson.mjs`.
- `studio/scripts/seed/merge-and-sync.mjs`.

---

## Code Inspected

- `studio/scripts/seed/build-ndjson.mjs`:
  - Lines 16-70: Performs ID map construction, duplicate/empty ID checks, and checks for missing instructor, category, and lesson references inline inside `buildNdjson()`.
- `studio/scripts/seed/merge-and-sync.mjs`:
  - Lines 82-93: Combines `originalDocs` and `currentDocs` into `mergedDocs` and writes `mergedNdjson` directly to disk and uploads to Sanity without validating relational reference integrity.

---

## Decisions and Assumptions

1. **Clean Modular Extraction**:
   - In `build-ndjson.mjs`, create and export:
     ```javascript
     export function validateReferences(docs) { ... }
     ```
   - Validates document IDs and resolves all references (`course.instructor._ref`, `course.category._ref`, `mod.lessons[]._ref`).
   - Returns `{ valid: boolean, missingRefs: number, idValidationErrors: number }`.
2. **Intact `buildNdjson()`**:
   - `buildNdjson()` calls `validateReferences(docs)` and retains its existing hierarchy checks, file generation, and console reporting.
3. **Pre-Write / Pre-Upload Guard in `merge-and-sync.mjs`**:
   - Import `validateReferences` from `./build-ndjson.mjs`.
   - Before `fs.writeFileSync(seedFilePath, mergedNdjson, 'utf-8')`, invoke `validateReferences(mergedDocs)`.
   - If `!validationResult.valid`, log error and exit with `process.exit(1)`.

---

## Files to Create or Change

```text
studio/scripts/seed/build-ndjson.mjs       [MODIFY] Extract and export validateReferences(docs)
studio/scripts/seed/merge-and-sync.mjs    [MODIFY] Import validateReferences and call on mergedDocs before writing or uploading
```

---

## Requirements

1. `validateReferences(docs)` must check missing instructor, category, and lesson references.
2. `merge-and-sync.mjs` must call `validateReferences(mergedDocs)` before `writeFileSync` and the upload loop, failing with `process.exit(1)` if invalid.
3. `buildNdjson()` behavior must remain intact for pre-merge data.
4. Syntax and checks must pass with exit code 0.

---

## Security Considerations

- Prevents corrupted datasets with missing references or dangling relationships from being written to disk or published to the Sanity production dataset.

---

## Acceptance Criteria

1. `build-ndjson.mjs` exports `validateReferences(docs)`.
2. `merge-and-sync.mjs` imports `validateReferences` and aborts if `mergedDocs` contains broken references.
3. `node -c` syntax checks pass for both scripts.
4. `npm run seed:build` succeeds without errors.

---

## Checks to Run

- `node -c studio/scripts/seed/build-ndjson.mjs`
- `node -c studio/scripts/seed/merge-and-sync.mjs`
- `npm run seed:build` in `studio/`
- `npx tsc --noEmit`

---

## Exact Manual Test Steps

1. Inspect `studio/scripts/seed/build-ndjson.mjs` to verify `validateReferences(docs)` is exported and covers instructor, category, and lesson references.
2. Inspect `studio/scripts/seed/merge-and-sync.mjs` around lines 85-100 to verify `validateReferences(mergedDocs)` runs before `writeFileSync` and `fetch(mutateUrl)`.
3. Run `npm run seed:build` in `studio/` to confirm existing build-ndjson validation works.
