# Implementation Prompt: User-Scoped Dashboard Progress Memoization & Explicit User ID Sync

## Goal

Ensure that `MyLearningDashboard` maintains strict user isolation across Clerk account switches by:
1. Hoisting `userId` from `user?.id` so it is accessible to all dashboard computations.
2. Updating `progressMap`'s dependency array to include `userId`.
3. Passing explicit `userId` to `getStoredProgress` in the `aggregate-statistics` calculation.
4. Updating `aggregate-statistics`'s dependency array to include `userId`.

---

## Skills and Docs Read

- `AGENTS.md` (Section 2 How to work, Section 5 App structure, Section 7 Decisions: *"Learner progress and any other per user state key off the Clerk user id"*).
- `clerk-nextjs-patterns` (`.agents/skills/clerk-nextjs-patterns/SKILL.md`).
- `prompts/45-user-scoped-notifications-and-progress-isolation.md`.

---

## Code Inspected

- `components/dashboard/my-learning-dashboard.tsx`:
  - Line 101: `const { user } = useUser();`
  - Line 122: `const userId = user?.id;` declared inside `progressMap` `useMemo`.
  - Line 142: `getStoredProgress(c.slug, defaultPrecedingLessonsMap[c.slug] || [], userId)` passes `userId`, but `userId` is omitted from `progressMap` dependencies (line 163).
  - Line 203: `const prog = getStoredProgress(c.slug, defaultPrecedingLessonsMap[c.slug] || []);` in `aggregate-statistics` `useMemo` lacks explicit `userId`.
  - Line 221: `aggregate-statistics` dependencies (`[activeCourses, defaultPrecedingLessonsMap, progressMap]`) omit `userId`.
- `lib/progress.ts`:
  - `getStoredProgress(courseSlug: string, defaultPrecedingLessons: string[] = [], explicitUserId?: string | null)` accepts explicit `userId`.

---

## Decisions and Assumptions

1. **Explicit User ID Hoisting**:
   - Hoist `const userId = user?.id;` to component scope right after `const { user } = useUser();`.
2. **Memoization Dependency Accuracy**:
   - Add `userId` to `progressMap`'s dependency array: `[allAvailableCourses, defaultPrecedingLessonsMap, hasMounted, progressVersion, userId]`.
   - Add `userId` to `aggregate-statistics`'s dependency array: `[activeCourses, defaultPrecedingLessonsMap, progressMap, userId]`.
3. **Explicit User ID in All Reads & Absent User Guard**:
   - In `aggregate-statistics` and `progressMap`, pass `userId` to `getStoredProgress`: `getStoredProgress(c.slug, defaultPrecedingLessonsMap[c.slug] || [], userId)`.
   - If `userId` is absent/undefined during account transitions, return an empty progress state rather than falling back to `getActiveUserId()` or anonymous storage.
   - This prevents race conditions or reading stale active user data during Clerk user transitions.

---

## Files to Create or Change

```text
components/dashboard/my-learning-dashboard.tsx    [MODIFY] Hoist userId, add to progressMap & stats dependencies, pass explicit userId in stats calculation
```

---

## Requirements

1. `userId` must be derived from `user?.id` at top-level component scope.
2. `progressMap` dependency list must include `userId`.
3. `aggregate-statistics` calculation must invoke `getStoredProgress(c.slug, defaultPrecedingLessonsMap[c.slug] || [], userId)`.
4. `aggregate-statistics` dependency list must include `userId`.
5. Keep changes minimal and focused strictly on this verified finding.

---

## Security Considerations

- Prevents cross-user progress leakage or stale aggregation when switching between different Clerk accounts on the same machine.
- Guarantees progress reads in `MyLearningDashboard` are strictly isolated by `userId`.

---

## Acceptance Criteria

1. Both `progressMap` and `aggregate-statistics` memoizations recompute whenever `userId` changes.
2. All `getStoredProgress` invocations in `my-learning-dashboard.tsx` explicitly pass `userId`.
3. No lint errors or TypeScript compilation failures.
4. Existing functionality and responsive UI remain completely preserved.

---

## Checks to Run

- Run `npm run lint` or ESLint check on `components/dashboard/my-learning-dashboard.tsx`.
- Run `npx tsc --noEmit` to verify type integrity.
- Verify dev server build succeeds without hydration mismatches.

---

## Exact Manual Test Steps

1. Start dev server (`npm run dev`).
2. Navigate to `http://localhost:3000/my-learning`.
3. Verify the dashboard mounts cleanly and displays statistics and active courses.
4. Sign in as User A, complete a lesson in a course, verify stats update immediately.
5. Switch accounts / sign in as User B: verify stats and progress immediately recompute with User B's explicit `userId` without retaining User A's progress.
