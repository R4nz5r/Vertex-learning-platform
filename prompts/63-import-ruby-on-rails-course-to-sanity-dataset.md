# Implementation Prompt 63: Import Ruby on Rails Course to Live Sanity Dataset

## Goal
Import and publish the newly created "Ruby on Rails Modern Web Development" course document and its 12 lesson documents from `studio/scripts/seed/seed.ndjson` into the live Sanity Cloud `production` dataset (`projectId: 0p3a2wia`), enabling it to be viewed and edited in Sanity Studio and displayed on the Vertex website.

## Skills Read
- `AGENTS.md` (Standalone studio, private dataset, seed import flow, and verification)
- `sanity-best-practices` (`.agents/skills/sanity-best-practices/SKILL.md`)

## Code Inspected
- `studio/scripts/seed/seed.ndjson`: Contains 295 validated documents, including `course.ruby-on-rails-modern-web-development` and 12 `lesson.ruby-on-rails-*` documents.
- `studio/scripts/seed/safe-import.mjs`: Script that imports documents non-destructively and verifies pre/post live counts.
- `studio/package.json`: Contains `seed:import` and `seed:import-cli` scripts.
- Live Sanity `production` dataset: Verified currently contains 20 courses; needs the 21st course upserted.

## Decisions and Assumptions
- Use a dedicated least-privilege write token (`SANITY_API_WRITE_TOKEN`) loaded through the project's secret-management interface (`.env.local` / process environment) to execute the safe import into the `production` dataset.
- Use additive import that avoids deletes and preserves unseeded fields, but note that it may overwrite seeded fields on existing documents (`createIfNotExists` + `patch.set`).
- Verify live Sanity dataset query confirms `course.ruby-on-rails-modern-web-development` and 12 lessons exist in the cloud dataset.

## Files Expected to Touch
- Live Sanity Cloud dataset `production` (via `safe-import.mjs` / CLI import)

## Requirements
1. Import `course.ruby-on-rails-modern-web-development` and 12 associated lesson documents into the `production` dataset.
2. Verify live dataset returns 21 courses from Sanity API.
3. Ensure Sanity Studio desk reflects the new Ruby on Rails course immediately.

## Security Considerations
- Require dataset-scoped credentials (`SANITY_API_WRITE_TOKEN`) loaded through the secret-management interface without exposing secrets or persisting developer credentials to disk.
- Mutations are additive and avoid deletes, but may overwrite seeded fields on existing documents.

## Acceptance Criteria
- Live GROQ query `*[_type == "course" && slug.current == "ruby-on-rails-modern-web-development"][0]` returns the course document.
- Live course count in `production` dataset increases from 20 to 21.
- Sanity Studio at `http://localhost:3333` displays "Ruby on Rails Modern Web Development" in the Courses desk list.

## Checks to Run
- Live GROQ query to Sanity API for course document.
- Live document count verification (21 courses, 252 lessons).

## Exact Manual Test Steps
1. In Sanity Studio (`http://localhost:3333`), click **Courses** in the sidebar.
2. Select **Ruby on Rails Modern Web Development** and verify its 4 modules, 12 lessons, learning outcomes, and instructor reference.
3. In Next.js web application, navigate to `/courses/ruby-on-rails-modern-web-development` to view the course page.
