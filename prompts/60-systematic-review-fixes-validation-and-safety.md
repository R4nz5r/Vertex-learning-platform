# Implementation Prompt: Systematic Review Fixes for Seeding, Invariants, and Progress Safety

## Goal

Resolve all verified, still-valid review findings across seed scripts, progress tracking, asset uploads, and associated specification documents:
1. **`studio/scripts/seed/build-ndjson.mjs`**:
   - In `validateReferences(docs)`, validate lesson references in modules to explicitly reject null, non-object, empty-object, and empty-string `_ref` entries before checking `idMap`.
   - Extract and export `validateHierarchy(docs, options)` verifying exactly 4 modules per course and 3 lessons per module.
2. **`studio/scripts/seed/merge-and-sync.mjs`**:
   - Replace shell-interpolated `execSync` with `execFileSync('git', ['show', `${sanitizedRef}:studio/scripts/seed/seed.ndjson`])`.
   - Invoke `validateHierarchy(mergedDocs)` prior to writing or uploading.
   - Use non-destructive field-level patches (`createIfNotExists` + `patch.set`) instead of `createOrReplace`.
3. **`studio/scripts/seed/test-asset.mjs`**:
   - Set `process.exitCode = 1` on cleanup failure paths in `finally`.
4. **`studio/scripts/seed/safe-import.mjs` & `studio/scripts/seed/import-seed.mjs`**:
   - Require a resolved write token before starting mutations; fail with code 1 if absent, disallowing fallback to `readToken`.
5. **`studio/scripts/seed/upload-assets.mjs`**:
   - On patch failure, re-read the target document and retry linking only if the image field remains empty. If already populated or retrying fails, clean up the created unreferenced asset.
6. **`lib/progress.ts` & `components/dashboard/my-learning-dashboard.tsx`**:
   - In `getStoredProgress`, return empty state if `explicitUserId === null` or if no user is authenticated.
   - In `my-learning-dashboard.tsx`, guard progress reads so an absent `userId` returns empty progress and never falls back to legacy/active user storage.
7. **Documentation Updates**:
   - Update `prompts/40`, `47`, `50`, `51`, `52`, and `54` where specified to maintain consistency with code invariants.

---

## Skills and Docs Read

- `AGENTS.md` (Section 2 How to work, Section 8 Data Model, Section 12 Things that will trip you up, Section 13 Checks).
- `studio/scripts/seed/build-ndjson.mjs`.
- `studio/scripts/seed/merge-and-sync.mjs`.
- `studio/scripts/seed/test-asset.mjs`.
- `studio/scripts/seed/safe-import.mjs`.
- `studio/scripts/seed/import-seed.mjs`.
- `studio/scripts/seed/upload-assets.mjs`.
- `lib/progress.ts`.
- `components/dashboard/my-learning-dashboard.tsx`.

---

## Code Inspected

- `studio/scripts/seed/build-ndjson.mjs`:
  - Lines 56-62: `if (ref && ref._ref && !idMap.has(ref._ref))` ignores empty or invalid `ref` objects.
  - Hierarchy validation is inline in `buildNdjson()`, not reusable by `merge-and-sync.mjs`.
- `studio/scripts/seed/merge-and-sync.mjs`:
  - Line 46: Uses `execSync` with template literal.
  - Line 110: Uses `createOrReplace` instead of field-level patches.
  - Lacks module/lesson hierarchy validation on restored docs.
- `studio/scripts/seed/test-asset.mjs`:
  - Lines 79-86: Logs cleanup warnings but leaves `process.exitCode` as 0.
- `studio/scripts/seed/safe-import.mjs` & `import-seed.mjs`:
  - `const token = writeToken || readToken` allows falling back to read token on mutation scripts.
- `lib/progress.ts`:
  - `explicitUserId || getActiveUserId()` allows `null` to fall back to active user ID.
- `components/dashboard/my-learning-dashboard.tsx`:
  - `getStoredProgress(..., userId)` when `userId` is undefined can read active user progress during unauthenticated states.

---

## Decisions and Assumptions

