# Implementation prompt: Comprehensive PostHog Event Tracking

## Goal

Implement comprehensive PostHog event tracking across Vertex for all features built since the basic setup:
1. Search performed with query (`search_performed`) capturing raw query, result count, course count, sort, and zero-result indicator.
2. Search result opened with result type (`search_result_clicked`) capturing `result_type` ("video" vs "lesson"), query, lesson metadata, and timestamp.
3. Video play started (`video_play_started` / `video_played`).
4. Watch depth tracking (`video_watch_progress` at 25%, 50%, 75%, 90%) using an elapsed active-time playback heuristic against lesson duration.
5. Resume used (`lesson_resume_used`) when playback starts with a timestamp offset or navigating from timestamp links.
6. Lessons completed (`lesson_completed`) derived client-side automatically when watch depth reaches ≥ 95% (as expected by analytics scouts).
7. Additional platform moments: course catalog views (`catalog_viewed`), empty state suggested search topic clicks (`search_empty_topic_clicked`), bookmark toggles (`lesson_bookmark_toggled`), and curriculum sidebar navigation (`lesson_sidebar_clicked`).

## Skills and docs read

- `AGENTS.md` — §1 (Intelligent search with timestamp jumps), §5 (Architecture & PostHog separation of client vs server), §6 (Tech Stack: PostHog client + server), §7 (Product analytics events: catalog/lesson views, search, video play & watch depth, lesson completed), §12 (PostHog rules), §13 (Checks).
- `lib/posthog-server.ts` & `instrumentation-client.ts` — Existing PostHog setup.

## Code inspected

- `app/api/search/route.ts` — Server search execution and `search_performed` capture.
- `components/search/search-view.tsx` — Search UI, query state, empty search state.
- `components/search/video-result-card.tsx` — Video search result cards with "Watch from X".
- `components/search/lesson-result-card.tsx` — Lesson search result cards.
- `components/lesson/lesson-video-player.tsx` — Video player iframe embed, play start state, timestamp handling.
- `components/lesson/lesson-content.tsx` — Lesson content rendering, breadcrumbs, bookmarks, resources.
- `components/lesson/lesson-sidebar.tsx` — Module/lesson curriculum links.
- `components/lesson/lesson-navigation.tsx` — Prev/Next navigation buttons.
- `app/courses/page.tsx` — All courses catalog page.
- `app/lessons/[slug]/page.tsx` — Lesson page server loader and `lesson_viewed` capture.
- `app/courses/[slug]/page.tsx` — Course page server loader and `course_viewed` capture.

## Decisions and assumptions

1. **Watch Depth Tracking Mechanism**:
   - Use an active-time wall-clock heuristic in `LessonVideoPlayer` since embedded provider iframes do not expose cross-origin postMessage APIs without external SDK bundles.
   - While `isPlaying` is true, an interval tracks active playback seconds against the lesson duration.
   - Fire `video_watch_progress` milestone events at 25%, 50%, 75%, and 90% (once per milestone per session).
2. **Lesson Completion Trigger**:
   - Fire `lesson_completed` client-side automatically when watch depth reaches ≥ 95% of lesson duration. This satisfies the `signals-scout-course-funnel` scout without requiring a backend progress store.
3. **Search Query Capture & Privacy**:
   - Capture search analytics with privacy-safe properties (`query_length`, `result_count`, `course_count`, `sort`, `has_results`) across client-side events (`search_submitted`, `search_result_clicked`) and server-side tracking, omitting raw PII or sensitive query text in client payloads.
4. **Resume Used Event**:
   - Fire `lesson_resume_used` when `startSeconds > 0` on player start or when a user clicks a timestamped video result / resume affordance.
5. **Distinct ID & PII**:
   - User identity is tied strictly to the Clerk user ID (`distinctId`). Event properties do not contain user emails, names, or passwords.

## Files to touch

- `components/lesson/lesson-video-player.tsx` — Implement elapsed active playback timer, milestone tracking (25%, 50%, 75%, 90%), `video_watch_progress`, `lesson_resume_used`, and ≥95% `lesson_completed` event dispatch.
- `components/search/video-result-card.tsx` — Add `search_result_clicked` (`result_type: "video"`, `query`, `lesson_slug`, `start_seconds`, `rank`).
- `components/search/lesson-result-card.tsx` — Add `search_result_clicked` (`result_type: "lesson"`, `query`, `lesson_slug`, `rank`).
- `components/search/search-view.tsx` — Pass `query` to result cards and track `search_empty_topic_clicked` when suggested topic pills are clicked.
- `app/courses/page.tsx` — Ensure `catalog_viewed` event is captured on course catalog view.
- `app/api/search/route.ts` — Verify and ensure `search_performed` server-side capture includes all properties (`query`, `result_count`, `course_count`, `sort`, `has_results`).

## Requirements

1. `search_performed` captures `{ query, result_count, course_count, sort, has_results }`.
2. `search_result_clicked` captures `{ query, result_type: "video" | "lesson", lesson_title, lesson_slug, course_title, course_slug, start_seconds, rank }` on click of video or lesson cards.
3. `video_play_started` / `video_played` fires when playback begins.
4. `lesson_resume_used` fires when playback begins with `start_seconds > 0`.
5. `video_watch_progress` fires at 25%, 50%, 75%, and 90% milestones with `{ lesson_slug, milestone_percentage, seconds_watched, total_duration }`.
6. `lesson_completed` fires automatically when watch depth reaches ≥ 95% with `{ lesson_title, lesson_slug, course_title, course_slug, completed_via: "watch_depth_95" }`.
7. `catalog_viewed` fires when viewing the course catalog.
8. No PII beyond Clerk distinct ID is captured.

## Security considerations

- PostHog server-side events use the server client and flush immediately.
- Client-side events use `posthog-js`.
- No sensitive user PII is sent in custom event properties.

## Acceptance criteria

1. All 6 requested event types (`search_performed`, `search_result_clicked`, `video_play_started`, `video_watch_progress`, `lesson_resume_used`, `lesson_completed`) fire cleanly with exact properties.
2. `npx tsc --noEmit` passes with 0 errors.
3. `npm run lint` passes with 0 errors.
4. `npm run build` succeeds cleanly.

## Checks to run

- `npx tsc --noEmit` in root web workspace
- `npm run lint` in root web workspace
- `npm run build` in root web workspace

## Exact manual test steps

1. Visit `/search?q=caching` -> Verify `search_performed` event.
2. Click a video result card ("Watch from 02:15") -> Verify `search_result_clicked` event with `result_type: "video"`.
3. Open a timestamped video result at 02:15, and on lesson page start video -> Verify both `video_play_started` and `lesson_resume_used` (with `start_seconds: 135`).
4. Allow playback to progress -> Verify `video_watch_progress` at 25%, 50%, 75%, 90% and `lesson_completed` at ≥ 95%.
5. Click empty search suggested topic on `/search?q=xyz` -> Verify `search_empty_topic_clicked`.
6. Visit `/courses` -> Verify `catalog_viewed`.
