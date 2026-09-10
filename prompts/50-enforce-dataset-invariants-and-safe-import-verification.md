# Implementation Prompt: Enforce Dataset Hierarchy Invariants and Safe-Import Verification

## Goal

Resolve the dataset baseline mismatch and enforce strict structural hierarchy invariants across `studio/scripts/seed/build-ndjson.mjs` and `studio/scripts/seed/safe-import.mjs`:
1. **Baseline Resolution**: Acknowledge that the 10/120 baseline in historical prompt 40 was superseded by prompt 41 and prompt 42, establishing the canonical 20 courses, 80 modules, and 240 lessons baseline (11 instructors, 11 categories).
2. **Hierarchy Validation in `build-ndjson.mjs`**: Enforce that every course contains exactly 4 modules, every module contains exactly 3 lessons, total courses match 20, and total lessons match 240. Exit with `process.exit(1)` if any invariant is violated.
3. **Pre- and Post-Import Verification in `safe-import.mjs`**: Compute pre-import counts and validate hierarchy from the seed file, compare with live post-import counts from Sanity, and fail the process (`process.exit(1)`) if live counts do not meet expected counts or if hierarchy invariants fail, instead of merely logging them.

---

## Skills and Docs Read

- `AGENTS.md` (Section 2 How to work, Section 8 Data Model, Section 13 Checks).
- `sanity-best-practices` (`references/schema.md`, `references/groq.md`).
- `prompts/40-seed-sample-content-sanity.md`.
- `prompts/41-restore-previous-courses-and-merge-dataset.md`.
- `prompts/42-non-destructive-seed-and-import-safeguard.md`.

---

## Code Inspected

- `studio/scripts/seed/build-ndjson.mjs`:
  - Validates document IDs and reference existence (instructor, category, lesson refs).
  - Lacks enforcement of 4 modules per course, 3 lessons per module, and expected 20/240 counts.
- `studio/scripts/seed/safe-import.mjs`:
  - Loads documents, executes batched `createOrReplace` upserts, and queries live counts from Sanity.
  - Only logs live counts (`console.log('📊 Current live Sanity dataset counts:', queryJson.result)`) without comparing against pre-import counts or validating hierarchy.
- `studio/scripts/seed/seed.ndjson`:
  - Current verified production dataset: 20 courses, 240 lessons, 11 categories, 11 instructors (all 20 courses have exactly 4 modules with 3 lessons each).

---

## Decisions and Assumptions

1. **Active Baseline Preservation (20 / 240)**:
   - The review finding suggested enforcing 10 courses / 120 lessons based on lines 76-79 of prompt 40. However, prompt 41 explicitly restored the original 10 courses to achieve the current production total of 20 courses and 240 lessons.
   - Restricting to 10 courses would reject the production dataset and discard half the catalog.
   - We enforce the active baseline: `EXPECTED_COURSES = 20`, `MODULES_PER_COURSE = 4`, `LESSONS_PER_MODULE = 3`, `EXPECTED_LESSONS = 240`.
2. **Strict Hierarchy Invariant Checks**:
   - In `build-ndjson.mjs`, iterate every course and verify:
     - `course.modules.length === 4`
     - For each module, `module.lessons.length === 3`
     - Total courses === 20 and total lessons === 240.
     - Any violation increments error count and triggers `process.exit(1)`.
3. **Safe-Import Verification & Hard Failure**:
   - In `safe-import.mjs`:
     - Validate hierarchy invariants of input documents prior to sending mutations.
      - Extract pre-import counts (`courses`, `lessons`, `instructors`, `categories`).
      - After import, query live counts from Sanity via GROQ.
      - Compare live counts: enforce canonical minimums (at least 20 courses and 240 lessons) separately from non-deletion checks (`live.courses >= pre.courses`, `live.lessons >= pre.lessons`, etc.); fail with explicit errors and `process.exit(1)` if any check fails.

---

## Files to Create or Change

```text
studio/scripts/seed/build-ndjson.mjs    [MODIFY] Add strict 4-module, 3-lesson, and 20/240 baseline hierarchy validation
studio/scripts/seed/safe-import.mjs    [MODIFY] Add pre-import hierarchy checks, pre- vs post-import count comparison, and exit(1) on mismatch
```

---

## Requirements

1. `build-ndjson.mjs` must enforce exactly 4 modules per course and 3 lessons per module, failing if counts deviate from 20 courses and 240 lessons.
2. `safe-import.mjs` must fail with non-zero exit code if input hierarchy invariants are invalid or if live post-import counts fall below expected counts.
3. Keep changes minimal and maintain existing non-destructive import safety.

---

## Security Considerations

- Prevents corrupt, truncated, or incomplete curriculum hierarchies from being generated or deployed into Sanity.
- Maintains zero-deletion policy during imports.

---

## Acceptance Criteria

1. `node studio/scripts/seed/build-ndjson.mjs` validates all 20 courses, 80 modules, and 240 lessons, exiting with code 0 on valid data and code 1 on invalid data.
2. `safe-import.mjs` compares pre-import vs post-import counts and exits with code 1 if counts do not match or if hierarchy invariants fail.
3. Live document integrity in `seed.ndjson` is preserved with all 282 documents.

---

## Checks to Run

- `node studio/scripts/seed/build-ndjson.mjs`
- `npx eslint` or node execution verification on both updated scripts.

---

## Exact Manual Test Steps

1. Run `node studio/scripts/seed/build-ndjson.mjs` and observe the summary affirming all 20 courses, 80 modules, and 240 lessons pass hierarchy checks.
2. Temporarily test error handling by inspecting validation logic with invalid data to verify it exits with code 1.
3. Run `npm run seed:build` in `studio/` to verify script integration.
