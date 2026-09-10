# Implementation Prompt: Enforce Authenticated Progress Writes & Read-Only Legacy Progress

## Goal

Ensure that learner progress persistence in `lib/progress.ts` is strictly restricted to authenticated Clerk users by:
1. Returning early without writing in `saveProgress` when neither `explicitUserId` nor `getActiveUserId()` provides an active user ID.
2. Guarding `markLessonCompleted`, `toggleLessonCompleted`, and `markEntireCourseCompleted` so that unauthenticated / anonymous users cannot trigger progress persistence or progress completion tracking.
3. Keeping the legacy `vertex_course_progress_*` prefix read-only exclusively for migration into active Clerk accounts.

---

## Skills and Docs Read

- `AGENTS.md` (Section 2 How to work, Section 7 Decisions: *"Learner progress and any other per user state key off the Clerk user id. The browser never writes it directly... Progress is tracked per learner: which lessons they have completed and where they left off in a lesson"*).
- `clerk-nextjs-patterns` (`.agents/skills/clerk-nextjs-patterns/SKILL.md`).
- `prompts/45-user-scoped-notifications-and-progress-isolation.md`.
- `prompts/47-user-scoped-dashboard-progress-sync.md`.

---

## Code Inspected

- `lib/progress.ts`:
  - Lines 108-114 (`getStorageKey`): Returns `${LEGACY_STORAGE_PREFIX}${courseSlug}` when `userId` is null/undefined.
  - Line 217 (`saveProgress`): Currently resolves `const userId = explicitUserId || getActiveUserId();` but proceeds to write to `localStorage.setItem(storageKey, raw)` even if `userId` is null, writing to legacy keys and registering course learner.
  - Lines 258-308 (`markLessonCompleted`): Currently proceeds through completion calculation and calls `saveProgress` even if `userId` is null.
  - Lines 313-368 (`toggleLessonCompleted`): Calls `saveProgress` even if `userId` is null.
  - Lines 373-399 (`markEntireCourseCompleted`): Calls `saveProgress` even if `userId` is null.

---

## Decisions and Assumptions

1. **Strict Guard on `saveProgress`**:
   - If `!userId`, immediately return without performing any `localStorage.setItem`, registration, or event dispatch.
2. **Prevent Anonymous Progress Mutations**:
   - In `markLessonCompleted`, `toggleLessonCompleted`, and `markEntireCourseCompleted`, verify `userId`. If falsy, return `DEFAULT_EMPTY_STATE` immediately.
   - This ensures PostHog completion events (`lesson_completed`, `course_completed`) are never emitted for anonymous visitors.
3. **Legacy Prefix Read-Only for Migration**:
   - `getStoredProgress` and `migrateLegacyProgressToUser` retain the ability to read existing legacy keys so legacy data can be migrated once a user logs in, but no new writes to `vertex_course_progress_*` can ever take place.

---

## Files to Create or Change

```text
lib/progress.ts    [MODIFY] Guard saveProgress, markLessonCompleted, toggleLessonCompleted, and markEntireCourseCompleted against unauthenticated writes
```

---

## Requirements

1. `saveProgress` must return early when neither `explicitUserId` nor `getActiveUserId()` yields a valid user ID.
2. `markLessonCompleted`, `toggleLessonCompleted`, and `markEntireCourseCompleted` must return `DEFAULT_EMPTY_STATE` without persisting when no active user ID is present.
3. Ensure no writes to `vertex_course_progress_*` can occur from unauthenticated sessions.
4. Keep changes minimal and maintain existing TypeScript and ESLint standards.

---

## Security Considerations

- Prevents unauthorized or anonymous writes from corrupting global legacy keys or polluting learner metrics.
- Prevents cross-user progress collisions when multiple users share a browser before signing in.

---

## Acceptance Criteria

1. An anonymous / signed-out visitor clicking next or toggling completion does NOT create or modify any `vertex_course_progress_*` or `vertex_progress_*` keys in `localStorage`.
2. Signed-in users continue to have their progress saved normally to `vertex_progress_${userId}_${courseSlug}`.
3. Legacy data migration remains fully functional when a user logs in.
4. TypeScript check (`npx tsc --noEmit`) and ESLint pass with zero errors.

---

## Checks to Run

- `npx tsc --noEmit`
- `npx eslint lib/progress.ts`

---

## Exact Manual Test Steps

1. Clear localStorage in browser dev tools.
2. Ensure you are signed out (or open incognito window).
3. Navigate to a lesson page (e.g., `/lessons/...`).
4. Click "Next Lesson" or toggle the completion button.
5. In dev tools Application > Local Storage, verify that no `vertex_course_progress_*` keys are created.
6. Sign in as a Clerk user, complete a lesson, and verify `vertex_progress_<userId>_<courseSlug>` is created as expected.
