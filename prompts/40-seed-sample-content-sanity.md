# Implementation Prompt: Seed Sample Content in Sanity (10 Courses, 120 Lessons)

## Goal

Seed the Sanity `production` dataset with realistic, high-grade curriculum content covering the user-specified topics:
- **10 Comprehensive Courses**:
  1. *Go for High-Performance Backends*
  2. *Serverless Architecture on AWS*
  3. *Advanced CSS & UI Engineering*
  4. *Real-Time Apps with Supabase*
  5. *Rust for Systems & WebAssembly*
  6. *Building Scalable GraphQL APIs*
  7. *AI-Assisted Software Engineering*
  8. *Testing Modern Web Applications*
  9. *Modern E-Commerce Architecture*
  10. *Data Engineering Pipelines*
- **40 Modules & 120 Lessons**: Maintaining strict relational constancy where each course is composed of exactly 4 modules, and each module contains exactly 3 lessons (12 lessons per course = 120 lessons total).
- **Categories & Instructors**: Clear taxonomy of categories and expert instructor profiles with rich biographies.
- **Unique YouTube Videos**: 120 distinct, topic-relevant YouTube video URLs and durations for every single lesson.
- **Lorem Picsum Seeded Images**: Deterministic, high-resolution seeded imagery for instructor avatars (`https://picsum.photos/seed/vertex-instructor-{slug}/800/800`) and course cover banners (`https://picsum.photos/seed/vertex-course-{slug}/1600/900`).
- **Complete Schema Adherence**: Full Portable Text notes with introductory text, bulleted topics, key points, pro tips, resource links, durations, student counts, and free preview flags.

## Skills and Docs Read

- `AGENTS.md` (Sections 1, 2, 4, 5 Structure, 7 Decisions, 8 Data Model, 9 Video Pipeline, 11 Search, 13 Checks).
- `sanity-best-practices` (`references/schema.md`, `references/portable-text.md`, `references/groq.md`).
- `sanity-migration` (`references/general.md`, `SKILL.md`).
- `content-modeling-best-practices` (`SKILL.md`).

## Code Inspected

- `studio/schemaTypes/` (`courseType.ts`, `lessonType.ts`, `instructorType.ts`, `categoryType.ts`, `blockContentType.ts`).
- `studio/scripts/seed/` (`seed.ndjson`, `build-ndjson.mjs`, `content.mjs`, `resolve-videos.mjs`, `videos.json`, `README.md`).
- `studio/package.json` (`seed:build`, `seed:import` scripts).

## Decisions and Assumptions

1. **Relational Constancy & Hierarchy**:
   - 10 Courses: each course document contains 4 ordered embedded `module` objects.
   - Each `module` contains an array of 3 `reference` objects pointing to `lesson` documents.
   - 4 modules × 3 lessons = 12 lessons per course.
   - 20 courses × 12 lessons = 240 unique lessons across 80 modules.
   - A module equals the sum of its lessons; a course equals the sum of its modules.
2. **Deterministic Document IDs**:
    - `category.<slug>`
    - `instructor.<slug>`
    - `lesson.<course-slug>-<lesson-slug>`
    - `course.<slug>`
    - Allows safe, idempotent imports via `npm run seed:import` (safe-import runner using field-level patches and strictly requiring a resolved write token).
3. **Unique YouTube Video URLs**:
    - 240 unique YouTube video IDs curated and mapped to each lesson's specific concepts.
4. **Lorem Picsum Seeded Images**:
    - Course covers: `https://picsum.photos/seed/vertex-course-{slug}/1600/900`
    - Instructor photos: `https://picsum.photos/seed/vertex-instructor-{slug}/800/800`
    - Lesson thumbnails: YouTube standard HQ thumbnail assets `https://i.ytimg.com/vi/{videoId}/hqdefault.jpg`.
5. **Rich Educational Metadata**:
    - Each lesson document includes rich Portable Text `notes` (paragraphs, headings, bullet lists), `keyPoints` array, `proTip` string, `resources` array, realistic `duration` in seconds, and `studentCount`.

## Files to Touch / Create

```text
studio/scripts/seed/generate-seed.mjs      [NEW] Comprehensive data generation script producing the complete 240-lesson dataset
studio/scripts/seed/seed.ndjson           [MODIFY] Replaced with the complete 280+ document dataset (20 courses, 240 lessons, categories, instructors)
studio/scripts/seed/build-ndjson.mjs      [VERIFY / RUN] Reference validation and formatting check
```

## Security Considerations

- No secrets or private tokens are contained in the dataset.
- The dataset import requires a non-empty resolved write token (`SANITY_API_WRITE_TOKEN` or `SANITY_API_TOKEN`). A read token fallback is strictly disallowed for mutations.

## Acceptance Criteria

1. `studio/scripts/seed/seed.ndjson` contains exactly 20 courses and 240 lessons.
2. All 240 lessons have unique YouTube video URLs with valid durations and realistic Portable Text notes.
3. Strict structural hierarchy is validated: 20 courses, each having 4 modules, each having 3 lessons (80 modules, 240 lessons total).
4. Reference validation passes with 0 missing references via `npm run seed:build`.
5. The dataset is successfully imported into Sanity `production` with `npm run seed:import` using a verified write token.
6. GROQ query confirms 20 courses and 240 lessons in the Sanity dataset.

## Checks to Run

```bash
cd f:\Nextjs\vertex\studio
npm run seed:build
npm run seed:import # Requires SANITY_API_WRITE_TOKEN; fails if missing or only read-token is configured
npx sanity documents query "{'categories': count(*[_type == 'category']), 'instructors': count(*[_type == 'instructor']), 'courses': count(*[_type == 'course']), 'lessons': count(*[_type == 'lesson'])}"
```

## Manual Test Steps

1. Run `npm run seed:build` in `studio/` to verify reference graph consistency and lack of broken refs or duplicate IDs.
2. Import the dataset to Sanity `production` via `npm run seed:import` (`safe-import.mjs`), ensuring `SANITY_API_WRITE_TOKEN` is present.
3. Query the document counts via GROQ to confirm 20 courses and 240 lessons.
4. Verify the web application catalog at `http://localhost:3000/courses` to inspect the rendered courses and lesson hierarchy.
