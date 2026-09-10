# Implementation Prompt: Strict User-Scoped Notifications and Progress Isolation

## Goal

Ensure complete multi-tenant user isolation for notifications, course completion milestones, and completed course visibility across the entire platform so that one user's completed courses, lesson progress, and notifications are **never** visible to or shared with any other user:
1. **User-Scoped Notifications**: Connect `useNotifications()` to Clerk's `useAuth()`. Personal notifications (e.g. `course_milestone` "Course Completed! 🎉") must only be displayed to the authenticated user who actually completed that course.
2. **User-Scoped Read State**: Scope read notification tracking (`vertex_read_notifications_${userId}`) and milestone timestamps (`vertex_milestone_timestamps_${userId}`) strictly by Clerk `userId`.
3. **User-Scoped Completed Course & Progress Visibility**:
   - Ensure a completed course by User A is **completely invisible** as completed to User B across all surfaces:
     - `/my-learning` (Completed Courses tab, stats, progress bars, and recent completion banner).
     - `/courses/[slug]` (Completed badge, completion checkmarks, and lesson statuses).
     - `/courses` and `/` (Course card completion indicators and progress percentages).
     - `/lessons/[slug]` (Lesson sidebar completion checkmarks and completion trophies).
4. **User-Scoped Storage & Migration**: Scope learner progress in `lib/progress.ts` by `userId` (`vertex_progress_${userId}_${courseSlug}`). When User A completes a course, User B logging into the same browser will see only their own progress and zero completed courses from User A.
5. **Anonymous Protection**: Signed-out visitors only see public announcements (`new_course`), never personal milestones or another user's completed courses.

## Skills and Docs Read

- `AGENTS.md` (Section 1 What you are building, 2 How to work, 5 App structure, 7 Decisions: *"Learner progress and any other per user state key off the Clerk user id"*).
- `clerk` / `clerk-nextjs-patterns` (`useAuth`, `useUser`).

## Code Inspected

- `lib/notifications.ts`:
  - Currently loads all milestone notifications from un-scoped `getAllStoredProgress()`.
  - Read states use a single un-scoped `vertex_read_notifications` key.
- `lib/progress.ts`:
  - Progress storage uses `vertex_course_progress_${courseSlug}` without `userId` scoping.
- `components/analytics/posthog-identify.tsx`:
  - Listens to Clerk user sign-in/out events and provides a reliable sync point for `setActiveUserId`.

## Decisions and Assumptions

1. **Strict User Separation**:
   - Public announcements (`type: "new_course"`) are platform-wide and visible to all signed-in users, but their read status is isolated per `userId`.
   - Personal milestones (`type: "course_milestone"`) are strictly private and generated only from the active `userId`'s completed courses.
2. **Deterministic Storage Keys**:
   - Progress: `vertex_progress_${userId}_${courseSlug}` (with automatic migration of existing legacy data to the currently signed-in user so progress is preserved).
   - Read Notifications: `vertex_read_notifications_${userId}`.
   - Milestone Timestamps: `vertex_milestone_timestamps_${userId}`.
3. **Seamless Clerk Integration**:
   - `useNotifications` retrieves `{ userId, isSignedIn }` from `@clerk/nextjs`.
   - If `!isSignedIn || !userId`, milestone notifications are omitted entirely.
   - Progress functions resolve the active `userId` from `getActiveUserId()` or explicit parameters.

## Files to Touch / Create

```text
lib/progress.ts                              [MODIFY] Add user-scoping to getStorageKey, getAllStoredProgress, saveProgress, and active user management
lib/notifications.ts                         [MODIFY] Wire useAuth, scope read notification IDs and milestones strictly to userId
components/analytics/posthog-identify.tsx    [MODIFY] Sync active userId into progress module on sign-in and sign-out
```

## Security Considerations

- Prevents cross-account data leakage across multiple users sharing a browser device.
- All per-user progress and notifications are strictly isolated by Clerk `userId`.
- No sensitive user PII is exposed in storage keys.

## Acceptance Criteria

1. When User A completes a course, the milestone notification ("Course Completed! 🎉") is only visible when User A is logged in.
2. When User B logs in (or in signed-out state), User B's notification feed does **not** show User A's completed course notification.
3. Marking notifications as read by User A does not mark them as read for User B.
4. Existing completed course progress for the current logged-in user is preserved and safely migrated to their user-scoped key.
5. `npx tsc --noEmit` passes with 0 errors.

## Checks to Run

```bash
cd f:\Nextjs\vertex
npx tsc --noEmit
```

## Manual Test Steps

1. Verify while logged in as the current user that the completed course notification and all new course notifications are visible.
2. In dev tools / application tab, verify that localStorage keys now use `vertex_progress_<userId>_<courseSlug>` and `vertex_read_notifications_<userId>`.
3. Sign out or switch to an alternate test user; confirm that the notification dropdown contains only public "New Course Available" notifications and zero completed course milestones from other users.
