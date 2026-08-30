# Implementation prompt: Vertex Course Detail Page

## Goal

Implement the course detail page at `app/courses/[slug]/page.tsx` by reproducing `design/vertex-course.png` with pixel-perfect visual fidelity and responsive behavior, wired to live seeded Sanity content via `getCourseBySlug` and `COURSE_BY_SLUG_QUERY`.

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 3 UI work, 5 structure, 6 stack, 7 decisions, 8 data model, 13 checks, 14 when in doubt).
- `sanity-best-practices` (`~/.claude/skills/sanity-best-practices/SKILL.md`) — GROQ queries, `sanityFetch`, TypeGen, Portable Text, and image asset URLs.
- `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md` and `04-routing/01-defining-routes.md` — App Router dynamic routes (`[slug]`), metadata generation, and `generateStaticParams`.
- `lib/design-tokens.ts` and `app/globals.css` — verified design tokens, type utilities, and colors.

## Code inspected

- `design/vertex-course.png` — visual source of truth for layout, typography, spacing, colors, and states.
- `sanity/lib/queries.ts` — `COURSE_BY_SLUG_QUERY` and `COURSES_QUERY` fetching full course detail, learning outcomes, instructor, category, and modules with dereferenced lessons.
- `sanity/lib/fetchers.ts` — `getCourseBySlug(slug)` and `getCourses()` fetch helpers.
- `sanity/lib/image.ts` — `urlFor` image URL builder for Sanity image assets.
- `components/nav/navbar.tsx` — top navigation component with logo, navigation links, notification bell, and user avatar.
- `components/nav/breadcrumbs.tsx` — breadcrumbs component supporting hierarchical navigation.
- `components/ui/progress-bar.tsx` — progress bar component.
- `components/ui/button.tsx` — button component.
- `app/page.tsx` — homepage structure, background textures, and bottom stepped graphic.

## Decisions and assumptions

1. **Exact match to `design/vertex-course.png`**:
   - **Canvas & Layout**: Framed 1440px container with `#FBF8F5` diagonal pinstripe background, white card canvas with `#EBE4DC` borders.
   - **Header**: Vertex navbar with "Courses" (links to `/courses`) and "My Learning" (links to `/my-learning`), notification bell, and user profile avatar.
   - **Breadcrumbs**: `All Courses` (linking to `/courses`) > `[Course Title]` with chevron separator.
   - **Hero Section**:
     - Left: Prominent square cover image with rounded corners and shadow (displaying Sanity image asset or high-fidelity course mark).
     - Right:
       - "POPULAR" badge pill in warm peach (`#FFF6F0` background, `#FCDCC9` border, `#C24F1A` text) when `course.popular` is true.
       - Course title in bold Playfair Display serif (`font-display`).
       - Marketing summary description in neutral-500.
       - Metadata chip row: Level (e.g. `Intermediate` with BarChart/Signal icon), Duration (e.g. `18h 24m` with Clock icon), Modules count (e.g. `12 modules` with Layers/FileText icon), and Student count (e.g. `2.1k students` with Users icon).
       - Action buttons: "Continue Learning →" (primary warm gradient button with arrow icon, navigating to the first lesson `/lessons/[firstLessonSlug]`) and "Bookmark" (outline button with bookmark icon).
   - **"What you'll learn" Section**:
     - Framed outer container with rounded corners and subtle border.
     - Playfair Display serif title: "What you'll learn".
     - 2x2 grid of outcome cards:
       - Each outcome box has a thin border, rounded corners, terracotta-tinted icon (e.g. `Layers`, `Database`, `Gauge`, `Cloud`, `Code`, `Shield`, `Brain`, `Rocket`, `Workflow`), bold title, and description.
   - **"Course Content" Section**:
     - Section header with "Course Content" serif title and right-aligned summary (`${modules.length} modules • ${formattedDuration}`).
     - Module accordion list:
       - Each module item displays a numbered badge (`1`, `2`, `3`...), module title, module summary, formatted module duration, and expand/collapse chevron.
       - Interactive module expansion revealing lesson items with lesson title, duration, free preview badge, and link to `/lessons/[slug]`.
       - "Show all X modules" / "Show fewer modules" toggle when course has more than 6 modules.
   - **Bottom Progress Bar / Sticky Bar**:
     - Presentational only (no backend progress tracking yet): renders "Your Progress", progress percentage (`0% complete`), styled terracotta progress bar, and "Continue Learning →" button linking to the first lesson (`/lessons/[firstLessonSlug]`).
   - **Bottom Stepped Gradient Graphic**:
     - Luminous warm coral stepped bars decorative graphic matching the Vertex branding.

