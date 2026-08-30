# Implementation prompt: Vertex Lesson Page

## Goal

Implement the lesson page at `app/lessons/[slug]/page.tsx` by reproducing `design/vertex-lesson.png` with pixel-perfect visual fidelity, responsive layout, and interactive video playback directly on the page, wired to seeded Sanity content.

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 3 UI work, 5 structure, 6 stack, 7 decisions, 8 data model, 9 video transcripts/embeds, 11 search/lesson presentation, 12 gotchas, 13 checks, 14 when in doubt).
- `sanity-best-practices` (`~/.claude/skills/sanity-best-practices/SKILL.md`) — GROQ queries, `sanityFetch`, TypeGen, Portable Text, and asset resolution.
- `portable-text-serialization` (`f:\Nextjs\vertex\.agents\skills\portable-text-serialization\SKILL.md`) — `@portabletext/react` components for marks, blocks, lists, and custom types.
- `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md` and `04-routing/01-defining-routes.md` — App Router dynamic routes (`[slug]`), metadata generation, search params, and `generateStaticParams`.
- `lib/design-tokens.ts`, `lib/format.ts`, and `app/globals.css` — typography, colors, borders, and layout tokens.

## Code inspected

- `design/vertex-lesson.png` — visual source of truth for the two-column layout, sidebar navigation, video player, content tabs, overview, key points, pro tip, resources, and bottom navigation.
- `sanity/lib/queries.ts` — `LESSON_BY_SLUG_QUERY` fetching lesson detail, notes (Portable Text), key points, pro tip, resources, and parent course context with modules and dereferenced lessons.
- `sanity/lib/fetchers.ts` — `getLessonBySlug(slug)` and `getCourses()`.
- `studio/schemaTypes/lessonType.ts` — fields: `title`, `slug`, `videoUrl`, `thumbnail`, `duration`, `freePreview`, `studentCount`, `notes`, `keyPoints`, `proTip`, `resources`.
- `studio/scripts/seed/videos.json` & `seed.ndjson` — video URLs format (YouTube, etc.) and seeded lesson structures.
- `components/nav/navbar.tsx` & `components/nav/breadcrumbs.tsx` — navigation header and breadcrumb components.

## Decisions and assumptions

1. **Exact match to `design/vertex-lesson.png`**:
   - **Canvas & Frame**: Framed 1440px container with `#FAF7F2` canvas, subtle repeating diagonal pinstripes, and `#EBE4DC` borders.
   - **Top Navbar**: Vertex header with logo, "Courses" link, "My Learning" link, notification bell, and user avatar.
   - **Two-Column Layout**:
     - **Left Sidebar** (~340px width, `bg-[#FAF7F2]` with `border-r border-[#EBE4DC]`):
       - "← Back to course" link (`text-neutral-600 hover:text-primary-600`) pointing to `/courses/[courseSlug]`.
       - Course Info Card: Course icon/badge (e.g. black rounded square with 'N' or course cover thumbnail), course title, and progress percentage indicator ("35% complete" / progress bar).
       - Module / Lesson Navigation Accordion:
         - Module header (e.g. "Module 5 of 12" with chevron).
         - Completed previous lessons/modules showing circular badges with numbers and terracotta circled checkmark icons.
         - Active module (Module 5) highlighted with solid terracotta number circle (`5`), module title, duration, and expanded chevron.
         - Inside active module:
           - Active lesson item: Terracotta bullet dot, lesson title in bold, "Now playing" in terracotta, and terracotta Play circle icon.
           - Sibling lesson items: Hollow circle bullet, lesson title, duration.
         - Inactive modules listed below (6 to 12) with number circle, module title, duration, and expandable accordion toggle.
         - Mobile & Tablet: Collapsible drawer / sticky toggle so learners can navigate curriculum easily on smaller viewports.
     - **Right Main Content Column**:
       - **Breadcrumbs**: `All Courses > [Course Title] > [Module Title] > [Lesson Title]`.
       - **Pill Badge**: `LESSON 5.1` (warm peach `#FFF1EA`, `#D95A2B` terracotta text, uppercase font-semibold).
       - **Header**:
         - Lesson title in bold Playfair Display serif (`font-display`).
         - Bookmark button in top right (square outline button with bookmark icon).
       - **Summary**: Concise lesson subtitle / summary.
       - **Metadata Row**:
         - Duration with Clock icon (e.g., `1h 28m`).
         - Level with Signal/BarChart icon (e.g., `Intermediate`).
         - Student count with Users icon (e.g., `3,426 students`).
       - **Video Player Embed**:
         - 16:9 responsive embed frame with dark bezel and rounded corners (`rounded-xl`).
         - Embeds YouTube, Vimeo, or Bunny video directly on the site via iframe provider embed.
         - Honors `?start=X` or `?t=X` start seconds parameter to jump straight to exact timestamps.
         - Never redirects learner away to external video platforms.
       - **Tabs**: "Lesson Content" (active with terracotta underline) and "Notes" (presentational tab).
       - **Overview Section**:
         - "Overview" display serif heading.
         - Rich text rendered via `@portabletext/react` with custom styled components for headings, paragraphs, lists, links, and code blocks.
       - **"In this lesson you will:" Checklist**:
         - List of learning items from `lesson.keyPoints` with terracotta circled checkmark icons.
       - **"Pro Tip" Box**:
         - Luminous warm light peach card (`bg-[#FFF7F2] border border-[#FFE6D9] rounded-xl p-5`).
         - Lightbulb icon + bold "Pro Tip" title with tip description from `lesson.proTip`.
       - **"Resources" Section**:
         - "Resources" heading.
         - Grid of resource cards (documentation, guides, GitHub repo) with respective icon (`FileText`, `Github`, `ExternalLink`), title, description, and external link behavior (`target="_blank" rel="noopener noreferrer"`).
       - **Bottom Lesson Navigation**:
         - "← Previous Lesson" (outline button) + Previous lesson title and duration.
         - Next lesson title and duration + "Next Lesson →" (solid terracotta button).
         - Seamlessly navigates across module boundaries.

