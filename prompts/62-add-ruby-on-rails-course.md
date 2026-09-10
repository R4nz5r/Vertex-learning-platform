# Implementation Prompt 62: Add Ruby on Rails Course

## Goal
Add a comprehensive, production-grade "Ruby on Rails Modern Web Development" course to the Vertex learning platform. The new course adheres to all established platform and Sanity content invariants: exactly 4 modules, exactly 3 lessons per module (12 lessons total), structured Portable Text notes, key points, learning outcomes, resources, video metadata, and associations with an existing category and instructor.

## Skills Read
- `AGENTS.md` (Content modeling rules, 4 modules / 3 lessons invariant, lesson/course relationships)
- `content-modeling-best-practices` (`.agents/skills/content-modeling-best-practices/SKILL.md`)
- `sanity-best-practices` (`.agents/skills/sanity-best-practices/SKILL.md`)

## Code Inspected
- `studio/scripts/seed/build-ndjson.mjs`: Validates references and structural hierarchy (`validateReferences`, `validateHierarchy`). Invariant checks will be updated from 20 courses / 240 lessons to 21 courses / 252 lessons.
- `studio/scripts/seed/content.mjs`: Reads and parses `seed.ndjson`.
- `studio/scripts/seed/seed.ndjson`: Canonical dataset storing courses, lessons, categories, and instructors.
- `studio/scripts/seed/safe-import.mjs`: Performs additive, non-destructive import with pre/post-count checks.

## Decisions and Assumptions
- Course topic: **Ruby on Rails Modern Web Development** (`course.ruby-on-rails-modern-web-development`).
- Category: `category.web-development` (existing Web Development category).
- Instructor: `instructor.daniel-okafor` (senior backend and database architecture instructor).
- Structure: Exactly 4 modules, each containing exactly 3 lessons (12 lessons total):
  - Module 1: *Rails Fundamentals and MVC Architecture*
    - Lesson 1.1: Introduction to Rails & the MVC Pattern
    - Lesson 1.2: RESTful Routing and Resourceful Controllers
    - Lesson 1.3: Views, Layouts, and ActionView Helpers
  - Module 2: *Data Modeling with ActiveRecord*
    - Lesson 2.1: Database Migrations and Schema Management
    - Lesson 2.2: Associations, Validations, and Callbacks
    - Lesson 2.3: ActiveRecord Querying and Avoiding N+1 Queries
  - Module 3: *Modern Frontends with Hotwire and Turbo*
    - Lesson 3.1: Turbo Drive and Page Transitions
    - Lesson 3.2: Turbo Frames for Scoped Component Updates
    - Lesson 3.3: Turbo Streams and Real-Time WebSocket Broadcasting
  - Module 4: *Authentication, Background Jobs, and Production*
    - Lesson 4.1: User Authentication and Authorization Patterns
    - Lesson 4.2: ActiveJob and Background Workers
    - Lesson 4.3: Production Deployment, Docker, and Performance Tuning
- Content quality: Rich Portable Text blocks for lesson notes, 3 bulleted key points, pro tips, resource links, deterministic cover image, and YouTube video URLs with thumbnails.
- Dataset update: Update `seed.ndjson` with the new course and 12 lesson documents. Update `build-ndjson.mjs` expected baseline to 21 courses and 252 lessons.

## Files Expected to Touch
- `studio/scripts/seed/seed.ndjson`
- `studio/scripts/seed/build-ndjson.mjs`

## Requirements
1. Define 12 new lesson documents with unique IDs (`lesson.ruby-on-rails-*`), valid slugs, video URLs, thumbnails, durations, Portable Text notes, key points, proTips, and resources.
2. Define 1 new course document (`course.ruby-on-rails-modern-web-development`) with summary, level (`intermediate`), price ($79), popular flag (`true`), student count (14,250), 4 learning outcomes, category ref, instructor ref, and 4 modules referencing the 12 lessons.
3. Append the documents to `studio/scripts/seed/seed.ndjson`.
4. Update `expectedCourses: 21` in `studio/scripts/seed/build-ndjson.mjs`.
5. Run `npm --prefix studio run seed:build` to validate reference integrity and structural invariants (294 total documents: 11 categories, 11 instructors, 21 courses, 252 lessons).
6. Verify web workspace type checks with `npx tsc --noEmit`.

## Security Considerations
- All IDs follow alphanumeric/dot conventions.
- No sensitive keys or external write mutations performed without user-configured tokens.
- All documents remain additive and non-destructive.

## Acceptance Criteria
- `seed.ndjson` contains the new Ruby on Rails course and all 12 lesson documents.
- `build-ndjson.mjs` validation passes with 0 missing references and 0 hierarchy errors.
- Summary reflects: `{ category: 11, instructor: 11, course: 21, lesson: 252 }` (total: 295 documents).
- `npx tsc --noEmit` exits with code 0 in both `studio/` and root web workspace.

## Checks to Run
- `npm --prefix studio run seed:build`
- `node -c studio/scripts/seed/build-ndjson.mjs`
- `npx tsc --noEmit`

## Exact Manual Test Steps
1. Run `npm --prefix studio run seed:build` and check console summary for 21 courses and 252 lessons.
2. Search or inspect `seed.ndjson` to verify course `course.ruby-on-rails-modern-web-development` is present.
3. Start the web app (`npm run dev`) and navigate to `/courses/ruby-on-rails-modern-web-development` to see the course detail page with 4 modules and 12 lessons.
