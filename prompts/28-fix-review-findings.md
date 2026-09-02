# Implementation Prompt: Fix Code Review Findings and Polish Search, Progress, and Ingestion

Resolve verified code review findings across search route, my-learning dashboard, progress tracking, course lesson counting, search UI components, ingestion scripts, context instructions, and prompt documentation while keeping changes minimal, clean, and adhering to Vertex architectural boundaries.

---

## Goal

Audit and address all verified inline code review findings:
1. Normalize video identifiers in search fallback to ensure robust matching across YouTube/Vimeo/Bunny URL variants and candidate lesson deduplication.
2. Fix lesson counting in course detail page to ignore null/slugless lessons.
3. Decouple My Learning dashboard from fixed `slice(0, 2)` so it dynamically calculates in-progress and completed courses across the full catalog.
4. Prevent completed courses in `MyLearningCard` from falling back to lesson 1 when linking to review course.
5. Pass accurate total course lesson counts in `LessonContent` and `LessonVideoPlayer` when toggling or marking completion.
6. Remove automatic pre-completion of earlier module lessons in `LessonSidebar`.
7. Upgrade Tailwind v3 classes (`flex-shrink-0`, `rounded`) to v4 standard (`shrink-0`, `rounded-sm`) in `SearchSkeleton` and search page.
8. Allow empty query submission in `SearchResultsView` to clear search results and reflect empty state cleanly.
9. Prevent repetitive duplicate student count increments on `saveProgress` in `enrollment.ts` and scope learner storage keys cleanly.
10. Fix unlabeled code fences in prompt documentation files with `text` tag.
11. Update GROQ fallback matching in `vertex-search.ndjson` to use `match` for wildcard query tokens.
12. Add monotonic `startSeconds` validation for chunks in `build-ndjson.mjs`.

---

## Skills read

- `sanity-best-practices`
- `create-agent-with-sanity-context`
- `clerk-nextjs-patterns`

---

## Code inspected

- `app/api/search/route.ts` — `videoMap` string URL lookup and candidate scoring in `executeGroqFallbackSearch`.
- `app/courses/[slug]/page.tsx` — `totalLessonsCount` increment loop.
- `app/my-learning/page.tsx` — `inProgressCourses` and `recommendedCourses` static array slicing.
- `components/dashboard/my-learning-dashboard.tsx` — course progress mapping, filtering, and stats aggregation.
- `components/cards/my-learning-card.tsx` — `nextLessonSlug` fallback calculation.
- `components/lesson/lesson-content.tsx` — `handleCompleteToggle` parameters.
- `components/lesson/lesson-sidebar.tsx` — `defaultPrecedingSlugs` population from module index.
- `components/lesson/lesson-video-player.tsx` — interval-based elapsed seconds and completion trigger.
- `components/search/search-skeleton.tsx` & `app/search/page.tsx` — Tailwind class utilities.
- `components/search/search-view.tsx` — `queryParam` default and `handleSubmit` empty query handling.
- `lib/enrollment.ts` & `lib/progress.ts` — duplicate registration in `registerCourseLearner` and storage keys.
- `studio/scripts/context/vertex-search.ndjson` — GROQ instructions text matching predicates.
- `studio/scripts/ingest/build-ndjson.mjs` — transcript chunks validation loop.
- `lib/format.ts` & `components/search/video-result-card.tsx` — timestamp formatting.
- `studio/schemaTypes/index.ts` — video schema registration.

---

## Decisions and assumptions

1. **Search Video Key Normalization**:
   - Introduce a helper `getVideoLookupKey(url)` in `lib/video.ts` or search route that extracts provider-specific IDs (YouTube ID, Vimeo ID, Bunny ID) or canonical URL string, ensuring `youtu.be/ID`, `youtube.com/watch?v=ID`, and embed URLs resolve to the same video document.
   - In fallback search, ensure candidate lessons include lessons whose module title or video transcript/chapters matched terms, deduplicated by `_id`.

2. **Accurate Lesson Counting**:
   - In `app/courses/[slug]/page.tsx`, only count lessons having valid `lesson?.slug`.

3. **Dynamic My Learning Dashboard**:
   - In `app/my-learning/page.tsx`, pass the full `dashboardCourses` list to `MyLearningDashboard`.
   - In `MyLearningDashboard`, evaluate progress across all catalog courses dynamically, correctly grouping courses into in-progress (started and not 100%), completed (100%), and unstarted (available/recommended).

4. **Review Course Link on Completed Cards**:
   - In `MyLearningCard`, when `isCompleted` is true, leave `nextLessonSlug` as `null` so `resumeHref` resolves to `/courses/${slug}`.

5. **Explicit & Accurate Completion Handling**:
   - In `LessonSidebar`, initialize `defaultPrecedingSlugs` as empty array `[]` so viewing a lesson does not artificially mark earlier lessons completed.
   - In `LessonContent`, calculate `totalCourseLessons` and pass it to `toggleLessonCompleted`.

