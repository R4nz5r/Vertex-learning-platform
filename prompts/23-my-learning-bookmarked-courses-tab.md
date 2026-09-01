# Implementation Prompt: My Learning Bookmarked Courses Tab

## Goal

Add a dedicated **"Bookmarked"** filter tab to the **My Learning** dashboard (`/my-learning`) that dynamically filters and displays all bookmarked courses saved by the user via the reactive `useCourseBookmarks` store, complete with live counts, responsive styling, and empty state guidance.

---

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 3 UI work, 7 decisions, 13 checks).
- `sanity-best-practices` (`.agents/skills/sanity-best-practices/SKILL.md`)
- `lib/bookmarks.ts` — `useCourseBookmarks` reactive store hook.
- `lib/progress.ts` — course progress integration patterns.

---

## Code inspected

- `components/dashboard/my-learning-dashboard.tsx` — Discovered filter tabs currently supporting `"all" | "in-progress" | "completed"`. Receives `inProgressCourses` and `recommendedCourses`.
- `app/my-learning/page.tsx` — Server component passing `inProgressCourses` and `recommendedCourses` to `MyLearningDashboard`.
- `lib/bookmarks.ts` — Provides `useCourseBookmarks()` for reading real-time bookmarked course slugs.
- `components/cards/my-learning-card.tsx` — Reusable card component for rendering courses with live progress and resume buttons.

---

## Decisions and assumptions

1. **Bookmarked Tab in `MyLearningDashboard` (`components/dashboard/my-learning-dashboard.tsx`)**:
   - Extend `FilterType` to `"all" | "in-progress" | "completed" | "bookmarked"`.
   - Consume `useCourseBookmarks()` from `@/lib/bookmarks` to retrieve live bookmarked course slugs.
   - Aggregate all known courses (`[...inProgressCourses, ...recommendedCourses]`, de-duplicated by slug) to identify any course the learner has bookmarked.
   - Add a 4th tab button: `Bookmarked (${bookmarkedCourses.length})` with peach/terracotta active state when selected (`bg-[#FFF6F0] text-[#C24F1A] font-semibold`).
   - When the "Bookmarked" filter is active, render `bookmarkedCourses` using `MyLearningCard`.
   - If no courses are bookmarked, display a clean empty state with a Bookmark icon and helpful prompt: "No bookmarked courses yet. Click the Bookmark button on any course page to save it for quick access here."

2. **Full Catalog Course Availability for Bookmarks**:
   - Ensure `MyLearningDashboard` receives all courses from `getMyLearningCourses()` so that bookmarking any course from the catalog will surface in the Bookmarked tab.

3. **Seamless Consistency & Responsive Layout**:
   - Maintain the responsive mobile-first pill tab layout (horizontal scroll / flex wrap on small viewports without overflow).
   - Ensure instant update when a bookmark is added or removed in another tab or page.

---

## Files to create or change

```text
components/dashboard/my-learning-dashboard.tsx  [MODIFY] Integrate useCourseBookmarks, add "Bookmarked" filter tab, and render bookmarked courses grid
app/my-learning/page.tsx                        [MODIFY] Pass complete courses list to MyLearningDashboard if needed
```

---

## Requirements

1. `/my-learning` must display a "Bookmarked" filter tab alongside "All", "In Progress", and "Completed".
2. The "Bookmarked" tab must display the dynamic count of currently bookmarked courses.
3. Clicking "Bookmarked" filters the view to only show courses the user has bookmarked.
4. If a user bookmarks a course on `/courses/[slug]` and visits `/my-learning`, that course immediately appears in the Bookmarked tab.
5. If no courses are bookmarked, a styled empty state is displayed with a call to action.

---

## Security considerations

- Bookmark data is purely client-side in `localStorage`. No private keys or tokens are exposed.

---

## Acceptance criteria

1. Visiting `/my-learning` shows the "Bookmarked" tab with the accurate count of bookmarked courses.
2. Clicking "Bookmarked" displays all bookmarked courses with their `MyLearningCard`.
3. Unbookmarking a course updates the tab count and list immediately.
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

1. Bookmark a course on `http://localhost:3000/courses/building-ai-apps-with-llms`.
2. Navigate to `http://localhost:3000/my-learning`.
3. Verify the **Bookmarked** tab displays `Bookmarked (1)`.
4. Click the **Bookmarked** tab and confirm `Building AI Apps with LLMs` is listed.
5. Unbookmark the course and verify the tab count updates to `Bookmarked (0)` with the empty state.
