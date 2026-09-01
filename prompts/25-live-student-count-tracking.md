# Implementation Prompt: Real-Time Dynamic Student Count Tracking

## Goal

Implement dynamic, real-time student count tracking across course detail pages (`/courses/[slug]`) and catalog cards (`/courses`), replacing static-only CMS figures with live active learner tracking integrated with course engagement and baseline counts.

---

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 3 UI work, 5 structure, 7 decisions, 8 data model, 13 checks).
- `sanity-best-practices` (`.agents/skills/sanity-best-practices/SKILL.md`)
- `lib/progress.ts` — event-driven reactive store patterns.
- `lib/format.ts` — `formatStudentCount` utility.

---

## Code inspected

- `components/course/course-hero.tsx` — Renders `studentCount` using `formatStudentCount(studentCount || 0)`.
- `app/courses/[slug]/page.tsx` — Fetches baseline `studentCount` from Sanity and passes it to `CourseHero`.
- `lib/format.ts` — Formats numbers into human-readable compact strings (e.g. `18240` -> `18.2k`).
- `lib/progress.ts` — Tracks lesson completions and active course engagements.

---

## Decisions and assumptions

1. **Active Learner Tracking Store (`lib/enrollment.ts` / `lib/progress.ts`)**:
   - Track unique active learners who engage with each course (via "Continue Learning", video playback, lesson completion, or authenticated progress).
   - Provide a reactive `useCourseStudentCount(courseSlug, baselineCount)` hook using `useSyncExternalStore` so updates reflect instantly in the UI.
   - Automatically count active learner interactions to increment and maintain the live student count on top of the authored baseline.

2. **Integration in Course Hero (`components/course/course-hero.tsx`)**:
   - Connect the student count chip in `CourseHero` to `useCourseStudentCount(courseSlug, studentCount)`.
   - Ensure the student count dynamically reflects live enrolled learners with smooth formatting.

3. **PostHog Analytics Integration**:
   - Capture `course_enrolled` or `course_learner_engaged` whenever a new learner starts engaging with a course.

---

## Files to create or change

```text
lib/enrollment.ts                               [NEW] Reactive store for course learner enrollment and live student counts
components/course/course-hero.tsx               [MODIFY] Use useCourseStudentCount for live dynamic student count display
```

---

## Requirements

1. Course detail page (`/courses/[slug]`) must display live student counts combining the baseline with active learner engagement.
2. Interacting with course lessons or clicking "Continue Learning" registers learner engagement and updates the live student count.
3. Formatting seamlessly supports compact representations (e.g. `18.2k students`).
4. Type safety and zero lint errors across the workspace.

---

## Security considerations

- Learner state is stored in client storage and keyed safely without exposing private credentials.

---

## Acceptance criteria

1. Navigating to `/courses/nextjs-app-router-in-depth` displays the student count accurately formatted.
2. Engaging with lessons or clicking "Continue Learning" registers the active learner.
3. `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass cleanly.

---

## Checks to run

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Manual test steps

1. Open `http://localhost:3000/courses/nextjs-app-router-in-depth`.
2. Observe the student count in the metadata chip row (e.g. `18.2k students`).
3. Click **Continue Learning** or mark a lesson as completed.
4. Verify the student count updates dynamically to reflect active learners.