1. **Hierarchy Extraction**:
   - Export `validateHierarchy(docs, { expectedCourses = 20, expectedModulesPerCourse = 4, expectedLessonsPerModule = 3 })` from `build-ndjson.mjs`.
   - Call both `validateReferences(mergedDocs)` and `validateHierarchy(mergedDocs, { expectedModulesPerCourse: 4, expectedLessonsPerModule: 3 })` in `merge-and-sync.mjs`.
2. **Safe ExecFileSync in Git**:
   - `execFileSync('git', ['show', `${sanitizedRef}:studio/scripts/seed/seed.ndjson`], { cwd: rootDir, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 })`.
3. **Strict Write Tokens**:
   - Disallow `readToken` fallback in `safe-import.mjs` and `import-seed.mjs`. Require `writeToken` and exit 1 if absent.
4. **Auth Progress Guard**:
   - In `getStoredProgress`: if `explicitUserId === null`, return `DEFAULT_EMPTY_STATE`. If `!userId`, return `DEFAULT_EMPTY_STATE`.
   - In `my-learning-dashboard.tsx`: if `!hasMounted || !userId`, return empty progress state.

---

## Files to Create or Change

```text
studio/scripts/seed/build-ndjson.mjs                         [MODIFY] Strict lesson ref check & export validateHierarchy
studio/scripts/seed/merge-and-sync.mjs                      [MODIFY] execFileSync, hierarchy validation, patch mutations
studio/scripts/seed/test-asset.mjs                          [MODIFY] Set exitCode = 1 on cleanup failure
studio/scripts/seed/safe-import.mjs                         [MODIFY] Disallow readToken fallback for mutations
studio/scripts/seed/import-seed.mjs                         [MODIFY] Disallow readToken fallback for mutations
studio/scripts/seed/upload-assets.mjs                       [MODIFY] Re-read target and clean up unreferenced asset on failure
lib/progress.ts                                             [MODIFY] Stricter explicitUserId handling
components/dashboard/my-learning-dashboard.tsx             [MODIFY] Guard unauthenticated/transition progress reads
prompts/40-seed-sample-content-sanity.md                    [MODIFY] Update specification counts and token rule
prompts/47-user-scoped-dashboard-progress-sync.md           [MODIFY] Update getStoredProgress contract notes
prompts/50-enforce-dataset-invariants-and-safe-import-verification.md [MODIFY] Update invariant notes
prompts/51-field-level-patch-safe-import-and-docs-correction.md [MODIFY] Update merge-and-sync guidance
prompts/52-fix-seed-scripts-write-token-loading.md          [MODIFY] Update write token requirement notes
prompts/54-parameterize-merge-and-sync-base-revision.md      [MODIFY] Update execFileSync guidance
```

---

## Requirements

1. Malformed/empty lesson references must increment error counts in `validateReferences`.
2. `validateHierarchy` must be exported and invoked in `merge-and-sync.mjs`.
3. `merge-and-sync.mjs` must use `execFileSync` and field-level patches (`createIfNotExists` + `patch.set`).
4. `test-asset.mjs` must set `process.exitCode = 1` on cleanup errors.
5. Mutation scripts must reject `readToken` and require write tokens.
6. Progress reads must not fall back to active/anonymous user when `userId` is absent.
7. Syntax, builds, and type checks must pass with exit code 0.

---

## Acceptance Criteria

1. `npm run seed:build` in `studio/` passes.
2. `node -c` passes for all modified scripts.
3. `npx tsc --noEmit` passes with 0 errors.

---

## Checks to Run

- `node -c studio/scripts/seed/build-ndjson.mjs`
- `node -c studio/scripts/seed/merge-and-sync.mjs`
- `node -c studio/scripts/seed/test-asset.mjs`
- `node -c studio/scripts/seed/safe-import.mjs`
- `node -c studio/scripts/seed/import-seed.mjs`
- `node -c studio/scripts/seed/upload-assets.mjs`
- `npm run seed:build` in `studio/`
- `npx tsc --noEmit`
