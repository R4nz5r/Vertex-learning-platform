# Implementation prompt: Search Two-Stage Timestamp Resolution and On-Site Playback

## Goal

Upgrade the Vertex search engine and playback integration to implement two-stage timestamp resolution (matching video chapter markers first as primary table-of-contents, and falling back to transcript chunks only if no chapter matches) and provide seamless on-site timestamped video playback where result cards deep link directly to the lesson page at the matched second (`/lessons/[slug]?start=X`) and the embedded provider player (YouTube, Vimeo, Bunny) immediately seeks to and begins playback from that second.

## Skills and docs read

- `AGENTS.md` — §1 (search links straight to exact second in lesson video), §4 (skills & patterns), §5 (server-side data access & search API boundary), §7 (grounded search, video docs as internal lookup, two-stage timestamp resolution: chapters first then transcript fallback, provider embeds with start seconds query params, playback stays on-site), §8 (video document model: `chapters[]` with `{ startSeconds, label }` and `chunks[]` with `{ startSeconds, text }`), §9 (video pipeline & providers: YouTube, Vimeo, Bunny), §11 (search behavior: video results vs lesson results, deep links to lesson page with start seconds), §13 (checks).
- `sanity-best-practices` & `create-agent-with-sanity-context` (GROQ queries, search grounding, MCP context).

## Code inspected

- `app/api/search/route.ts` — Search API route orchestrating LLM/MCP search and GROQ fallback search with two-stage chapter & transcript timestamp extraction.
- `lib/search/system-prompt.ts` — Inline LLM system prompt instructing the model on GROQ querying, two-stage video resolution (`chapters[].label` first, `chunks[].text` fallback), and grounded output format.
- `sanity/lib/queries.ts` — `SEARCH_VIDEOS_GROQ_QUERY`, `SEARCH_LESSONS_GROQ_QUERY`, `LESSONS_BY_IDS_QUERY`.
- `lib/search/ground.ts` — Grounding pass linking raw hits to authoritative Sanity lesson/course documents, calculating lesson positions, and building canonical URLs with start seconds.
- `lib/video.ts` — Video provider URL parser and embed URL generator supporting YouTube (`&start=X`), Vimeo (`#t=Xs`), and Bunny (`?time=X`).
- `lib/routes.ts` — `lessonHref(slug, startSeconds)` generating `/lessons/[slug]?start=X`.
- `components/search/video-result-card.tsx` — Video result card UI rendering thumbnail, play button, duration badge, "Watch from M:SS" button, and deep linking to lesson page with start timestamp.
- `app/lessons/[slug]/page.tsx` — Lesson page route reading `start` / `t` query parameters and passing `startSeconds` to lesson video player.
- `components/lesson/lesson-video-player.tsx` — Embedded player iframe initialization, start timestamp seeking, and PostHog resume & playback analytics tracking.

## Decisions and assumptions

1. **Two-Stage Timestamp Resolution**:
   - **Stage 1 (Chapters First)**:
     - Match query terms/concepts against `vDoc.chapters[].label` (the clean authored table of contents).
     - If any chapter matches, immediately lock `matchedTimestamp = chapter.startSeconds` and format match reason with chapter label (e.g. `Video chapter "${chapter.label}" teaches this topic directly.`).
   - **Stage 2 (Transcript Chunks Fallback)**:
     - If and only if no chapter matches, iterate through `vDoc.chunks[].text` (the granular timestamped transcript).
     - Find the earliest / most specific chunk matching the query and set `matchedTimestamp = chunk.startSeconds` with reason referencing transcript coverage.
   - **Fallback to Lesson**:
     - If neither chapter nor transcript matches, output `kind: "lesson"` with `startSeconds: null`.
2. **On-Site Timestamped Deep Linking & Playback**:
   - Result card renders a prominent "Watch from M:SS" link directing to `/lessons/${slug}?start=${startSeconds}`.
   - `LessonDetailPage` reads `searchParams.start` and provides `startSeconds` to `LessonVideoPlayer`.
   - `LessonVideoPlayer` uses provider-native embed parameters:
     - **YouTube**: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&start=${startSeconds}` (with `autoplay=1` on click/navigation).
     - **Vimeo**: `https://player.vimeo.com/video/${id}?dnt=1#t=${startSeconds}s`.
     - **Bunny**: `https://.../embed/...?time=${startSeconds}`.
   - When navigated from a timestamped search link (`startSeconds > 0`), the player automatically loads at and plays from the exact timestamp without taking the learner off-site.
3. **Analytics Integration**:
   - Capture `search_result_clicked` with `start_seconds` and `result_type: "video"`.
   - On the lesson page, capture `video_played` and `lesson_resume_used` with `start_seconds` and `source: "url_param"`.

## Files to touch

- `app/api/search/route.ts` — Solidify two-stage timestamp resolution in both GROQ fallback search and MCP/LLM integration.
- `lib/search/system-prompt.ts` — Reinforce chapter-first transcript-fallback prompt directives for the LLM.
- `sanity/lib/queries.ts` — Ensure `SEARCH_VIDEOS_GROQ_QUERY` retrieves all chapters and matching transcript chunks.
- `lib/video.ts` — Verify and refine provider-specific start timestamp URL transformations for YouTube, Vimeo, and Bunny.
- `components/search/video-result-card.tsx` — Verify link generation, formatted timestamp labels (`Watch from M:SS`), and analytics properties.
- `components/lesson/lesson-video-player.tsx` — Verify automatic iframe playback initialization at `startSeconds` with provider embed URL.

## Requirements

1. Search queries matching specific video topics resolve timestamps via chapter markers first, and fall back to transcript chunks if no chapter matches.
2. Search response marks timestamped hits as `kind: "video"` with `startSeconds` set to the exact second.
3. Search results page displays video result cards with "Watch from [M:SS]" action linking to `/lessons/[slug]?start=[seconds]`.
4. Navigating to the lesson page mounts the provider embed player starting playback directly at the specified second.
5. Learners remain entirely on-site during search result navigation and video playback.

## Security considerations

- Private Sanity tokens and API keys remain on the server; the client receives only public lesson metadata and secure embed URLs.
- Video documents remain an internal lookup in the data store and are never exposed as independent orphaned search items.
- Provider iframe embeds are restricted to approved domains (YouTube, Vimeo, Bunny) with standard `allow` attributes and `playsinline=1`.

## Acceptance criteria

1. Video moments are accurately detected with chapter-first precedence followed by transcript fallback.
2. Result cards display accurate timestamp labels (e.g. `Watch from 1:28`) and link to `/lessons/[slug]?start=X`.
3. Embedded iframe on `/lessons/[slug]?start=X` receives the start second parameter and starts playback at that exact second.
4. Typecheck (`npx tsc --noEmit`), lint (`npm run lint`), and build (`npm run build`) pass cleanly with 0 errors.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Exact manual test steps

1. Navigate to `/search?q=server+action` or `/search?q=sampling` in the browser.
2. Verify that video cards display with `VIDEO` badge, video length duration badge on thumbnail, and `Watch from [M:SS]` button.
3. Click the `Watch from [M:SS]` link on a video result card.
4. Verify browser navigates to `/lessons/<lesson-slug>?start=<seconds>`.
5. Verify the embedded video player starts at the exact timestamp specified in the query parameter.
6. Verify the video plays directly on the site without redirecting off-site.
