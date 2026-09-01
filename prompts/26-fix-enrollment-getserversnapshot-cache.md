# Implementation Prompt: Fix useSyncExternalStore getServerSnapshot Caching in lib/enrollment.ts

## Goal

Resolve the React runtime error `The result of getServerSnapshot should be cached to avoid an infinite loop` and `Maximum update depth exceeded` by providing a referentially stable cached snapshot for SSR and client hydration in `lib/enrollment.ts`.

---

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 6 tech stack, 13 checks).
- `lib/progress.ts` and `lib/bookmarks.ts` — verified established referentially stable snapshot patterns.

---

## Code inspected

- `lib/enrollment.ts` — Discovered `getServerSnapshot` returns a newly created object `{}` on each invocation: `const getServerSnapshot = (): Record<string, number> => ({})`. React compares snapshots with `Object.is`, triggering infinite re-render cycles during render.
- `lib/enrollment.ts` lines 27-52 — `getStoredSnapshot()` needs an immutable frozen reference cache `EMPTY_ENROLLMENTS` when storage is unpopulated.

---

## Decisions and assumptions

1. **Referentially Stable Frozen Default Snapshot**:
   - Define an immutable `EMPTY_ENROLLMENTS: Record<string, number> = Object.freeze({})`.
   - Update `getServerSnapshot` to return `EMPTY_ENROLLMENTS`.
   - Ensure `getStoredSnapshot` returns `EMPTY_ENROLLMENTS` whenever storage is empty or during SSR.
   - Freeze parsed snapshot objects so that referential equality is preserved across renders when data has not changed.

---

## Files to create or change

```
lib/enrollment.ts                               [MODIFY] Ensure referential stability for getServerSnapshot and getStoredSnapshot
```

---

## Requirements

1. Eliminate `The result of getServerSnapshot should be cached to avoid an infinite loop` warning.
2. Eliminate `Maximum update depth exceeded` runtime error on `/courses/[slug]`.
3. Preserve real-time reactive enrollment tracking.

---

## Security considerations

- No sensitive data touched; strictly client-side store stability.

---

## Acceptance criteria

1. Navigating to `/courses/nextjs-app-router-in-depth` renders cleanly with zero console warnings or update depth errors.
2. `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass cleanly.

---

## Checks to run

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Manual test steps

1. Open `http://localhost:3000/courses/nextjs-app-router-in-depth`.
2. Open browser Console tab and verify no `getServerSnapshot` or `Maximum update depth exceeded` error appears.
3. Click **Continue Learning** and confirm smooth operation without errors.
