# Implementation Prompt: Course Images Hybrid Approach (Code Fallbacks & Automated Sanity Asset Ingestion)

## Goal

Ensure all courses and instructors have high-quality, reliable imagery everywhere across the application (Course Hero, All Courses catalog, Home page, Lesson page, and Sanity Studio) through the **Hybrid Approach**:
1. **Automated Sanity Asset Ingestion**: Run a dedicated background script that downloads the 20 high-res course covers and 11 instructor profile photos from their Lorem Picsum seeds, uploads them directly into the Sanity Asset Store (`sanity.imageAsset`), and links them to the documents in Sanity `production`.
2. **Resilient Frontend Code Fallbacks**: Update image resolvers in `CourseHero`, `CourseCard` catalog icons, and lesson pages so that if any image asset is ever missing or slow, it deterministically resolves to `https://picsum.photos/seed/vertex-course-{slug}/...` (and lesson video thumbnails to YouTube HQ default), guaranteeing 100% zero-configuration image availability for any current or future course.

## Skills and Docs Read

- `AGENTS.md` (Sections 1, 2, 3 UI Work, 5 Structure, 6 Tech Stack, 7 Decisions, 8 Data Model, 13 Checks).
- `sanity-best-practices` (`references/image.md`, `references/schema.md`).

## Code Inspected

- `next.config.ts` (Already contains `picsum.photos`, `cdn.sanity.io`, and `i.ytimg.com` in `remotePatterns`).
- `components/course/course-hero.tsx` (Reads `coverImage?.asset?.url` with fallback).
- `app/courses/page.tsx` & `app/page.tsx` (`resolveCourseIcon` renders `Image` or tech logo).
- `app/lessons/[slug]/page.tsx` (`thumbnailUrl` and `courseCoverUrl` resolution).
- `studio/scripts/seed/test-asset.mjs` (Verified Sanity image asset API upload works in 2s).

## Decisions and Assumptions

1. **Dual Protection**:
   - Native Sanity Assets: Uploading official `sanity.imageAsset` records ensures Sanity Studio and standard GROQ `coverImage { asset->{ url } }` queries return real image assets.
   - Intelligent Code Fallback: Ensures that any course created in the future immediately displays a visually rich cover even before any asset is uploaded.
2. **Deterministic Seed URLs**:
   - Course Covers: `https://picsum.photos/seed/vertex-course-${slug}/1600/900`
   - Course Thumbnails: `https://picsum.photos/seed/vertex-course-${slug}/800/800`
   - Instructor Avatars: `https://picsum.photos/seed/vertex-instructor-${slug}/800/800`
   - Lesson Thumbnails: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
3. **Non-Destructive Execution**:
   - The asset upload script patches only the `coverImage` and `photo` fields of existing documents without altering any lessons, modules, or text fields.

## Files to Touch / Create

```text
studio/scripts/seed/upload-assets.mjs        [NEW] Automated script to fetch Lorem Picsum images and upload to Sanity asset store
components/course/course-hero.tsx            [MODIFY] Add deterministic Picsum fallback for course cover
app/courses/page.tsx                         [MODIFY] Update resolveCourseIcon to render cover thumbnail or branded icons
app/page.tsx                                 [MODIFY] Update resolveCourseIcon to render cover thumbnail or branded icons
app/lessons/[slug]/page.tsx                  [MODIFY] Ensure fallback for thumbnail and course cover
```

## Security Considerations

- Images use safe external origins already explicitly permitted in `next.config.ts`.
- Sanity API token stays on the server; asset upload script runs with existing secure environment variables.

## Acceptance Criteria

1. Running `upload-assets.mjs` uploads all 20 course covers and 11 instructor photos to Sanity CDN.
2. Visiting `/courses/[slug]` displays the course cover image in `CourseHero` (no generic fallback).
3. Visiting `/courses` and `/` displays course thumbnails or branded icons on every course card.
4. Visiting `/lessons/[slug]` displays the course cover in the sidebar and video thumbnail without blanks.
5. `npx tsc --noEmit` and build checks pass with zero errors.

## Checks to Run

```bash
cd f:\Nextjs\vertex\studio
node scripts/seed/upload-assets.mjs
cd f:\Nextjs\vertex
npx tsc --noEmit
```

## Manual Test Steps

1. Run `node scripts/seed/upload-assets.mjs` in `studio/` and observe all 20 courses and 11 instructors receiving Sanity CDN image asset IDs.
2. Open `http://localhost:3000/courses` and confirm that every course card displays an image thumbnail or brand logo.
3. Click any course (e.g. `/courses/go-for-high-performance-backends` or `/courses/nextjs-app-router-in-depth`) and confirm the hero image renders cleanly.
4. Click into a lesson and verify the sidebar displays the course cover and video thumbnail.
