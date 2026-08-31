# Implementation prompt: Vertex Search Results Page

## Goal

Implement the complete, production-ready Vertex Search results page (`/search`) matching the reference design in `design/vertex-search.png` pixel-for-pixel, wired to Sanity content via the `POST /api/search` route and Sanity fetchers. Support video moment results (with timestamp badges and direct seek links) and lesson topic results (with key points and module metadata), live filtering/sorting, keyboard shortcuts (`⌘K` focus), responsive mobile layouts, loading skeletons, and empty states.

## Skills and docs read

- `AGENTS.md` — §1 (search card links straight to the exact second in a lesson's video and plays on site), §2 (work loop), §3 (pixel-perfect desktop reproduction from `vertex-search.png`, responsive down to mobile), §5 (search UI is a client component rendering video results and lesson results; pages display stored data; browser never holds tokens), §6 (Next.js App Router, Tailwind, TypeScript), §7 (search is a full results page with result count and sort control, returning video moments and lesson cards, grounded playback), §11 (ranked results, video result card with clip length/module/lesson label/start seconds action, lesson result card with key points/summary/action, merged ranking), §12, §13 (type check, lint, build).
- `design/vertex-search.png` — reference visual design for header badge, query title with highlighted keyword in serif font, count summary, search bar, sort dropdown, horizontal Video Result Cards, horizontal Lesson Result Cards, and bottom catalog CTA banner.
- `.claude/skills/create-agent-with-sanity-context/SKILL.md` & `lib/search/types.ts` — search response contract (`SearchResult`, `kind: "video" | "lesson"`, `startSeconds`, `reason`, `keyPoints`, `label`, `moduleTitle`, `href`).

## Code inspected

- `app/api/search/route.ts` — server-side search endpoint returning validated `SearchResponse` (`query`, `sort`, `count`, `courseCount`, `reply`, `results`).
- `lib/search/types.ts` — `SearchRequest`, `SearchResult`, `SearchSort`, `SearchResponse`.
- `lib/search/ground.ts` — enrichment of model hits with authoritative Sanity data, course title/slug, module index/lesson index, `label`, `startSeconds`, and `lessonHref(slug, startSeconds)`.
- `lib/routes.ts` — `lessonHref(slug, startSeconds)`, `courseHref(slug)`, `START_SECONDS_PARAM = "start"`.
- `lib/format.ts` — `formatTimestamp(seconds)`, `formatDuration(seconds)`.
- `components/nav/navbar.tsx` — site navigation bar with Clerk auth state and notification bell.
- `components/ui/search-input.tsx` — search input component with `⌘K` badge.
- `components/cards/course-card.tsx`, `components/cards/lesson-video-card.tsx`, `components/cards/lesson-card.tsx` — existing design tokens and badge variants.
- `app/courses/page.tsx`, `app/page.tsx` — icon resolvers for Next.js, React, Node.js, TypeScript, Docker, etc.

## Decisions and assumptions

1. **Page routing & URLs**:
   - The search page lives at `/search`.
   - URL search params drive the search state: `?q=<query>&sort=<sort>` (e.g. `/search?q=data+fetching&sort=relevance`).
   - Entering a query on any page's search bar (Home, Course Catalog, or Search page) navigates to `/search?q=...`.
   - The search input inside `/search` is controlled and allows instant interactive queries and updates with URL synchronization.
2. **Card Visual Representation (Pixel-matched to `vertex-search.png`)**:
   - **Video Result Card (`VIDEO` badge)**:
     - Left column: Dark 16:9 thumbnail preview container with central translucent play button icon overlay and bottom-right mono duration timestamp badge (`mm:ss`).
     - Right column:
       - Top row: Course tech icon (Next.js, React, Node.js, JavaScript, TypeScript, Docker, or course cover image) + Course title + `VIDEO` pill badge (orange border/text).
       - Middle: Bold title + concise description/reason.
       - Bottom metadata row: File icon + `Lesson X.Y` · Folder icon + Module Title on left, `▶ Watch from mm:ss >` action on right linking to `/lessons/[slug]?start=[startSeconds]`.
   - **Lesson Result Card (`LESSON` badge)**:
     - Left column: Light neutral container with course/document icon, bulleted key points (`• Point 1`), and bottom-right checkmark circle icon.
     - Right column:
       - Top row: Course tech icon + Course title + `LESSON` pill badge (indigo/slate badge).
       - Middle: Bold title + concise summary.
       - Bottom metadata row: `Module X` label on left, `View lesson ↗ >` action on right linking to `/lessons/[slug]`.
3. **Sort Control**:
   - Interactive dropdown matching the reference design: `Most Relevant ⌵` (options: `Most Relevant`, `Newest`, `Duration`).
   - Selecting a sort option re-fetches or sorts results accordingly and updates the URL param.
4. **Bottom Catalog CTA Banner**:
   - Renders the card: `Can't find what you're looking for? / Try different keywords or browse our full course catalog.` with a `Browse all courses →` button linking to `/courses`.
5. **Fallback & Cold-Start Resilience**:
   - If the LLM/MCP is cold or offline, the search route's fallback token GROQ search returns both matched lessons and video timestamped moments, ensuring instant and reliable results.
6. **Mobile Adaptability**:
   - On mobile screens (`< 768px`), horizontal result cards gracefully stack vertically (thumbnail/key-points box full width on top, content below) with clean touch targets.

## Files to touch

**Web**

- `app/search/page.tsx` *(new)* — Next.js App Router search page. Reads initial search params (`q`, `sort`), renders `Navbar`, `Suspense` boundary, and the search view container with SEO metadata.
- `components/search/search-view.tsx` *(new, client component)* — Main search view controller handling query state, API fetch to `/api/search`, sort changes, keyboard shortcut listener (`⌘K` / `Ctrl+K`), loading skeletons, and rendering result cards.
- `components/search/search-header.tsx` *(new)* — `SEARCH RESULTS` pill badge, `Results for “<query>”` serif heading with orange highlight, count subtitle, and large search input with `⌘K`.
- `components/search/search-controls.tsx` *(new)* — Result count text (`28 results`) and sort dropdown menu (`Most Relevant`, `Newest`, `Duration`).
- `components/search/video-result-card.tsx` *(new)* — Exact replica of the video result card in `vertex-search.png`.
- `components/search/lesson-result-card.tsx` *(new)* — Exact replica of the lesson result card in `vertex-search.png`.
- `components/search/search-catalog-cta.tsx` *(new)* — `Can't find what you're looking for?` banner with link to `/courses`.
- `components/search/search-skeleton.tsx` *(new)* — Polished loading skeletons for cards during fetch.
- `components/search/course-icons.tsx` *(new)* — Reusable tech/course brand icon resolver (Next.js, React, Node.js, JavaScript, TypeScript, Docker, Python, etc.) matching the design icons.
- `components/ui/search-input.tsx` *(modify)* — Support Enter key submission to `/search?q=...` or custom `onSubmit`/`onSearch`.
- `app/page.tsx` *(modify)* — Connect the homepage search bar to navigate to `/search?q=...` on submit.

## Requirements

1. **Pixel-accurate desktop reproduction**:
   - Layout, typography (`font-serif` for heading, clean sans for UI), colors (`#FAF8F5` background, `#EBE4DC` borders, `#FF5500` brand orange), spacing, badges, icons, and card proportions match `vertex-search.png`.
2. **Real Data Wiring**:
   - Connected to `/api/search` with Sanity-grounded lesson and video results.
   - Clicking `Watch from mm:ss` navigates to `/lessons/[slug]?start=[startSeconds]` and resumes at that exact timestamp.
   - Clicking `View lesson` navigates to `/lessons/[slug]`.
3. **Interactive Features**:
   - Live query input with debounce / form submission.
   - `⌘K` / `Ctrl+K` focuses the search bar anywhere on the page.
   - Sort dropdown changes sorting dynamically (`relevance`, `newest`, `duration`).
4. **Empty State & Catalog CTA**:
   - When no results match a query, display a clear, helpful message with suggested topics and the catalog CTA banner.
5. **Responsive**:
   - Responsive down to mobile screens (stacking card columns neatly while maintaining desktop fidelity).

## Security considerations

- Private Sanity token remains strictly server-side in `sanity/lib/token.ts` and `app/api/search/route.ts`.
- Client communicates only with `/api/search` using public query parameters.
- User input is sanitized and validated via `SearchRequestSchema` (Zod).
- No ungrounded model text is rendered as HTML or unescaped markdown.

## Acceptance criteria

1. Navigating to `/search?q=data+fetching` displays the header `Results for “data fetching”`, the count summary, and ranked video and lesson cards matching `vertex-search.png`.
2. Video cards display the video thumbnail, play icon, timestamp duration, course icon + title, `VIDEO` badge, title, description, `Lesson X.Y · Module Title`, and `Watch from mm:ss >` action linking to `/lessons/[slug]?start=[seconds]`.
3. Lesson cards display key points box, course icon + title, `LESSON` badge, title, summary, `Module X`, and `View lesson ↗ >` action linking to `/lessons/[slug]`.
4. Sort dropdown allows switching between `Most Relevant`, `Newest`, and `Duration`.
5. Empty query or ungrounded search displays the bottom catalog CTA banner and friendly fallback advice.
6. TypeScript check (`npm run typecheck` or `npx tsc --noEmit`) and ESLint (`npm run lint`) pass with 0 errors.

## Checks to run

- `npm run typecheck` in root web workspace
- `npm run lint` in root web workspace
- `npm run build` in root web workspace

## Exact manual test steps

1. Navigate to `/search?q=data+fetching` in the browser.
2. Verify visual appearance against `design/vertex-search.png`:
   - `SEARCH RESULTS` badge
   - `Results for “data fetching”` heading
   - Result count and sort dropdown
   - Video result cards with thumbnail, play button, and `Watch from mm:ss`
   - Lesson result cards with key points and `View lesson`
   - Bottom `Can't find what you're looking for?` banner
3. Test search interactions:
   - Type a new search term (e.g. `caching`, `react`, `docker`) and press Enter.
   - Change sort from "Most Relevant" to "Duration" or "Newest" and observe result order update.
   - Click `Watch from mm:ss` on a video card and verify navigation to `/lessons/[slug]?start=[seconds]` with video player queued at that second.
   - Click `Browse all courses →` and verify navigation to `/courses`.