2. **Data Integration**:
   - `app/courses/[slug]/page.tsx` is an async Server Component calling `getCourseBySlug(params.slug)`.
   - Generates static params for all seeded courses via `generateStaticParams()` using `getCourses()`.
   - If a course is not found, triggers Next.js `notFound()`.
   - Computes total course duration and per-module durations in seconds and formats cleanly (e.g., `18h 24m`, `45m`).
   - Dynamic icon resolver for learning outcomes mapping icon strings (`layers`, `database`, `gauge`, `cloud`, `code`, `shield`, `brain`, `rocket`, `workflow`, etc.) to Lucide icon components.

3. **Routing Links**:
   - `All Courses` breadcrumb links to `/courses`.
   - Lesson items and "Continue Learning" CTAs link to `/lessons/[slug]`.
   - (These routes will 404 until implemented in their own tasks; no placeholder pages will be added).

4. **Responsive Scaling**:
   - Desktop 1440px matches `vertex-course.png` 1:1.
   - On tablet and mobile (< 768px), hero columns stack cleanly (cover image centered on top), learning outcome grid shifts to 1 column, and bottom progress bar stacks appropriately without horizontal overflow.

## Files to create or change

```
app/courses/[slug]/page.tsx          implement course detail page (Server Component)
components/course/module-accordion.tsx implement interactive module accordion (Client Component)
components/course/course-hero.tsx    course hero section with cover image, metadata chips & CTAs
components/course/learning-outcomes.tsx learning outcomes 2x2 grid with terracotta icons
components/course/bottom-progress-bar.tsx sticky/embedded course progress bar with CTA
app/page.tsx                         update course card links to point to /courses/[slug]
```

## Security considerations

- Read-only Server Component fetching from Sanity with read token strictly on the server.
- No client-side tokens, credentials, or API keys exposed to the browser.
- Valid semantic HTML, ARIA attributes, and accessible heading structure.

## Acceptance criteria

1. Visiting `/courses/nextjs-app-router-in-depth` (or any valid course slug) renders the complete course page matching `design/vertex-course.png`.
2. Navbar, breadcrumbs (`All Courses > [Course Title]`), and hero section render with full course metadata from Sanity.
3. "What you'll learn" section renders 2x2 grid with terracotta icons, titles, and descriptions.
4. "Course Content" section lists all modules with module numbers, summaries, durations, and interactive accordions revealing lessons.
5. "Show all modules" expander functions properly when more than 6 modules exist.
6. Bottom progress bar displays progress (0% presentational) and "Continue Learning →" CTA pointing to `/lessons/[firstLessonSlug]`.
7. Bottom stepped gradient bars render cleanly at the bottom of the page container.
8. Unknown course slug triggers Next.js `notFound()`.
9. Responsive on mobile, tablet, and desktop viewports.
10. `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass with zero errors.

## Checks to run

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Manual test steps

1. Run `npm run dev` and open `http://localhost:3000/courses/nextjs-app-router-in-depth`.
2. Verify visual match with `design/vertex-course.png`: navbar, breadcrumbs, hero cover, metadata badges, "What you'll learn" 2x2 grid, "Course Content" module list, and bottom progress bar.
3. Test expanding and collapsing modules in the "Course Content" section.
4. Test navigation from home page (`/`) course cards into course detail pages.
5. Check mobile and tablet viewports for clean responsive stacking.
