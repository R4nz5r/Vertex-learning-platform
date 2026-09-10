# Implementation prompt: Dynamic Recently Completed Course Banner on My Learning

## Goal

Dynamically display the most recently completed course in the "Course Completed" hero banner on `/my-learning` instead of statically showing the first course in the list. When a learner completes a course (or among multiple completed courses), automatically update the hero banner to feature that most recently completed course.

## Skills and docs read

- `AGENTS.md` (sections 2 How to work, 3 UI work, 5 How the app is structured, 7 Decisions already made for you, 13 Checks to run).
- `prompts/16-my-learning-page.md`, `prompts/17-course-and-lesson-completion-progress.md`, `prompts/18-fix-my-learning-progress-sync.md`.

## Code inspected

- `lib/progress.ts`: `CourseProgressState`, `saveProgress`, `markLessonCompleted`, `toggleLessonCompleted`, `markEntireCourseCompleted`, `getStoredProgress`.
- `components/dashboard/my-learning-dashboard.tsx`: `MyLearningDashboard`, `progressMap`, `activeCourses`, `primaryCourse`, `MyLearningResumeBanner`.
- `components/cards/my-learning-resume-banner.tsx`: `MyLearningResumeBanner`.

## Decisions and assumptions

1. **Timestamp Tracking in `lib/progress.ts`**:
   - Extend `CourseProgressState` with optional timestamps: `updatedAt?: number` and `completedAt?: number`.
   - In `markLessonCompleted`, `toggleLessonCompleted`, `markEntireCourseCompleted`, and `saveProgress`:
     - Assign `updatedAt: Date.now()`.
     - When `isCourseCompleted` is true (or becomes true), set `completedAt: current.completedAt || Date.now()`. If `isCourseCompleted` transitions to false, reset `completedAt` to undefined.
   - In `getStoredProgress`, gracefully handle existing records where `isCourseCompleted` is true but `completedAt` was not previously set.

2. **Banner Course Selection in `components/dashboard/my-learning-dashboard.tsx`**:
   - In `progressMap`, capture `updatedAt` and `completedAt` from stored progress.
   - For `primaryCourse`:
     - If in-progress courses exist, pick the in-progress course with the latest `updatedAt` timestamp (for "Resume where you left off").
     - If all active courses are completed (or when completed), select the completed course with the highest `completedAt` timestamp (fallback to `updatedAt`).
     - This guarantees that whenever a user completes a course, that course immediately becomes the most recently completed course and updates the banner in real-time via `useSyncExternalStore`.

## Files to touch

- `lib/progress.ts`
- `components/dashboard/my-learning-dashboard.tsx`

## Requirements

1. When multiple courses are completed, the hero banner must display the most recently completed course instead of statically choosing the first item in the courses array.
2. Completing a new course must automatically and immediately update the banner to feature that completed course.
3. If an in-progress course exists, the banner continues to offer resuming the most recently active lesson until completed, after which it smoothly highlights the newly completed course.

## Acceptance criteria

- [ ] `lib/progress.ts` records `completedAt` and `updatedAt` timestamps in `CourseProgressState`.
- [ ] `components/dashboard/my-learning-dashboard.tsx` selects the course with the highest `completedAt` when highlighting a completed course.
- [ ] Completing lessons or courses updates the banner reactively without page reloads.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run build` passes.

## Checks to run

```bash
npx tsc --noEmit
npm run build
```

## Manual test steps

1. Navigate to `http://localhost:3000/my-learning`.
2. Ensure both courses are completed or mark "TypeScript for Application Developers" as complete.
3. Verify that the hero banner displays "TypeScript for Application Developers" with "Course Completed 🎉".
4. Mark or complete lessons in "Building AI Apps with LLMs".
5. Verify that the hero banner updates to "Building AI Apps with LLMs" with "Course Completed 🎉".
