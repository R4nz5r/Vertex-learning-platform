# Implementation Prompt: Seed Sample Content in Sanity

## Goal

Seed the Sanity `production` dataset with realistic, high-quality sample content covering programming, development, AI, cloud, and security:
- **6 Categories**: Frontend Development, Backend & Systems, Artificial Intelligence, DevOps & Cloud, Full-Stack Engineering, Cybersecurity.
- **5 Instructors**: Expert profiles with biographies, specialties, and Lorem Picsum seeded avatars (`https://picsum.photos/seed/vertex-instructor-{slug}/800/800`).
- **10 Comprehensive Courses**: Full courses covering Next.js App Router, React Performance, TypeScript, AI Applications with LLMs, RAG from Scratch, Python Data Engineering, System Design, PostgreSQL, Docker & Kubernetes, and Web Security, with seeded cover images (`https://picsum.photos/seed/vertex-course-{slug}/1600/900`).
- **40 Modules & 120 Lessons**: Maintaining strict relational hierarchy where each course is composed of 4 modules, and each module contains 3 lessons with detailed Portable Text notes, key learning points, pro tips, external resources, durations, and 120 unique YouTube video references and seeded thumbnails.
- **Seeding Execution & Verification**: Import the validated dataset into the Sanity `production` dataset and verify data integrity via GROQ queries.

## Skills and Docs Read

- `AGENTS.md` (sections 1, 2, 4, 5 Structure, 7 Decisions, 8 Data Model, 9 Video Pipeline, 11 Search Behavior, 13 Checks).
- `sanity-best-practices` (`references/schema.md`, `references/portable-text.md`, `references/groq.md`).
- `sanity-migration` (`references/general.md`, `SKILL.md`).
- `content-modeling-best-practices` (`SKILL.md`).

## Code Inspected

- `studio/schemaTypes/` (`courseType.ts`, `lessonType.ts`, `instructorType.ts`, `categoryType.ts`, `blockContentType.ts`).
- `studio/scripts/seed/` (`seed.ndjson`, `build-ndjson.mjs`, `content.mjs`, `resolve-videos.mjs`, `videos.json`, `README.md`).
- `studio/package.json` (`seed:build`, `seed:import` scripts).
- Sanity Studio dataset (`production`).

## Decisions and Assumptions

1. **Deterministic Document IDs**:
   - Categories: `category.<slug>`
   - Instructors: `instructor.<slug>`
   - Lessons: `lesson.<course-slug>-<lesson-slug>`
   - Courses: `course.<slug>`
   - Guarantees idempotent imports with `--replace`.
2. **Relational Hierarchy & Constancy**:
   - Course contains ordered modules as embedded objects.
   - Each module contains an ordered array of lesson references.
   - Every module strictly aggregates its lessons (3 lessons per module).
   - Every course strictly aggregates its modules (4 modules per course, totaling 12 lessons per course).
   - Each lesson contains duration in seconds, rich Portable Text notes, key points array, pro tips, and external resources.
3. **Unique YouTube Videos & Seeded Picsum Images**:
   - 120 unique YouTube video URLs corresponding to the specific lessons.
   - Lorem Picsum seeded image assets for deterministic, clean imagery (`picsum.photos/seed/vertex-course-{slug}/...` and `picsum.photos/seed/vertex-instructor-{slug}/...`).
4. **Import & Verification**:
   - Validate with `npm run seed:build` in `studio/`.
   - Import into `production` dataset with `sanity dataset import scripts/seed/seed.ndjson production --replace`.
   - Verify via GROQ document queries that 6 categories, 5 instructors, 10 courses, and 120 lessons are active and properly linked.

## Files to Touch / Create

```text
studio/scripts/seed/seed.ndjson          [MODIFY] Seed dataset with Lorem Picsum seeded images and 120 unique YouTube lessons
studio/scripts/seed/build-ndjson.mjs      [VERIFY] Reference verification and NDJSON compilation
studio/scripts/seed/README.md             [VERIFY] Dataset documentation and import instructions
studio/package.json                       [VERIFY] Seed build and import commands
```

## Security Considerations

- No secret tokens are committed or exposed in seed files.
- Dataset import uses authenticated Sanity CLI session and targets the configured dataset.

## Acceptance Criteria

1. `studio/scripts/seed/seed.ndjson` contains exactly 6 categories, 5 instructors, 10 courses, and 120 lessons.
2. All instructor photos and course covers use Lorem Picsum seed URLs, and all 120 lessons have unique YouTube video URLs.
3. All module and course references resolve with 0 errors during `npm run seed:build`.
4. `sanity dataset import` imports all 141 documents cleanly into the dataset.
5. GROQ query against Sanity confirms 6 categories, 5 instructors, 10 courses, and 120 lessons exist in `production`.

## Checks to Run

```bash
npm run seed:build
npx sanity dataset import scripts/seed/seed.ndjson production --replace
npx sanity documents query "{'categories': count(*[_type == 'category']), 'instructors': count(*[_type == 'instructor']), 'courses': count(*[_type == 'course']), 'lessons': count(*[_type == 'lesson'])}"
```

## Manual Test Steps

1. In `studio/`, run `npm run seed:build` to confirm all reference graphs validate cleanly.
2. Run `npm run seed:import` or `npx sanity dataset import scripts/seed/seed.ndjson production --replace`.
3. Query the Sanity dataset using GROQ to verify that all 10 courses and their nested module lessons are stored and queryable.
4. Open Sanity Studio at `http://localhost:3333` and verify that courses, lessons, instructors, and categories display properly.
