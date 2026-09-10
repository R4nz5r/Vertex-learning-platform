# Implementation Prompt: Restore Previous Courses and Merge Datasets in Sanity

## Goal

Restore all previous courses, lessons, instructors, and categories that were removed during the recent seed operation, while preserving all newly added courses, lessons, and instructors.

- **Restore 10 Previous Courses & 120 Lessons**:
  - *Next.js App Router in Depth*
  - *React Performance Engineering*
  - *TypeScript for Application Developers*
  - *Building AI Apps with LLMs*
  - *Retrieval-Augmented Generation from Scratch*
  - *Python for Data Work*
  - *System Design Foundations*
  - *PostgreSQL for Developers*
  - *DevOps with Docker and Kubernetes*
  - *Practical Web Security*
- **Keep 10 Newly Added Courses & 120 Lessons**:
  - *Go for High-Performance Backends*
  - *Serverless Architecture on AWS*
  - *Advanced CSS & UI Engineering*
  - *Real-Time Apps with Supabase*
  - *Rust for Systems & WebAssembly*
  - *Building Scalable GraphQL APIs*
  - *AI-Assisted Software Engineering*
  - *Testing Modern Web Applications*
  - *Modern E-Commerce Architecture*
  - *Data Engineering Pipelines*
- **Combined Total Scale**: 20 courses, 80 modules, 240 lessons, 11 expert instructors, and 11 categories.
- **Full Relational Integrity**: Every course aggregates its 4 modules, each module aggregates its 3 lessons. No broken references or missing IDs.

## Skills and Docs Read

- `AGENTS.md` (Sections 1, 2, 4, 5 Structure, 7 Decisions, 8 Data Model, 13 Checks).
- `sanity-best-practices` (`references/schema.md`, `references/groq.md`).
- `sanity-migration` (`SKILL.md`).

## Code Inspected

- `studio/scripts/seed/seed.ndjson` (Current new dataset).
- Git revision `HEAD:studio/scripts/seed/seed.ndjson` (Original 141-document dataset).
- `studio/scripts/seed/http-import.mjs` (Script that uploads to Sanity production dataset).
- `studio/scripts/seed/build-ndjson.mjs` (Integrity validator).

## Decisions and Assumptions

1. **Union / Merge Strategy**:
   - Extract the complete original 141 documents from git history (`HEAD:studio/scripts/seed/seed.ndjson`).
   - Extract the 142 new documents from the current generation.
   - Merge them deterministically using document `_id` as primary key.
   - Combined file `studio/scripts/seed/seed.ndjson` will hold all 282 documents.
2. **Zero Loss of Past Content or Progress**:
   - Restoring all original lesson and course `_id`s ensures any existing user progress records (which key off course and lesson IDs) immediately resume working.
3. **Safe Idempotent Upload**:
   - Use `createOrReplace` mutations via Sanity API to restore all documents without deleting any of the new or existing records.

## Files to Touch / Create

```text
studio/scripts/seed/seed.ndjson          [MODIFY] Merge original 141 documents and new 142 documents into comprehensive 282-document dataset
studio/scripts/seed/merge-and-sync.mjs   [NEW] Script to extract original dataset, merge with new dataset, validate references, and upload to Sanity
studio/scripts/seed/http-import.mjs      [MODIFY] Remove aggressive legacy deletion logic to prevent future data drops
```

## Security Considerations

- No secrets or API keys exposed.
- Uses existing authenticated Sanity token from `.env.local` to safely update the dataset.

## Acceptance Criteria

1. `studio/scripts/seed/seed.ndjson` contains all 20 courses, 240 lessons, 11 instructors, and 11 categories.
2. `node scripts/seed/build-ndjson.mjs` runs with 0 missing references or duplicate ID errors.
3. All original 10 courses and their 120 lessons are fully restored and visible in Sanity `production`.
4. All 10 newly added courses and their 120 lessons remain intact and queryable in Sanity `production`.
5. GROQ verification confirms `courses: 20`, `lessons: 240`.

## Checks to Run

```bash
cd f:\Nextjs\vertex\studio
node scripts/seed/merge-and-sync.mjs
node scripts/seed/build-ndjson.mjs
```

## Manual Test Steps

1. Run `merge-and-sync.mjs` in `studio/`.
2. Verify GROQ count output in console showing 20 courses and 240 lessons.
3. Open `http://localhost:3000/courses` in browser and confirm that both original courses (e.g. *Next.js App Router in Depth*, *Practical Web Security*) and new courses (e.g. *Go for High-Performance Backends*, *Advanced CSS & UI Engineering*) are listed and navigable.
