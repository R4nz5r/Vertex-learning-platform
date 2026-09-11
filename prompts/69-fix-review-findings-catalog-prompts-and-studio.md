# Implementation Prompt 69: Fix Review Findings for Course Catalog, Prompts, and Studio Schema

## Goal

Address and resolve verified, still-valid review findings from code review while skipping non-code operational notes:
1. **`components/course/course-search-catalog.tsx`**: Expose active filter state on level filter buttons by binding `aria-pressed={isActive}`.
2. **`prompts/61-update-sanity-in-standalone-studio.md`**:
   - Update `@sanity/vision` version description to document the `^6.13.1` baseline (pre-change `^5.31.2`).
   - Align `@sanity/icons` to retain `^3.8.0` across goal, decisions, and requirements (preserving root named exports for React 19/Sanity 6 compatibility).
3. **`prompts/62-add-ruby-on-rails-course.md`**:
   - Update Ruby on Rails seed description to clarify that 4 modules with 3 lessons each is course-specific, preserving builder behavior of `minModulesPerCourse: 4, minLessonsPerModule: 1`.
   - Update baseline instruction to `minCourses: 22` / `expectedCourses: 22` to match the 22-course seed validation, and explicitly label the 295 total documents (11 categories, 11 instructors, 21 courses, 252 lessons) as the intermediate pre-import 21-course baseline prior to adding the 22nd course.
4. **`prompts/63-import-ruby-on-rails-course-to-sanity-dataset.md`**:
   - Replace administrator credentials/session and developer-specific config path with dedicated least-privilege write token (`SANITY_API_WRITE_TOKEN`) via secret management.
   - Accurately describe `safe-import.mjs` mutation behavior: additive and avoids deletes, but overwrites seeded fields on existing documents.
5. **`prompts/64-add-and-upload-oop-course.md` & `prompts/66-fix-course-curricula-and-youtube-embeds.md`**:
   - Require dataset-scoped write credentials rather than administrator sessions; avoid presenting non-disk writes as sufficient access control.
   - Align import safety descriptions consistently (`createIfNotExists` + `patch.set` avoids deletes and preserves unseeded fields, but may overwrite seeded fields on existing documents).
   - Require embedded-player playback verification for all replacement video URLs (beyond basic oEmbed 200 OK checks).
   - Update repair scope to cover all video-audit failures across courses 11–22 via data-driven failed-URL list.
6. **`studio/schemaTypes/lessonType.ts`**:
   - Skip code change with brief reason: the `summary` field is already properly defined in schema syntax; deploying Studio and importing documents are operational runtime steps per AGENTS.md Section 13.

---

## Skills Read

- `AGENTS.md` (Sections 2, 5, 8, 12, 13)
- `sanity-best-practices` (`.agents/skills/sanity-best-practices/SKILL.md`)
- `content-modeling-best-practices` (`.agents/skills/content-modeling-best-practices/SKILL.md`)

---

## Code Inspected

- `components/course/course-search-catalog.tsx`: Lines 216–235 render level filter buttons using `isActive` styling but lack `aria-pressed={isActive}`.
- `prompts/61-update-sanity-in-standalone-studio.md`: Contains conflicting `@sanity/icons` requirements (upgrading to `^5.2.2` vs retaining `^3.8.0`) and outdated `@sanity/vision` baseline without labeling it pre-change.
- `prompts/62-add-ruby-on-rails-course.md`: Invariant wording conflated course-specific structure with platform rules; baseline instruction referenced 21 courses instead of 22; math typo listed 294 instead of 295 documents (labeled as the pre-import 21-course count).
- `prompts/63-import-ruby-on-rails-course-to-sanity-dataset.md`: Referenced CLI admin config file instead of scoped write token, and omitted note that `patch.set` overwrites seeded fields on existing documents.
- `prompts/64-add-and-upload-oop-course.md` & `prompts/66-fix-course-curricula-and-youtube-embeds.md`: Lacked embedded-player verification requirement, restricted audit scope to courses 11-20 instead of 11-22, and referenced admin credentials.
- `studio/schemaTypes/lessonType.ts`: Verified lines 25–31 cleanly define the `summary` field.

