# Implementation Prompt: Real-Time Notifications Progress Event Synchronization

## Goal

Ensure that `useNotifications` immediately recomputes milestone notifications and unread badge counts when learner progress updates (including in the writing tab) by:
1. Importing `PROGRESS_EVENT_NAME` from `./progress` into `lib/notifications.ts`.
2. Updating `useNotifications` to subscribe to `PROGRESS_EVENT_NAME` and `storage` events.
3. Maintaining a reactive `progressVersion` state/snapshot version that increments whenever progress changes.
4. Adding `progressVersion` to the `notifications` `useMemo` dependency array so completed course milestone notifications and unread badge counts update immediately upon `saveProgress`.

---

## Skills and Docs Read

- `AGENTS.md` (Section 2 How to work, Section 7 Decisions: *"Some surfaces are presentational only, with no backend of their own: the notifications bell..."*).
- `clerk-nextjs-patterns` (`.agents/skills/clerk-nextjs-patterns/SKILL.md`).
- `prompts/45-user-scoped-notifications-and-progress-isolation.md`.
- `prompts/47-user-scoped-dashboard-progress-sync.md`.

---

## Code Inspected

- `lib/notifications.ts`:
  - Line 6: `import { getAllStoredProgress } from "./progress";` (missing `PROGRESS_EVENT_NAME`).
  - Lines 217-225: `useNotifications` lacks progress event subscription.
  - Lines 260-310: `notifications` `useMemo` reads `getAllStoredProgress(userId)`, but depends only on `[serverNotifications, readIds, isSignedIn, userId]`.
  - Lines 312-314: `unreadCount` `useMemo` depends on `notifications`.
- `lib/progress.ts`:
  - Line 246: `saveProgress` dispatches `PROGRESS_EVENT_NAME` via `window.dispatchEvent` with `{ courseSlug, state: frozenState, userId }`.
  - Line 68: `setActiveUserId` dispatches `PROGRESS_EVENT_NAME` with `{ courseSlug: "*", state: DEFAULT_EMPTY_STATE }`.

---

## Decisions and Assumptions

1. **Event Subscription in `useNotifications`**:
   - Subscribe to `PROGRESS_EVENT_NAME` (which dispatches locally in the writing tab) and `storage` (for multi-tab synchronization).
   - Filter events so updates for the current `userId` (or platform/wildcard resets) trigger a version increment.
2. **Snapshot Versioning**:
   - Maintain a `progressVersion` counter with `useState(0)` that increments inside the event handler.
3. **Memoization Dependency**:
   - Include `progressVersion` in the dependency list of `notifications` `useMemo`: `[serverNotifications, readIds, isSignedIn, userId, progressVersion]`.
   - Add `void progressVersion;` inside the memo body to make the invalidation trigger explicit.
4. **Immediate Unread Badge Calculation**:
   - Because `unreadCount` depends on `notifications`, incrementing `progressVersion` recalculates both the notification item list and the unread count in real time without requiring a page reload.

---

## Files to Create or Change

```text
lib/notifications.ts    [MODIFY] Import PROGRESS_EVENT_NAME, subscribe in useNotifications, track progressVersion, and add to notifications memo dependencies
```

---

## Requirements

1. Import `PROGRESS_EVENT_NAME` from `./progress` in `lib/notifications.ts`.
2. In `useNotifications`, listen to `PROGRESS_EVENT_NAME` and `storage` events on `window`.
3. Increment a `progressVersion` state on progress updates.
4. Include `progressVersion` in the `notifications` memo dependency array.
5. Keep changes minimal and clean, ensuring zero lint or type errors.

---

## Security Considerations

- Retains strict user isolation by verifying event `userId` matches the authenticated Clerk `userId`.
- No sensitive progress or user data is exposed to unauthorized components or third parties.

---

## Acceptance Criteria

1. Whenever `saveProgress` or course completion executes, `useNotifications` immediately re-runs its `notifications` memo.
2. The unread count reflects new milestone notifications without needing a full page reload or component remount.
3. Multi-tab updates continue to function via the `storage` event listener.
4. Type check (`npx tsc --noEmit`) and linter pass cleanly.

---

## Checks to Run

- `npx tsc --noEmit`
- `npx eslint lib/notifications.ts`

---

## Exact Manual Test Steps

1. Start dev server (`npm run dev`) and visit `http://localhost:3000/courses`.
2. Ensure the notification bell in the header is visible.
3. Navigate to a course lesson and mark all lessons as completed (or use complete course button).
4. Observe the notification bell in the header: the red unread badge increment should appear immediately without page refresh.
5. Open the notification popover and verify the "Course Completed! 🎉" milestone notification is present.
