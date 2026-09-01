# Implementation Prompt: Course and Lesson Completion Progress Tracking

## Goal

Fix the course completion and module completion logic so learners can complete all lessons and modules (including Module 4 and the final lesson), achieve 100% course completion, and see checkmarks on completed modules and lessons in the sidebar, header progress bar, and course pages.

---

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 3 UI work, 5 structure, 6 stack, 7 decisions on progress tracking, 8 data model, 13 checks).
- `clerk-nextjs-patterns` skill (`.agents/skills/clerk-nextjs-patterns/SKILL.md`)
- `sanity-best-practices` skill (`.agents/skills/sanity-best-practices/SKILL.md`)

---

## Code inspected

- `components/lesson/lesson-sidebar.tsx` — Discovered hardcoded progress calculation `(completedModulesCount + 0.35) / totalModules * 100` (evaluating to 84% on Module 4) and hardcoded module completion `isCompleted = modIdx < currentModuleIndex` (which makes it impossible for the last module `modIdx = 3` to ever show as completed).
- `components/lesson/lesson-navigation.tsx` — Discovered that the last lesson in a course (`nextLesson === null`) renders nothing on the right side, with no CTA to complete the final lesson or complete the course.
- `components/lesson/lesson-content.tsx` — Contains lesson header and tabs, but lacks an interactive "Mark as Complete" action button for learners.
- `components/lesson/lesson-video-player.tsx` — Fires PostHog `lesson_completed` at ≥95% watch depth, but does not update local client progress state.

---

## Decisions and assumptions

1. **Client-side Progress Store with LocalStorage Persistence (`lib/progress.ts` & React Hook)**:
   - Maintain client-side progress state keyed by user ID (or guest session) and course slug in `localStorage`.
   - Track completed lesson slugs (`Set<string>`) per course.
   - Automatically initialize pre-completed lessons for preceding modules (or read stored completed lessons) so learners maintain their past progress while being able to complete active and future lessons.

2. **Accurate Progress & Module Completion**:
   - Calculate course completion percentage based on `Math.round((completedLessonsCount / totalLessonsCount) * 100)`.
   - A module is marked as completed (`CheckCircle2` checkmark icon) when all lessons in that module are completed (or when user completes the module).
   - When the user completes the final lesson in Module 4 (or completes the course), course completion reaches 100% and Module 4 displays the completion checkmark.

3. **Interactive Completion Controls in UI**:
   - **Lesson Header (`LessonContent`)**: Add an interactive "Mark as Complete" toggle button (styled with green/terracotta checkmark when completed).
   - **Bottom Navigation (`LessonNavigation`)**:
     - When navigating between lessons: Add a "Complete & Next Lesson →" button that marks current lesson done and advances to the next lesson.
     - When on the **Final Lesson of the Course**: Render a prominent "Complete Course 🎉" button that marks the course 100% complete and triggers a celebratory completed state.
   - **Sidebar (`LessonSidebar`)**:
     - Completed lessons display a checkmark circle.
     - Completed modules display a checkmark icon.
     - Course header displays accurate live percentage (`X% complete`) and filled progress bar.

---

## Files to create or change

```
lib/progress.ts                       [NEW] Progress helper and localStorage persistence for completed lessons
components/lesson/lesson-sidebar.tsx   [MODIFY] Connect to dynamic completed lessons state, accurate module checkmarks, and 100% completion support
components/lesson/lesson-navigation.tsx [MODIFY] Add "Complete & Next Lesson" and "Complete Course" CTA buttons with completion handler
components/lesson/lesson-content.tsx    [MODIFY] Add interactive "Mark as Complete" toggle button in lesson header
components/lesson/lesson-video-player.tsx [MODIFY] Sync auto-completion at ≥95% watch depth with progress store
```

---

## Requirements

1. Module 4 (and any module) must be able to be completed with a checkmark once its lessons are completed.
2. Course completion percentage must dynamically update based on completed lessons, reaching 100% when all lessons are completed.
3. Learners can manually mark any lesson as complete or incomplete via the "Mark as Complete" button.
4. The bottom navigation bar on the final lesson must display a "Complete Course" button.
5. Watching a lesson video to ≥95% automatically marks the lesson as completed.
6. Progress is persisted across page refreshes and navigations.

---

## Security considerations

- Client state handles presentation and localStorage persistence safely without sensitive data.
- Does not expose any private keys or tokens.

---

## Acceptance criteria

1. On Lesson 4.3 (or any lesson in Module 4), clicking "Complete Lesson" or "Complete Course" marks Module 4 as completed with the checkmark icon.
2. The course progress bar and percentage in the sidebar and course views update to 100% complete.
3. Completed lessons show checkmarks in the sidebar curriculum list.
4. "Previous Lesson" / "Next Lesson" / "Complete Course" navigation operates smoothly without errors.
5. `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass cleanly.

---

## Checks to run

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Manual test steps

1. Navigate to `http://localhost:3000/lessons/building-ai-apps-with-llms-caching-and-rate-limits` (Lesson 4.3 in Module 4).
2. Verify the "Mark as Complete" button is visible in the lesson header and "Complete Course" button is visible in the bottom navigation.
3. Click "Complete Course" (or "Mark as Complete"):
   - Verify Module 4 displays the orange/green checkmark icon.
   - Verify course completion updates to 100% complete with a full progress bar.
   - Verify Lesson 4.3 displays a completed checkmark in the sidebar.
4. Refresh the page and verify the 100% completed state and Module 4 checkmark remain persisted.