2. **Data & Server Architecture**:
   - `app/lessons/[slug]/page.tsx` is an async Server Component calling `getLessonBySlug(slug)`.
   - `generateStaticParams()` dynamically queries all lessons from Sanity to pre-render.
   - Derives module index, lesson index (e.g. `5.1`), previous lesson link, and next lesson link by analyzing the parent course's `modules` array.
   - Generates dynamic page metadata.

3. **Analytics Integration (PostHog)**:
   - Server-side event capture for authenticated `lesson_viewed` events.
   - Client-side event tracking for tab changes, resource clicks, and next/prev navigation.

## Files to create or change

```
app/lessons/[slug]/page.tsx                 implement lesson detail page (Server Component)
components/lesson/lesson-sidebar.tsx        left sidebar with module & lesson navigation (Client Component)
components/lesson/lesson-video-player.tsx   16:9 responsive video embed supporting YouTube/Vimeo/Bunny
components/lesson/lesson-content.tsx        overview, key points checklist, pro tip box, and resources grid
components/lesson/lesson-navigation.tsx     previous / next lesson bottom navigation bar
components/lesson/portable-text-renderer.tsx Portable Text custom serializer for lesson notes
lib/video.ts                                video URL parser and embed URL generator with start timestamp
sanity/lib/queries.ts                       ensure LESSON_BY_SLUG_QUERY and ALL_LESSONS_QUERY fetch all required fields
sanity/lib/fetchers.ts                      add getAllLessons helper for static params
```

## Security considerations

- Read-only Server Component using server-side read token.
- No client-side tokens or private keys exposed.
- Iframe video embeds configured with secure sandboxing and standard embed features (`allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"`).
- External resource links include `target="_blank"` and `rel="noopener noreferrer"`.

## Acceptance criteria

1. Navigating to `/lessons/[slug]` (e.g. `/lessons/data-fetching-and-caching` or any seeded lesson) renders the complete lesson page matching `vertex-lesson.png`.
2. The lesson video plays directly on the site within the 16:9 player container.
3. If a start seconds parameter (`?start=120` or `?t=120`) is passed in the URL, playback seeks to that second.
4. The left sidebar shows the course title, "Back to course" link, and interactive module list with active lesson highlighted.
5. Content tabs, Overview, "In this lesson you will" key points, Pro Tip banner, and Resources grid render cleanly.
6. Bottom navigation displays previous and next lessons with durations and allows continuous course progression.
7. Responsive layout adapts cleanly down to mobile with collapsible sidebar.
8. `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass with zero errors.

## Checks to run

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Manual test steps

1. Start dev server `npm run dev`.
2. Navigate to `http://localhost:3000/courses/nextjs-for-production` and click a lesson.
3. Verify `/lessons/[slug]` loads with 1:1 match to `vertex-lesson.png`.
4. Click play on the video embed and verify playback works smoothly on the page.
5. Click "Next Lesson →" and "← Previous Lesson" to navigate through lessons.
6. Click resource links to verify external URLs open properly.
7. Test responsiveness on mobile viewports.
