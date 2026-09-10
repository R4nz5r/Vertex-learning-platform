# Implementation Prompt: Fix Notification Timestamps and Include All New Courses in Feed

## Goal

Resolve two critical notification issues reported by the user:
1. **Course Completion Milestone Timestamp ("Just now" bug)**: The notification shows "Course Completed! 🎉 Just now" even though the course was completed earlier. Fix this by ensuring course completion timestamps are accurately captured, persisted in localStorage, and never dynamically reset to `Date.now()` on every component render.
2. **Missing New Courses in Notification Feed**: The 10 newly added courses do not appear in the notifications dropdown because the Sanity query in `/api/notifications` was capped to `[0...10]` and ordered by `_createdAt desc` (which favored the restored courses). Expand the query to return all recent courses (up to 30) ordered properly so all 20 courses appear in the notifications feed.

## Skills and Docs Read

- `AGENTS.md` (Sections 1, 2, 7 Decisions, 8 Data Model, 11 Search, 13 Checks).
- `sanity-best-practices` (`references/groq.md`).

## Code Inspected

- `app/api/notifications/route.ts`:
  - Query currently uses `*[_type == "course"] | order(_createdAt desc)[0...10]`.
  - With 20 courses in the dataset, the 10 newest courses created at `16:39` were dropped because `[0...10]` only took the top 10.
- `lib/notifications.ts`:
  - Lines 231-232: `timestamp: state.completedAt || state.updatedAt || Date.now()`.
  - When `completedAt` was undefined or 0 in stored progress, it fell back to `Date.now()` on every render, causing `formatRelativeTime` to always return `"Just now"`.
- `lib/progress.ts`:
  - `CourseProgressState` defines `completedAt?: number`. Needs guaranteed persistence when a course is marked complete.
- `components/nav/notification-popover.tsx`:
  - `formatRelativeTime` formats diffs into "Just now", "Xm ago", "Xh ago", etc.

## Decisions and Assumptions

1. **Include All Courses in Notification Feed**:
   - Update `RECENT_COURSES_QUERY` in `app/api/notifications/route.ts` to fetch up to 30 courses: `*[_type == "course"] | order(_createdAt desc)[0...30]`.
   - Add cache-busting headers (`Cache-Control: no-cache, no-store, must-revalidate`) to `/api/notifications` so newly seeded courses immediately appear without waiting on ISR caches.
2. **Stable Milestone Timestamp Persistence**:
   - In `lib/notifications.ts`, persist milestone notification timestamps in localStorage under `vertex_milestone_timestamps` (`{ [milestoneId]: timestamp }`).
   - If `state.completedAt` is valid (> 0), use it.
   - If a milestone notification is generated for a completed course and has no existing timestamp, record the timestamp once into `vertex_milestone_timestamps` and persist it.
   - This guarantees the timestamp never resets to `Date.now()` on subsequent renders or page navigations, allowing `formatRelativeTime` to accurately report "1h ago", "2h ago", "Yesterday", etc.
3. **Course Progress Completion Recording**:
   - In `lib/progress.ts`, ensure `markLessonCompleted` and `saveProgress` permanently retain the original `completedAt` timestamp once `isCourseCompleted` becomes true.

## Files to Touch / Create

```text
app/api/notifications/route.ts              [MODIFY] Increase course limit to 30 and ensure fresh fetch without aggressive caching
lib/notifications.ts                        [MODIFY] Persist milestone timestamps stably so "Just now" reflects real elapsed time
lib/progress.ts                             [MODIFY] Ensure completedAt is preserved once course is completed
components/nav/notification-popover.tsx     [VERIFY] Relative time formatting
```

## Security Considerations

- Public course notifications contain only public catalog metadata.
- Learner milestone notifications remain strictly client-side based on user progress in localStorage.

## Acceptance Criteria

1. All newly added courses (e.g. *Go for High-Performance Backends*, *Serverless Architecture on AWS*, *Advanced CSS & UI Engineering*, *Real-Time Apps with Supabase*, etc.) appear in the notifications dropdown.
2. The course completion milestone notification displays an accurate elapsed time (e.g. "Xh ago" or "Yesterday") and does not reset to "Just now" on page refreshes.
3. Marking notifications as read continues to work across both course notifications and completion milestones.
4. `npx tsc --noEmit` passes with 0 errors.

## Checks to Run

```bash
cd f:\Nextjs\vertex
npx tsc --noEmit
curl http://localhost:3000/api/notifications
```

## Manual Test Steps

1. Click the notification bell icon in the navbar.
2. Verify that notifications for the new courses (such as *Go for High-Performance Backends*, *Serverless Architecture on AWS*, etc.) are listed in the dropdown.
3. Verify that the completed course notification displays a realistic relative elapsed time rather than "Just now".
4. Refresh the page and re-open the bell; confirm the timestamp does not reset back to "Just now".
