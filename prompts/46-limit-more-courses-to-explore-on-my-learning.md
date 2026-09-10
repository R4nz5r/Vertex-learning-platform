# Implementation Prompt: Limit "More Courses to Explore" to 3 to 6 Courses on My Learning Page

## Goal

In `/my-learning`, limit the "More Courses to Explore" section to display at least 3 and at most 6 curated courses (e.g. 1 to 2 clean rows on desktop grid), rather than rendering the entire catalog of 19+ remaining courses.

## Skills and Docs Read

- `AGENTS.md` (Sections 1 What you are building, 2 How to work, 3 UI work, 7 Decisions).

## Code Inspected

- `components/dashboard/my-learning-dashboard.tsx`:
  - Lines 166-183: `recommendedCoursesList` collects every unstarted course from `allAvailableCourses`.
  - Lines 482-501: Renders `recommendedCoursesList.map(...)` without any slicing, rendering up to 19+ cards.
  - Header has an "All courses →" link pointing to `/courses` for the full catalog.

## Decisions and Assumptions

1. **Course Limit**:
   - Limit `recommendedCoursesList` to at most 6 courses using `.slice(0, 6)`.
   - If there are fewer than 3 unstarted courses, display what is available (or take popular/featured courses if needed). Since there are 20 total courses in the catalog, slicing up to 6 will consistently yield 3 to 6 courses for 1-2 balanced rows in the 3-column grid.
2. **Prioritization**:
   - Preserve order or prioritize popular / diverse topics for learner discovery.
3. **Preserve Navigation**:
   - The "All courses →" header link remains in place for learners who wish to view the complete catalog.

## Files to Touch / Create

```text
components/dashboard/my-learning-dashboard.tsx    [MODIFY] Slice recommendedCoursesList to max 6 items
```

## Security Considerations

- Presentational change only; no sensitive data involved.

## Acceptance Criteria

1. On `/my-learning`, the "More Courses to Explore" section displays at most 6 course cards (1-2 rows on desktop).
2. The "All courses →" link continues to navigate to `/courses`.
3. Layout remains fully responsive across mobile, tablet, and desktop viewports.
4. `npx tsc --noEmit` passes with 0 errors.

## Checks to Run

```bash
cd f:\Nextjs\vertex
npx tsc --noEmit
```

## Manual Test Steps

1. Navigate to `http://localhost:3000/my-learning`.
2. Scroll to the "More Courses to Explore" section.
3. Count the cards displayed: verify there are no more than 6 cards (2 rows of 3 on desktop), instead of a long list of 10+ cards.
4. Click "All courses →" and verify it navigates to `/courses` where all 20 courses are available.
