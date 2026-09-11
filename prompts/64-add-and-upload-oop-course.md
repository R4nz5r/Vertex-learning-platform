# Implementation Prompt 64: Add and Upload Object-Oriented Programming (OOP) Course

## Goal
Design, validate, and upload a comprehensive "Object-Oriented Programming: Principles & Design Patterns" course to both the local seed dataset and the live Sanity Cloud `production` dataset (`projectId: 0p3a2wia`). The course strictly obeys all platform invariants: exactly 4 modules, exactly 3 lessons per module (12 lessons total), rich Portable Text notes, key points, learning outcomes, resources, and valid references.

## Skills Read
- `AGENTS.md` (Content modeling rules, 4 modules / 3 lessons invariant, lesson/course relationships, independent Studio workspace, additive dataset sync)
- `content-modeling-best-practices` (`.agents/skills/content-modeling-best-practices/SKILL.md`)
- `sanity-best-practices` (`.agents/skills/sanity-best-practices/SKILL.md`)

## Code Inspected
- `studio/scripts/seed/build-ndjson.mjs`: Validates references and structural hierarchy. Invariant updated to 22 courses and 264 lessons.
- `studio/scripts/seed/seed.ndjson`: Canonical seed dataset containing 295 documents (21 courses, 252 lessons).
- `studio/scripts/seed/safe-import.mjs`: Script performing non-destructive additive import into the live Sanity dataset.
- Live Sanity Cloud `production` dataset: Currently has 21 courses; will be updated to 22 courses and 264 lessons.

## Decisions and Assumptions
- Course topic: **Object-Oriented Programming: Principles & Design Patterns** (`course.object-oriented-programming-design-patterns`).
- Category: `category.languages` (Languages & Paradigms).
- Instructor: `instructor.tomas-berg` (Systems architect and software engineering instructor).
- Structure: Exactly 4 modules, each containing exactly 3 lessons (12 lessons total):
  - Module 1: *Foundational Pillars of Object-Oriented Programming*
    - Lesson 1.1: Encapsulation and Information Hiding
    - Lesson 1.2: Inheritance vs Composition Trade-offs
    - Lesson 1.3: Polymorphism and Dynamic Dispatch
  - Module 2: *The SOLID Design Principles*
    - Lesson 2.1: Single Responsibility and Open-Closed Principles
    - Lesson 2.2: Liskov Substitution Principle and Contract Design
    - Lesson 2.3: Interface Segregation and Dependency Inversion
  - Module 3: *Creational and Structural Design Patterns*
    - Lesson 3.1: Factory Method and Abstract Factory Patterns
    - Lesson 3.2: Builder and Singleton Patterns
    - Lesson 3.3: Adapter and Decorator Patterns
  - Module 4: *Behavioral Patterns and Clean Architecture*
    - Lesson 4.1: Strategy and Command Patterns
    - Lesson 4.2: Observer and Event Notification Systems
    - Lesson 4.3: Refactoring Code Smells into Clean Object Design
- Video verification: Every newly added YouTube video URL undergoes embedded-player playback verification (confirming embed permissions and streaming capability beyond a simple oEmbed 200 OK check) to prevent playback failures.
- Dataset & Studio sync:
  - Append 1 course + 12 lessons to `studio/scripts/seed/seed.ndjson`.
  - Update `expectedCourses: 22` in `studio/scripts/seed/build-ndjson.mjs`.
  - Run `npm --prefix studio run seed:build` to confirm 0 missing references and 0 hierarchy errors (total: 308 documents).
  - Execute `safeImport()` into live Sanity `production` dataset so the course is immediately available in Sanity Studio and on the website.

## Files Expected to Touch
- `studio/scripts/seed/seed.ndjson`
- `studio/scripts/seed/build-ndjson.mjs`
- Live Sanity Cloud `production` dataset

## Requirements
1. Create 12 lesson documents (`lesson.oop-*`) with unique IDs, slugs, video URLs, thumbnails, durations, Portable Text notes, key points, pro tips, and resources.
2. Create 1 course document (`course.object-oriented-programming-design-patterns`) with summary, price ($79), popular flag, student count (15,800), 4 learning outcomes, category ref, instructor ref, and 4 modules referencing the 12 lessons.
3. Update `build-ndjson.mjs` invariant baseline to 22 courses and 264 lessons.
4. Execute `npm --prefix studio run seed:build` to validate all documents.
5. Run safe additive upload to the live Sanity Cloud `production` dataset using dedicated dataset-scoped write credentials (`SANITY_API_WRITE_TOKEN`) loaded through the secret-management interface.
6. Verify live GROQ query confirms 22 courses in production.

## Security Considerations
- Require dataset-scoped write credentials (`SANITY_API_WRITE_TOKEN`) loaded through secret management (`.env.local` / process environment) rather than administrator sessions.
- Mutations are additive and avoid deletes, but may overwrite seeded fields on existing documents (`createIfNotExists` + `patch.set`).

## Acceptance Criteria
- `seed.ndjson` contains the OOP course and 12 lesson documents.
- `npm --prefix studio run seed:build` passes with 0 missing references and 0 hierarchy errors (308 documents).
- Live Sanity dataset has 22 courses and 264 lessons.
- Sanity Studio (`http://localhost:3333`) displays "Object-Oriented Programming: Principles & Design Patterns" in Courses desk.
- Next.js website route `/courses/object-oriented-programming-design-patterns` loads the course page.

## Checks to Run
- `npm --prefix studio run seed:build`
- Live dataset verification script
- `npx tsc --noEmit`

## Exact Manual Test Steps
1. In Sanity Studio (`http://localhost:3333`), navigate to **Courses** and verify "Object-Oriented Programming: Principles & Design Patterns" appears.
2. In the web application, visit `/courses/object-oriented-programming-design-patterns` to view the course page and lesson syllabus.
