# Implementation Prompt: Fix Review Findings Batch 2 (Search Candidates, Video Player, Dashboard Polish, Ingestion Merging, and Docs)

Resolve verified review findings across search candidate retrieval, video player completion events, dashboard empty active state & learning time calculation, search header clear action, event tracking privacy, enrollment counting, YouTube request timeouts, and documentation fences.

---

## Goal

1. Enhance `SEARCH_LESSONS_GROQ_QUERY` and `SEARCH_VIDEOS_GROQ_QUERY` to retrieve lessons when parent module titles match and bound returned transcript chunk arrays and video matches.
2. Remove wall-clock timer completion mutation in `LessonVideoPlayer`, driving completion exclusively through explicit user actions and provider events.
3. Fix `MyLearningDashboard` so empty active lists remain empty without forcing fallback courses into active state, and derive `Time Learned` from completed lesson durations.
4. Prevent redundant loading state on same-query search submissions and anonymize raw query strings in search analytics events for privacy.
5. Update `SearchHeader` clear button to reset active query and navigate to `/search`.
6. Add timeout safeguards using `AbortController` in YouTube ingestion fetch calls.
7. Merge fallback and cached video documents in `build-ndjson.mjs` and ensure strict HTTPS URL emission.
8. Only emit `lesson_completed` and `course_completed` on actual state transitions in `markLessonCompleted`.
9. Fix markdown fences across remaining historical prompt documents.

---

## Skills read

- `sanity-best-practices`
- `create-agent-with-sanity-context`
- `clerk-nextjs-patterns`

---

## Code inspected

- `sanity/lib/queries.ts` — `SEARCH_LESSONS_GROQ_QUERY` and `SEARCH_VIDEOS_GROQ_QUERY`.
- `app/api/search/route.ts` — candidate lesson scoring loop.
- `components/lesson/lesson-video-player.tsx` — timer interval and `markLessonCompleted` triggers.
- `components/dashboard/my-learning-dashboard.tsx` — active courses fallback and learning time display.
- `components/search/search-view.tsx` & `components/ui/search-input.tsx` — search submission and analytics event properties.
- `components/search/search-header.tsx` — clear button handler.
- `lib/progress.ts` — `markLessonCompleted` event emission conditions.
- `lib/video.ts` — `extractBunnyId` file path segment matching.
- `studio/scripts/ingest/build-ndjson.mjs` — document loading and HTTPS validation.
- `studio/scripts/ingest/providers/youtube.mjs` — network fetch calls.
- `prompts/18-fix-my-learning-progress-sync.md`, `prompts/19-completed-courses-metric-and-filter.md`, `prompts/20-mobile-first-responsive-polish.md` — code fences.

---

## Decisions and assumptions

1. **Module-Aware Lesson Search Query**:
   - In `SEARCH_LESSONS_GROQ_QUERY`, match when parent course module titles match tokens so that `hasExactQueryInModule` scoring runs effectively.
   - In `SEARCH_VIDEOS_GROQ_QUERY`, cap returned matching chunks to `[0...3]` per video and overall matching video results to `[0...20]` to prevent context overflows.

2. **Clean Video Player Completion**:
   - Remove automatic `markLessonCompleted` mutation from the wall-clock interval in `LessonVideoPlayer`.

3. **Dashboard State & Time Learned**:
   - When a user has 0 enrolled/active courses, `activeCourses` remains `[]` and `recommendedCoursesList` contains all catalog courses.
   - Calculate `totalSecondsLearned` dynamically from completed lesson durations across active courses, formatting it via `formatDurationHoursMinutes`.

4. **Privacy-Safe Search Analytics**:
   - Remove raw `query` from `search_submitted` and `search_result_clicked` event payloads, keeping `query_length` and result metadata.
   - Guard `handleSubmit` in `search-view.tsx` so same-query submissions do not get stuck in a loading state.

5. **Ingestion & Script Robustness**:
   - In `build-ndjson.mjs`, read `videos.ndjson` and merge `.cache` files on top by `_id`, validating that all emitted document URLs are HTTPS.
   - In `youtube.mjs`, wrap fetch calls in `fetchWithTimeout` using an `AbortController`.

---

## Files to create or change

```text
sanity/lib/queries.ts                             [MODIFY] Add module matching to SEARCH_LESSONS and bound chunks in SEARCH_VIDEOS
components/lesson/lesson-video-player.tsx         [MODIFY] Remove wall-clock markLessonCompleted call from timer
components/dashboard/my-learning-dashboard.tsx   [MODIFY] Keep empty active list clean and calculate real time learned
components/search/search-view.tsx                 [MODIFY] Anonymize search query in analytics and prevent same-query loading lock
components/ui/search-input.tsx                    [MODIFY] Anonymize search query in search_submitted event
components/search/video-result-card.tsx           [MODIFY] Remove raw query from search_result_clicked
components/search/lesson-result-card.tsx          [MODIFY] Remove raw query from search_result_clicked
components/search/search-header.tsx               [MODIFY] Support onClear callback to reset query and URL
lib/progress.ts                                   [MODIFY] Only emit completion events on newly completed transitions
lib/video.ts                                      [MODIFY] Improve extractBunnyId terminal media segment extraction
studio/scripts/ingest/parse-video-url.mjs         [MODIFY] Improve extractBunnyId terminal media segment extraction
studio/scripts/ingest/build-ndjson.mjs            [MODIFY] Merge cache with fallback ndjson and validate HTTPS URLs
studio/scripts/ingest/providers/youtube.mjs       [MODIFY] Add AbortController fetch timeouts
studio/scripts/context/vertex-search.ndjson       [MODIFY] Add module title to keyword instructions
studio/scripts/ingest/README.md                   [MODIFY] Update caching and import documentation
prompts/13-posthog-event-tracking.md              [MODIFY] Document privacy-safe search event shapes
prompts/18-fix-my-learning-progress-sync.md       [MODIFY] Add text tag to file list fence
prompts/19-completed-courses-metric-and-filter.md [MODIFY] Add text tag to file list fence
prompts/20-mobile-first-responsive-polish.md      [MODIFY] Add text tag to file list fence
```

---

## Security considerations

- Search query text is excluded from analytics payloads to preserve learner privacy.
- Ingestion scripts enforce HTTPS on all emitted video URLs.
- Server/client boundaries remain strictly preserved.

---

## Acceptance criteria

1. Fallback search returns lessons when parent module titles match search tokens.
2. Ingestion compiler correctly merges fallback videos and cached video files without duplicates.
3. My Learning dashboard correctly calculates real learned time from completed lessons and does not force unstarted courses into the active list.
4. Search Header clear button clears input and navigates to `/search`.
5. Video player wall-clock timer does not artificially mark lessons completed when paused or backgrounded.
6. `npm run build` succeeds with zero errors.

---

## Verification checks to run

- `npm run build`
- `node studio/scripts/ingest/build-ndjson.mjs`

---

## Exact manual test steps

1. Go to `/my-learning` as a new user with no progress: verify 0 courses are in "In Progress" or "Completed", and "More Courses to Explore" displays all catalog courses.
2. Complete a 15-minute lesson: verify `Time Learned` in the dashboard reflects the lesson duration.
3. Open `/search` and submit a query; click the clear (X) icon in `SearchHeader`: verify the query resets to empty and results clear.
4. Search for a module topic (e.g. `caching` or `architecture`): verify matching lessons from that module are returned.
