# Implementation Prompt: Display Real Enrolled Students Only (1, 2, 3...)

## Goal

Configure the student count display across course hero and lesson pages to reflect **only real active enrolled learners** (e.g., `1 student`, `2 students`), discarding synthetic 18.2k seed baselines.

---

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 3 UI work, 7 decisions, 13 checks).
- `lib/enrollment.ts` — active learner tracking store.
- `lib/format.ts` — student count formatting.

---

## Code inspected

- `lib/enrollment.ts` — Currently calculated `totalStudents = Math.max(baselineCount, baselineCount + additionalLearners)`, which preserved the 18,240 seed number.
- `components/course/course-hero.tsx` — Displays `{formattedStudents} students`.
- `components/lesson/lesson-content.tsx` — Displays student count in lesson metadata.
- `lib/format.ts` — `formatStudentCount`.

---

## Decisions and assumptions

1. **Purely Real Active Learner Count in `lib/enrollment.ts`**:
   - Update `useCourseStudentCount` to calculate count based exclusively on real active learners recorded in the enrollment store.
   - When a user is viewing/engaging with a course, ensure at least 1 real student count is registered upon active engagement or first visit.
2. **Grammar & Singular/Plural Formatting**:
   - Ensure proper pluralization: `1 student` vs `2 students`.
3. **Consistent Integration**:
   - Update `CourseHero` (`components/course/course-hero.tsx`) and `LessonContent` (`components/lesson/lesson-content.tsx`) to show real enrolled learner counts.

---

## Files to create or change

```
lib/enrollment.ts                               [MODIFY] Count real active learners only, without synthetic seed baseline
components/course/course-hero.tsx               [MODIFY] Pluralize "student" vs "students" and register active visit
components/lesson/lesson-content.tsx            [MODIFY] Connect to useCourseStudentCount for live real count
```

---

## Requirements

1. Course detail page (`/courses/[slug]`) and lesson pages (`/lessons/[slug]`) must display real active enrolled students (e.g., `1 student`, `2 students`), not 18.2k.
2. Pluralization must display `1 student` for a single learner and `X students` for multiple learners.
3. TypeScript type checking, linting, and build pass cleanly.

---

## Security considerations

- No sensitive data exposed. Purely client-side enrollment store.

---

## Acceptance criteria

1. Navigating to `/courses/nextjs-app-router-in-depth` displays `1 student` (or current real count), not `18.2k students`.
2. `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass cleanly.

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
2. Verify the student metadata chip displays **1 student** (or real count) instead of **18.2k students**.
3. Open a lesson page and verify the same accurate count is displayed.
