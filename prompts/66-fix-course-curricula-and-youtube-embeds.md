# Implementation Prompt 66: Fix Course Curricula and YouTube Embeds

## Goal
Resolve playback and structural issues identified in the course catalog:
1. Replace non-working video URLs in "Object-Oriented Programming: Principles & Design Patterns" and "Ruby on Rails Modern Web Development" with verified, embeddable YouTube videos (tested with `200 OK` via YouTube oembed).
2. Restructure the Object-Oriented Programming course so the SOLID principles are expanded into 5 dedicated modules (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion) alongside OOP Foundations, Creational & Structural Patterns, and Behavioral Patterns.
3. Update `build-ndjson.mjs` and `safe-import.mjs` to eliminate the rigid 4-module / 3-lesson artificial constraint, validating that courses have at least 4 modules and modules have at least 1 valid lesson reference without capping comprehensive curricula.
4. Audit and fix non-working video URLs across all other courses.
5. Validate `seed.ndjson` with `npm --prefix studio run seed:build` and sync the updated courses and lessons to the live Sanity `production` dataset via `safe-import.mjs`.

## Skills Read
- `AGENTS.md` (Content modeling, video playback embed requirements, live Sanity sync)
- `content-modeling-best-practices` (`.agents/skills/content-modeling-best-practices/SKILL.md`)
- `sanity-best-practices` (`.agents/skills/sanity-best-practices/SKILL.md`)

## Code Inspected
- `studio/scripts/seed/seed.ndjson`: Contains 22 courses and 264 lessons.
- `lib/video.ts`: `extractYouTubeId` and `getEmbedUrl` generate `https://www.youtube-nocookie.com/embed/${youtubeId}`.
- `studio/scripts/seed/build-ndjson.mjs`: `validateHierarchy` rigidly enforced 4 modules and 3 lessons per module.
- `studio/scripts/seed/safe-import.mjs`: Also checked `course.modules.length !== 4` and `mod.lessons.length !== 3`.
- Video audit: Revealed 128 broken video URLs across courses 11–22 due to synthetic IDs.

## Decisions and Assumptions
- Every replacement YouTube video URL will undergo independent embedded-player playback verification (confirming embed permissions and streaming capability beyond a simple oEmbed 200 OK response) before inclusion.
- OOP Course Structure:
  - Module 1: *Foundations of Object-Oriented Programming* (Encapsulation, Abstraction, Inheritance, Polymorphism)
  - Module 2: *SOLID: Single Responsibility Principle (SRP)*
  - Module 3: *SOLID: Open/Closed Principle (OCP)*
  - Module 4: *SOLID: Liskov Substitution Principle (LSP)*
  - Module 5: *SOLID: Interface Segregation Principle (ISP)*
  - Module 6: *SOLID: Dependency Inversion Principle (DIP)*
  - Module 7: *Creational & Structural Design Patterns* (Factory, Builder, Adapter, Decorator)
  - Module 8: *Behavioral Patterns & Clean Refactoring* (Strategy, Observer, Command, Code Smells)
- Ruby on Rails Course Structure:
  - Ensure all 12 lessons have verified, live, embeddable YouTube videos from reputable Rails creators and tutorials.
- Validator updates:
  - In `build-ndjson.mjs` and `safe-import.mjs`, update hierarchy validation to require `modules.length >= 4` and `mod.lessons.length >= 1` rather than fixed equality, ensuring no module or course is empty while allowing natural curriculum expansion.
- Live Sanity Sync:
  - Run `safeImport()` to update the live Sanity Cloud `production` dataset with the verified videos and new modules.

## Files Expected to Touch
- `studio/scripts/seed/seed.ndjson`
- `studio/scripts/seed/build-ndjson.mjs`
- `studio/scripts/seed/safe-import.mjs`
- Live Sanity Cloud `production` dataset

## Requirements
1. Update `build-ndjson.mjs` and `safe-import.mjs` hierarchy rules:
   - Accept variable module counts per course (`modules.length >= 4`).
   - Accept variable lesson counts per module (`mod.lessons.length >= 1`).
   - Retain 100% reference validation (`validateReferences`).
2. Expand OOP course to include 5 distinct SOLID modules and replace all video URLs with verified live YouTube videos.
3. Replace all video URLs in Ruby on Rails course with verified live YouTube videos.
4. Replace broken video URLs across all video-audit failures (courses 11–22) using a data-driven failed-URL list with verified live YouTube videos.
5. Run `npm --prefix studio run seed:build` to validate all documents and references.
6. Run `safe-import.mjs` to sync all updated documents to the live Sanity `production` dataset.
7. Verify `npx tsc --noEmit` passes with 0 errors.

## Security Considerations
- All video URLs are public educational YouTube videos with standard iframe embedding allowed.
- Require dedicated dataset-scoped write token (`SANITY_API_WRITE_TOKEN`) loaded through secret management (`.env.local` / process environment); avoiding disk writes alone is not presented as sufficient access control.

## Acceptance Criteria
- Video player on OOP and Ruby on Rails lessons loads and plays live YouTube videos without "Video unavailable" errors.
- OOP course shows dedicated modules for all 5 SOLID principles.
- `seed:build` validation passes with 0 reference and hierarchy errors.
- Live Sanity dataset is updated and verified.
- `npx tsc --noEmit` exits with code 0.

## Checks to Run
- Verification script testing embedded-player playback capability across all replaced lesson videos.
- `npm --prefix studio run seed:build`
- `safeImport()` live sync verification
- `npx tsc --noEmit`

## Exact Manual Test Steps
1. Navigate to `/courses/object-oriented-programming-design-patterns` and verify 8 modules including all 5 SOLID principle modules.
2. Click into any OOP lesson and press Play; verify the YouTube video streams immediately.
3. Navigate to `/courses/ruby-on-rails-modern-web-development`, open any lesson, and verify video plays properly.
4. In Sanity Studio (`http://localhost:3333`), verify the updated course modules and lessons are published.
