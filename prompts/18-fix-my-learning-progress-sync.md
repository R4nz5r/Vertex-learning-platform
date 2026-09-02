# Implementation Prompt: Sync Live Course Progress on My Learning Dashboard

## Goal

Synchronize the **My Learning** dashboard (`/my-learning`) with the client-side course progress store (`useCourseProgress`) so that completed courses (like `Building AI Apps with LLMs` at 100%) and completed lessons accurately reflect their live completion percentage, progress bars, and status badges on the My Learning page, replacing static demo numbers.

---

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 3 UI work, 7 decisions, 13 checks).
- `sanity-best-practices` skill (`.agents/skills/sanity-best-practices/SKILL.md`)

---

## Code inspected

- `app/my-learning/page.tsx` — Discovered hardcoded progress calculation with mock ratios `const progressRatios = [0.45, 0.2, 0.8]` and static stats (`5 Lessons`), which showed 42% even after the user completed the course at 100%.
- `components/cards/my-learning-card.tsx` — Accepts static props rather than listening to live `useCourseProgress`.
- `lib/progress.ts` — `useCourseProgress` and `getStoredProgress` providing real-time synchronization via `useSyncExternalStore`.

---

## Decisions and assumptions

1. **Client-Side Live Progress Synchronization in `MyLearningCard`**:
   - Update `MyLearningCard` to connect to `useCourseProgress(slug, defaultPrecedingLessons)`.
   - When a course is marked completed (100%), dynamically display:
     - `100% complete`
     - Full green progress bar
     - `Completed` checkmark badge
     - `Review Course` action button
2. **Dynamic Dashboard Client View (`MyLearningDashboardClient`)**:
   - Create a client-side wrapper component for the dashboard content that evaluates progress across all enrolled courses.
   - Accurately compute:
     - Dynamic total completed lessons count across courses
     - Dynamic courses in progress vs completed courses
     - Real-time "Resume Where You Left Off" hero banner (showing 100% completed state or active lesson)
3. **Seamless Consistency**:
   - Ensure `/courses/[slug]`, `/lessons/[slug]`, and `/my-learning` all reflect identical completion data through `useCourseProgress` and `localStorage`.

---

## Files to create or change

```text
components/cards/my-learning-card.tsx           [MODIFY] Connect to useCourseProgress for live completion and percentage
components/cards/my-learning-resume-banner.tsx   [NEW] Client-side live resume banner reflecting actual course progress
components/dashboard/my-learning-dashboard.tsx  [NEW] Client dashboard rendering dynamic stats, resume card, and course cards
app/my-learning/page.tsx                        [MODIFY] Integrate MyLearningDashboard client component with Sanity courses data
```

---

## Requirements

1. When a course is completed (100% on course page), `/my-learning` must display 100% complete for that course.
2. The stats row on `/my-learning` must calculate completed lessons and in-progress/completed courses dynamically.
3. The "Resume Where You Left Off" banner on `/my-learning` must reflect the accurate progress percentage and next/review lesson.
4. Changes made in lesson pages or course pages must instantly reflect on `/my-learning`.

---

## Security considerations

- No secret tokens exposed; purely client-side progress synchronization.

---

## Acceptance criteria

1. Visiting `/my-learning` shows `Building AI Apps with LLMs` as 100% completed with the green "Completed" badge.
2. The Resume banner reflects 100% completion with a "Review Course" CTA.
3. Summary stats accurately display completed lessons and active courses.
4. `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass cleanly.

---

## Checks to run

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Manual test steps

1. Open `http://localhost:3000/my-learning`.
2. Verify that `Building AI Apps with LLMs` displays **100% complete** with a green **Completed** badge.
3. Verify that the Resume banner shows **100% complete** with **Review Course**.
4. Open a lesson in `Next.js App Router in Depth`, mark a lesson as complete, and return to `/my-learning` to verify real-time update.
