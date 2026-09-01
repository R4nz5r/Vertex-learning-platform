# Implementation Prompt: Vertex Course and Lesson Bookmark Functionality

## Goal

Implement complete, reactive bookmarking functionality across course detail pages (`/courses/[slug]`) and lesson pages (`/lessons/[slug]`) with persistent client-side storage, real-time synchronization across components/tabs, interactive visual state toggling (e.g. Bookmark ↔ Bookmarked), and PostHog analytics capture.

---

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 3 UI work, 5 structure, 6 stack, 7 decisions, 11 search/catalog, 13 checks).
- `sanity-best-practices` (`.agents/skills/sanity-best-practices/SKILL.md`)
- `lib/progress.ts` — referenced patterns for reactive client-side store using `useSyncExternalStore` and `localStorage`.
- `node_modules/next/dist/docs/` — App Router client/server boundaries.

---

## Code inspected

- `components/course/course-hero.tsx` — Discovered the "Bookmark" button only emitted a PostHog event on click with no internal or shared state, remaining static outline with no toggle state.
- `app/courses/[slug]/page.tsx` — Invokes `<CourseHero />` but did not pass `courseSlug` for identifying which course is bookmarked.
- `components/lesson/lesson-content.tsx` — Contained a local `useState` for `bookmarked` which reset on page reload or navigation instead of persisting.
- `lib/progress.ts` — Existing reference implementation for event-driven local storage synchronization.

---

## Decisions and assumptions

1. **Persistent Reactive Bookmarks Store (`lib/bookmarks.ts`)**:
   - Create a dedicated client-side bookmarks manager with `useSyncExternalStore` and `localStorage`.
   - Store both bookmarked course slugs (`vertex_course_bookmarks`) and bookmarked lesson slugs (`vertex_lesson_bookmarks`).
   - Emit custom events (`vertex_bookmarks_updated`) and listen to cross-tab `storage` events to ensure immediate reactive updates everywhere in the UI without page reload.
   - Provide helper utilities:
     - `useCourseBookmark(slug: string)`: returns `{ isBookmarked: boolean, toggle: () => void }`
     - `useLessonBookmark(slug: string)`: returns `{ isBookmarked: boolean, toggle: () => void }`
     - `toggleCourseBookmark(slug: string, courseTitle?: string, level?: string)`
     - `toggleLessonBookmark(courseSlug: string, lessonSlug: string, lessonTitle?: string)`
     - Batch lookup helpers `getBookmarkedCourses()` and `getBookmarkedLessons()`.

2. **Course Hero Button Integration (`components/course/course-hero.tsx`)**:
   - Add `courseSlug?: string` to `CourseHeroProps`.
   - Wire the Bookmark button to `useCourseBookmark(courseSlug)`.
   - Dynamic UI states:
     - **Unbookmarked**: Standard outline button with neutral icon and label `Bookmark` (`bg-white border-[#EBE4DC] text-neutral-700 hover:bg-neutral-50`).
     - **Bookmarked**: Active warm terracotta/peach state (`bg-[#FFF6F0] border-[#FCDCC9] text-[#C24F1A] hover:bg-[#FFEADB]`) with filled bookmark icon `<Bookmark className="w-4 h-4 text-[#C24F1A] fill-[#C24F1A]" />` and label `Bookmarked`.
     - Accessible attributes: `aria-pressed`, `aria-label`.

3. **Course Page Integration (`app/courses/[slug]/page.tsx`)**:
   - Pass `courseSlug={slug}` to `<CourseHero ... />`.

4. **Lesson Page Integration (`components/lesson/lesson-content.tsx`)**:
   - Connect the lesson bookmark button to `useLessonBookmark(lesson.slug)` instead of temporary `useState(false)`.
   - Maintain active styling (`bg-primary-50 border-primary-300 text-primary-600` with `fill-current`) when bookmarked, persisting across navigation and page refreshes.

5. **Analytics Instrumentation**:
   - Capture `course_bookmarked` and `course_unbookmarked` with course metadata in PostHog.
   - Capture `lesson_bookmarked` and `lesson_unbookmarked` with lesson metadata in PostHog.

---

## Files to create or change

```text
lib/bookmarks.ts                                [NEW] Reactive client store for course & lesson bookmarks using useSyncExternalStore
components/course/course-hero.tsx               [MODIFY] Add courseSlug prop, wire useCourseBookmark, toggle active styling & text
app/courses/[slug]/page.tsx                     [MODIFY] Pass courseSlug={slug} to CourseHero
components/lesson/lesson-content.tsx            [MODIFY] Connect bookmark button to persistent useLessonBookmark
```

---

## Requirements

1. Clicking "Bookmark" on any course page (`/courses/[slug]`) toggles the state between "Bookmark" and "Bookmarked".
2. Bookmarking a course changes the button styling to active warm peach/terracotta with a filled bookmark icon and "Bookmarked" text.
3. Refreshing the course page preserves the bookmarked state.
4. Bookmarking a lesson on `/lessons/[slug]` persists the bookmark in local storage across refreshes and page visits.
5. All bookmark actions capture appropriate PostHog analytics events (`course_bookmarked`, `course_unbookmarked`, etc.).
6. Code maintains full TypeScript safety and zero lint errors.

---

## Security considerations

- Bookmark data is kept in browser `localStorage` keyed by course/lesson slugs.
- No sensitive keys or tokens exposed to the client.

---

## Acceptance criteria

1. Navigating to `/courses/building-ai-apps-with-llms` and clicking **Bookmark** updates the button to **Bookmarked** with active terracotta styling and filled bookmark icon.
2. Navigating away and back or refreshing the page retains the **Bookmarked** state.
3. Clicking **Bookmarked** unbookmarks the course, returning the button to the default state.
4. Lesson bookmarking on `/lessons/[slug]` persists across page reloads.
5. `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass with zero errors.

---

## Checks to run

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Manual test steps

1. Open `http://localhost:3000/courses/building-ai-apps-with-llms`.
2. Click the **Bookmark** button next to "Continue Learning".
3. Verify the button becomes active with filled icon and text **Bookmarked**.
4. Reload the page (`Ctrl + R` / `F5`) and confirm the course remains **Bookmarked**.
5. Click **Bookmarked** again to remove the bookmark and confirm it reverts to **Bookmark**.
6. Open a lesson page (e.g. `http://localhost:3000/lessons/llm-fundamentals`) and toggle the lesson bookmark button; reload the page to verify it persists.