6. **Search UI & Skeleton Polish**:
   - Replace `flex-shrink-0` with `shrink-0` and `rounded` with `rounded-sm`.
   - Allow empty query string in `SearchResultsView` without forcing fallback `"data fetching"`.

7. **Enrollment Deduplication**:
   - Ensure `registerCourseLearner` tracks whether the local learner has already enrolled in `courseSlug`, avoiding infinite incremental counts on subsequent progress updates.

8. **Script & Context Improvements**:
   - Add monotonic `startSeconds` check in `build-ndjson.mjs` chunks loop.
   - Update `vertex-search.ndjson` instructions to specify `match` for wildcard tokens.
   - Label prompt markdown file-lists with `text`.

---

## Files to create or change

```text
lib/video.ts                                      [MODIFY] Add getVideoLookupKey helper for unified video matching
app/api/search/route.ts                           [MODIFY] Use normalized video keys and candidate lesson deduplication
app/courses/[slug]/page.tsx                       [MODIFY] Exclude null/slugless lessons from totalLessonsCount
app/my-learning/page.tsx                          [MODIFY] Pass all dashboard courses to MyLearningDashboard
components/dashboard/my-learning-dashboard.tsx   [MODIFY] Dynamically categorize all courses by live progress
components/cards/my-learning-card.tsx             [MODIFY] Unset nextLessonSlug when course is completed
components/lesson/lesson-content.tsx              [MODIFY] Pass total course lesson count to toggleLessonCompleted
components/lesson/lesson-sidebar.tsx              [MODIFY] Initialize defaultPrecedingSlugs as empty
components/lesson/lesson-video-player.tsx         [MODIFY] Guard completion logic and avoid false triggers
components/search/search-skeleton.tsx             [MODIFY] Replace Tailwind v3 classes with v4 equivalents
components/search/search-view.tsx                 [MODIFY] Allow empty search query state and submission
app/search/page.tsx                               [MODIFY] Replace Tailwind v3 rounded class with rounded-sm
lib/enrollment.ts                                 [MODIFY] Deduplicate repeated learner registration increments
studio/scripts/context/vertex-search.ndjson       [MODIFY] Update wildcard term filter to use match
studio/scripts/ingest/build-ndjson.mjs            [MODIFY] Enforce monotonic startSeconds on chunks
prompts/16-my-learning-page.md                    [MODIFY] Add text tag to file list fence
prompts/17-course-and-lesson-completion-progress.md [MODIFY] Add text tag to file list fence
prompts/22-course-and-lesson-bookmark-functionality.md [MODIFY] Add text tag to file list fence
prompts/23-my-learning-bookmarked-courses-tab.md  [MODIFY] Add text tag to file list fence
prompts/24-fix-posthog-ingest-proxy-error.md      [MODIFY] Add text tag to file list fence
prompts/25-live-student-count-tracking.md         [MODIFY] Add text tag to file list fence
prompts/26-fix-enrollment-getserversnapshot-cache.md [MODIFY] Add text tag to file list fence
prompts/27-real-enrolled-students-count.md        [MODIFY] Add text tag to file list fence
```

---

## Security considerations

- Private datasets, secret API keys (Sanity read token, Clerk secret key, PostHog private key) remain strictly on the server.
- Browser storage keys are cleanly isolated per user session to avoid cross-user state bleed.

---

## Acceptance criteria

1. Video matching in search route fallback correctly associates lessons with video documents regardless of whether URLs use `youtu.be`, `watch?v=`, or embed formats.
2. `totalLessonsCount` on `/courses/[slug]` counts only valid lessons with slugs.
3. My Learning page displays accurate metrics, in-progress, and completed cards for all courses in the catalog.
4. Completed course cards link to `/courses/[slug]` under "Review Course" instead of `/lessons/lesson-1`.
5. Navigating directly to a lesson does not mark preceding lessons as completed.
6. Submitting an empty search input clears prior search results and does not crash or default to `"data fetching"`.
7. `npm run build` passes with zero TypeScript errors or lint issues.

---

## Verification checks to run

- `npm run build` (Next.js web workspace build and type check)
- `node studio/scripts/ingest/build-ndjson.mjs` (Verify chunk monotonicity check validation)

---

## Exact manual test steps

1. Navigate to `/search` with no query: verify empty search state is displayed cleanly without unexpected error.
2. Search for a query like `data fetching` or `react`: verify both video moment cards (with timestamp) and lesson cards render properly.
3. Open a course page `/courses/enterprise-nextjs-architecture`: verify total lesson count matches actual lessons.
4. Complete all lessons in a course: check `/my-learning` and verify the course appears under "Completed" tab with 100% badge and "Review Course" button linking to `/courses/[slug]`.
