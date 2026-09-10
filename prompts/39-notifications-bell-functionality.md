# Implementation prompt: Interactive Bell Notification System for New Courses and Milestones

## Goal

Transform the static bell icon in the Navbar into a fully functional, interactive notification system. The notification system alerts learners when new courses are published/added to Vertex, celebrates learning milestones (course completions), provides direct navigation to courses/lessons, tracks read/unread states persistently, and displays an unread count badge on the bell icon with an animated dropdown popover.

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 3 UI work, 5 How the app is structured, 7 Decisions already made for you, 13 Checks to run, 14 When in doubt).
- `sanity-best-practices` (`f:\Nextjs\vertex\.agents\skills\sanity-best-practices\SKILL.md`).
- `clerk` (`f:\Nextjs\vertex\.agents\skills\clerk\SKILL.md`).
- `prompts/22-course-and-lesson-bookmark-functionality.md`, `prompts/38-dynamic-recent-completed-course-banner.md`.

## Code inspected

- `components/nav/navbar.tsx`: Bell icon button in the signed-in navbar actions.
- `sanity/lib/fetchers.ts` & `sanity/lib/queries.ts`: Course GROQ queries, course fields (`_id`, `title`, `slug`, `summary`, `coverImage`, `_createdAt`, `instructor`).
- `sanity/lib/client.ts`: `sanityFetch` with server-only private dataset token.
- `lib/progress.ts`: Learner progress tracking (`useCourseProgress`, `getStoredProgress`, `completedAt`).
- `lib/bookmarks.ts`: `useSyncExternalStore` pattern with local storage and custom events.

## Decisions and assumptions

1. **Server Route for Notifications Data (`app/api/notifications/route.ts`)**:
   - Provide a clean Next.js server route that fetches recent courses from Sanity using `sanityFetch`.
   - Formats them as standard notification items with `id`, `type: 'new_course'`, `title`, `message`, `href`, `timestamp`, `icon`, and metadata (e.g. course slug, cover image).
   - Keeps private tokens strictly on the server as required by `AGENTS.md`.

2. **Client-Side Notification Store & Hook (`lib/notifications.ts`)**:
   - Store read notification IDs and dismissal status in `localStorage` (`vertex_read_notifications`, `vertex_notifications_cleared_before`).
   - Merge server-provided new course notifications with local milestones (e.g. Course Completed milestone notifications derived from `lib/progress.ts`) and platform welcome notices.
   - Provide `useNotifications()` powered by `useSyncExternalStore` for instantaneous reactivity across components and browser tabs.
   - Provide helper methods: `markAsRead(id)`, `markAllAsRead()`, `clearAll()`.
   - PostHog engagement tracking when notifications are opened or marked read.

3. **Notification Popover Component (`components/nav/notification-popover.tsx`)**:
   - Anchored directly under the bell icon with backdrop dismissal, keyboard escape handling, and smooth dropdown animation.
   - Header: "Notifications" title, dynamic unread badge count (e.g. "2 new"), and "Mark all as read" button.
   - Notification List:
     - Differentiates notification types with clean visual indicators (Orange graduation cap for New Course, Gold trophy for Completed Course, Sparkles for Welcome/Platform).
     - Displays title, description, relative time formatted cleanly (e.g. "Just now", "2 hours ago", "Yesterday").
     - Orange unread dot for unread notifications.
     - Hover highlight and active press styles matching the Vertex design system (`#FAF7F2`, `#EBE4DC`, `#EA580C`).
     - Clicking an item marks it as read and smoothly routes to the target course or lesson URL.
   - Empty state: Clean, friendly "You're all caught up!" graphic/icon when there are no unread or active notifications.

4. **Navbar Bell Integration (`components/nav/navbar.tsx`)**:
   - Replace static `<Bell>` button with interactive popover trigger.
   - Show vibrant notification badge with unread count on the bell icon (hidden when 0 unread).
   - Ensure full accessibility with `aria-haspopup="dialog"`, `aria-expanded`, and focus management.
   - Works seamlessly on desktop and inside the mobile navigation layout.

## Files to touch

- `app/api/notifications/route.ts` (NEW: Server API route fetching recent course notifications from Sanity)
- `lib/notifications.ts` (NEW: Reactive notifications store, storage persistence, and `useNotifications` hook)
- `components/nav/notification-popover.tsx` (NEW: Dropdown menu UI for notification list, unread state, empty state)
- `components/nav/navbar.tsx` (MODIFY: Replace static bell with interactive notification popover and unread badge)

## Requirements

1. The Bell icon in the navbar must indicate unread notifications with a visible badge when new courses or milestones exist.
2. Clicking the Bell icon opens a notification dropdown popover.
3. When any new course is added in Sanity, it appears as a "New Course" notification card with its title, summary, and direct link to `/courses/[slug]`.
4. Completing courses on Vertex generates learning milestone notifications.
5. Learners can mark individual notifications as read (by clicking or opening) or click "Mark all as read".
6. Read states persist across page reloads and browser sessions via `localStorage`.
7. Clicking outside the dropdown or pressing Escape closes the popover.
8. Retains full aesthetic alignment with Vertex's warm, premium design tokens (`#FAF7F2`, `#EBE4DC`, `primary-500`/`primary-600`).

## Security considerations

- Sanity dataset tokens remain strictly in server code (`app/api/notifications/route.ts`).
- No private API keys or tokens are sent to or stored on the client.
- URLs and slugs are sanitized and validated before rendering links.

## Acceptance criteria

- [ ] `/api/notifications` returns recent courses formatted as notification objects.
- [ ] `lib/notifications.ts` provides real-time unread count and read state persistence.
- [ ] `components/nav/notification-popover.tsx` displays notification cards, time, unread dot, empty state, and "Mark all as read".
- [ ] Navbar bell shows unread count badge and toggles popover.
- [ ] Clicking a notification navigates to the course and marks it as read.
- [ ] `npx tsc --noEmit` passes without errors.
- [ ] `npm run build` passes.

## Checks to run

```bash
npx tsc --noEmit
npm run build
```

## Manual test steps

1. Open `http://localhost:3000/`.
2. Inspect the Bell icon in the navbar; observe the notification badge showing unread count for the available courses.
3. Click the Bell icon; verify the notification dropdown opens with smooth animation.
4. Verify each notification card displays the course title, description, time, and unread dot.
5. Click on a notification; verify it marks as read and navigates to the course detail page (`/courses/[slug]`).
6. Re-open the bell popover and click "Mark all as read"; verify all unread dots disappear and badge clears.
7. Complete a course in `/my-learning` or on a lesson page, then inspect notifications to see the Course Completion milestone notification.