---

## Decisions and Assumptions

1. **Accessibility**:
   - Add `aria-pressed={isActive}` to the filter pill button in `components/course/course-search-catalog.tsx` so screen readers perceive the toggle state.
2. **Icon & Vision Dependencies**:
   - Keep `@sanity/icons` at `^3.8.0` in `prompts/61` to avoid breaking root icon imports. Document `@sanity/vision` baseline as `^6.13.1` (pre-change `^5.31.2`).
3. **Seeding Invariants & Baseline**:
   - In `prompts/62`, specify that 4 modules with 3 lessons is specific to the Rails course authoring, while platform validator enforces `minModulesPerCourse: 4, minLessonsPerModule: 1`. Update baseline to `minCourses: 22` / `expectedCourses: 22` and explicitly label the 295 total documents (11 categories, 11 instructors, 21 courses, 252 lessons) as the pre-import 21-course baseline.
4. **Secret Management & Safe Import Semantics**:
   - In `prompts/63`, `64`, and `66`, mandate `SANITY_API_WRITE_TOKEN` loaded through environment variables / `.env.local`. Clarify that `safe-import.mjs` avoids deletions but overwrites seeded fields on matched IDs.
5. **Video Verification & Scope**:
   - In `prompts/64` and `66`, specify embedded-player playback verification for all replacement URLs and expand repair scope across courses 11–22.
6. **Skip Operational Nitpick**:
   - No code edits to `studio/schemaTypes/lessonType.ts`.

---

## Files to Touch

- `components/course/course-search-catalog.tsx` [MODIFY]
- `prompts/61-update-sanity-in-standalone-studio.md` [MODIFY]
- `prompts/62-add-ruby-on-rails-course.md` [MODIFY]
- `prompts/63-import-ruby-on-rails-course-to-sanity-dataset.md` [MODIFY]
- `prompts/64-add-and-upload-oop-course.md` [MODIFY]
- `prompts/66-fix-course-curricula-and-youtube-embeds.md` [MODIFY]

---

## Requirements

1. In `components/course/course-search-catalog.tsx`: Add `aria-pressed={isActive}` to the level button element.
2. In `prompts/61-update-sanity-in-standalone-studio.md`: Update line 4, line 11, and line 31 to align `@sanity/icons` to `^3.8.0` and accurately describe `@sanity/vision` baseline.
3. In `prompts/62-add-ruby-on-rails-course.md`: Clarify course-specific 4x3 structure in line 4, update baseline to 22 in line 49, and document the 295 document total (11 categories, 11 instructors, 21 courses, 252 lessons) as the pre-import 21-course baseline in line 50.
4. In `prompts/63-import-ruby-on-rails-course-to-sanity-dataset.md`: Replace admin auth with scoped write token in line 17 and line 30; describe additive mutation with seeded field overwrite in line 18.
5. In `prompts/64-add-and-upload-oop-course.md` & `prompts/66-fix-course-curricula-and-youtube-embeds.md`: Update access control, import safety description, playback validation (embedded-player verification), and full audit scope across courses 11–22.

---

## Security Considerations

- Scoped credentials: Emphasize least-privilege `SANITY_API_WRITE_TOKEN` via environment variables rather than admin sessions or shared config files.
- Dataset safety: Explicitly acknowledge that field-level patches overwrite seeded fields for existing documents.

---

## Acceptance Criteria

- Level filter buttons in `course-search-catalog.tsx` have `aria-pressed` bound to `isActive`.
- All prompt documentation aligns with actual codebase invariants, dependency versions, and security practices.
- `npx tsc --noEmit` exits with 0.
- `npm --prefix studio run seed:build` exits with 0.

---

## Checks to Run

- `npx tsc --noEmit`
- `npm --prefix studio run seed:build`
- `npm run lint`

---

## Exact Manual Test Steps

1. Inspect `components/course/course-search-catalog.tsx` and verify `aria-pressed={isActive}` is present on the level buttons.
2. Run `npx tsc --noEmit` to verify type safety.
3. Run `npm --prefix studio run seed:build` to confirm dataset validation passes.
