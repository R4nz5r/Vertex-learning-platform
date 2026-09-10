# Implementation Prompt 67: Dynamic Lesson Summary & Notes Cleanup

## Goal
Fix hardcoded Next.js placeholder copy ("Learn how Next.js handles data fetching and caching in both Server and Client Components.") in `components/lesson/lesson-content.tsx` so that all lessons across the platform dynamically display their own topic-specific summary and notes.

## Skills Read & References
- `sanity-best-practices` (`~/.claude/skills/sanity-best-practices/SKILL.md`) — Portable Text structures, schema definitions, and GROQ projections.
- `portable-text-serialization` (`~/.claude/skills/portable-text-serialization/SKILL.md`) — Extracting plain text from block content spans.
- `node_modules/next/dist/docs/` — App Router Server Component to Client Component prop boundaries.
- `AGENTS.md` — Section 3 (UI Fidelity), Section 5 (App Structure), Section 7 (Content Coherence), Section 8 (Data Shape), Section 13 (Verification Checks).

## Code Inspected
- `components/lesson/lesson-content.tsx`:
  - Line 193-196: Found hardcoded string `<p className="text-[15.5px] ...">Learn how Next.js handles data fetching and caching in both Server and Client Components.</p>` rendered statically under the lesson title for every lesson on the site.
  - Line 281-286: Found fallback text `<p>In this lesson, you&apos;ll learn how Next.js handles data fetching and caching...</p>` hardcoded if `lesson.notes` is absent.
- `seed.ndjson`:
  - Verified all 270 lessons in the dataset have an authored, topic-specific introductory text block in `notes[0]`. For example:
    - OOP DIP lesson (`oop-solid-dip-inversion-of-control`): *"In this lesson, we explore Inversion of Control and High-Level Policy Decoupling. Understand core principles, architectural trade-offs, and practical design patterns."*
    - Rails lesson (`ruby-on-rails-fundamentals-mvc`): *"Ruby on Rails follows the Model-View-Controller pattern to structure web applications cleanly..."*
- `app/lessons/[slug]/page.tsx`: Passes `lesson` object to `LessonContent`.
- `sanity/lib/queries.ts`: `LESSON_BY_SLUG_QUERY` fetches `notes`, `keyPoints`, `proTip`, `resources`.
- `studio/schemaTypes/lessonType.ts`: Schema for lessons.

## Decisions & Assumptions
1. **Dynamic Summary Resolution**:
   - Provide a pure helper function `extractLessonSummary(lesson)` in `lesson-content.tsx`.
   - Priority resolution:
     1. Explicit `lesson.summary` if present on the document.
     2. First paragraph / normal text block from Portable Text `lesson.notes` (present across 100% of our seed lessons).
     3. First key point from `lesson.keyPoints` (e.g. `"In this lesson, you will learn how to ..."`).
     4. Dynamic fallback formatted with the lesson title (`"Explore core principles, techniques, and practical examples in ${lesson.title}."`).
2. **Dynamic Overview Fallback**:
   - In the Overview section, if `lesson.notes` is ever omitted, replace the static Next.js text with a contextual fallback referencing `lesson.title`.
3. **Schema & Query Expansion**:
   - Add optional `summary` field to `studio/schemaTypes/lessonType.ts` and `sanity/lib/queries.ts` (`LESSON_BY_SLUG_QUERY` and `lessonCardFragment`).
   - Pass `summary: lesson.summary` in `app/lessons/[slug]/page.tsx`.

## Files to Touch
- `components/lesson/lesson-content.tsx` (MODIFY)
- `app/lessons/[slug]/page.tsx` (MODIFY)
- `sanity/lib/queries.ts` (MODIFY)
- `studio/schemaTypes/lessonType.ts` (MODIFY)

## Requirements
1. The short summary paragraph directly beneath the lesson title on `http://localhost:3000/lessons/[slug]` must dynamically reflect the active lesson's content.
2. For `oop-solid-dip-inversion-of-control`, it must render the DIP intro: *"In this lesson, we explore Inversion of Control and High-Level Policy Decoupling. Understand core principles, architectural trade-offs, and practical design patterns."*
3. For Rails lessons, it must render the Rails intro; for Next.js lessons, it renders the Next.js intro; for Python/Docker/System Design, it renders their respective intros.
4. No hardcoded Next.js placeholder copy remains in `components/lesson/lesson-content.tsx`.
5. TypeScript types and ESLint must pass with 0 errors.

## Security Considerations
- Read-only data presentation: client component displays sanitized strings extracted from Sanity content or Portable Text blocks.
- No client-side tokens or write operations are touched.

## Acceptance Criteria
- [ ] On `/lessons/oop-solid-dip-inversion-of-control`, the summary reads: *"In this lesson, we explore Inversion of Control and High-Level Policy Decoupling. Understand core principles, architectural trade-offs, and practical design patterns."*
- [ ] On `/lessons/ruby-on-rails-fundamentals-mvc`, the summary reads the Rails MVC overview.
- [ ] Overview fallback text uses dynamic lesson title rather than hardcoded Next.js text.
- [ ] `npx tsc --noEmit` exits with 0 errors.
- [ ] `npm run lint` exits with 0 errors and 0 warnings.

## Checks to Run
- `npx tsc --noEmit`
- `npm run lint`
- Browser verification on `http://localhost:3000/lessons/oop-solid-dip-inversion-of-control`

## Exact Manual Test Steps
1. Navigate to `http://localhost:3000/lessons/oop-solid-dip-inversion-of-control`.
2. Inspect the text between the lesson title ("Inversion of Control and High-Level Policy Decoupling") and the metadata row (10m, intermediate, 1 student).
3. Confirm it reads: *"In this lesson, we explore Inversion of Control and High-Level Policy Decoupling. Understand core principles, architectural trade-offs, and practical design patterns."*
4. Navigate to `http://localhost:3000/lessons/nextjs-app-router-in-depth-file-system-routing` and verify its summary matches the routing topic.
5. Navigate to `http://localhost:3000/lessons/ruby-on-rails-fundamentals-mvc` and verify its summary matches the Rails topic.
