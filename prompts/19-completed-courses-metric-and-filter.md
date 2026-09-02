# Implementation Prompt: Add Completed Courses Metric and Filter Option to My Learning

## Goal

Add a dedicated **Completed Courses** metric card to the stats row and an interactive **filter option** (tabs: `All`, `In Progress`, `Completed`) on the **My Learning** dashboard (`/my-learning`), allowing learners to clearly see how many courses they have completed versus those in progress, and filter their course list accordingly.

---

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 3 UI work, 7 decisions, 13 checks).

---

## Code inspected

- `components/dashboard/my-learning-dashboard.tsx` — Stats row currently shows 3 cards (`In Progress`, `Completed Lessons`, `Time Learned`), and course list shows all enrolled courses under one fixed heading without filter tabs.
- `components/cards/my-learning-card.tsx` — Evaluates live `isCompleted` and completion percentage for each course.
- `lib/progress.ts` — `useCourseProgress` providing live completion state.

---

## Decisions and assumptions

1. **4-Card Stats Summary Grid**:
   - Layout: `grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6` matching Vertex design tokens.
   - **Card 1 (In Progress)**: Orange icon, displaying the number of active courses (`X Courses`).
   - **Card 2 (Completed Courses)**: Emerald/Green Trophy icon, displaying the number of 100% completed courses (`X Courses`).
   - **Card 3 (Completed Lessons)**: Blue/Emerald Checkmark icon, displaying total completed lessons count (`X Lessons`).
   - **Card 4 (Time Learned)**: Amber Clock icon, displaying total time learned (`Xh Ym`).

2. **Interactive Course Filter Tabs**:
   - Above the enrolled courses grid, add styled filter tabs:
     - `All ({total})`
     - `In Progress ({inProgressCount})`
     - `Completed ({completedCount})`
   - Active tab highlighted in terracotta/orange with clean transitions.
   - Switching tabs filters the course cards dynamically and shows an encouraging empty state if a tab has no matching courses (e.g. "No completed courses yet").

---

## Files to create or change

```text
components/dashboard/my-learning-dashboard.tsx  [MODIFY] Add 4-card stats row (including Completed Courses metric) and interactive filter tabs (All / In Progress / Completed)
```

---

## Requirements

1. Display a dedicated "Completed Courses" stat card with accurate live count.
2. Provide filter options (`All`, `In Progress`, `Completed`) with live badge counts.
3. Filtering instantly displays the relevant courses without page reload.
4. Maintain full responsiveness and aesthetic consistency with Vertex design system.

---

## Acceptance criteria

1. The stats row displays 4 clean metric cards: "In Progress", "Completed Courses", "Completed Lessons", and "Time Learned".
2. When a course is 100% completed (e.g. `Building AI Apps with LLMs`), "Completed Courses" displays `1 Course` and "In Progress" displays `1 Course`.
3. Clicking the "Completed" tab filters the list to only completed courses.
4. Clicking the "In Progress" tab filters the list to only active in-progress courses.
5. TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), and build (`npm run build`) pass cleanly.

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
2. Verify the 4 stat cards in the header row, including the dedicated "Completed Courses" card showing `1 Course`.
3. Click the "Completed" filter tab and verify that only `Building AI Apps with LLMs` is shown.
4. Click the "In Progress" filter tab and verify that only `Next.js App Router in Depth` is shown.
5. Click "All" to view all enrolled courses.
