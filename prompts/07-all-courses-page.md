# Implementation prompt: Vertex All Courses Catalog Page

## Goal

Implement the All Courses catalog page at `app/courses/page.tsx` displaying all courses fetched live from Sanity, keeping it simple, clean, and consistent with Vertex design patterns.

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 3 UI work, 5 structure, 6 stack, 7 decisions, 8 data model, 13 checks, 14 when in doubt).
- `sanity-best-practices` (`~/.claude/skills/sanity-best-practices/SKILL.md`) — GROQ queries, `sanityFetch`, TypeGen.
- `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md` and `04-routing/01-defining-routes.md` — App Router static/dynamic pages.

## Code inspected

- `app/page.tsx` — layout, background styling, navbar, and card resolution.
- `sanity/lib/fetchers.ts` — `getCourses()` and `getCategories()`.
- `sanity/lib/queries.ts` — `COURSES_QUERY` and `CATEGORIES_QUERY`.
- `components/cards/course-card.tsx` — course card component.
- `components/nav/navbar.tsx` — navigation header.
- `components/nav/breadcrumbs.tsx` — breadcrumb navigation.
- `lib/format.ts` — duration and student count formatters.

## Decisions and assumptions

1. **Clean & Simple Layout**:
   - **Canvas & Frame**: Framed 1440px container with `#FBF8F5` diagonal pinstripe canvas and `#EBE4DC` borders.
   - **Header**: Vertex navbar with active "Courses" link (`/courses`) and "My Learning" (`/my-learning`), notification bell, and user avatar.
   - **Breadcrumbs**: `Home` (linking to `/`) > `All Courses`.
   - **Page Header**:
     - Headline: "Explore All Courses" in bold Playfair Display serif (`font-display`).
     - Subtitle: "Browse our comprehensive library of courses to level up your engineering and AI skills."
   - **Courses Grid**:
     - Responsive grid (1 column on mobile, 2 columns on tablet, 3 columns on desktop).
     - Renders all courses fetched live from Sanity using `getCourses()`.
     - Each card displays icon/thumbnail, course title, summary description, level, formatted duration, module count, and links to `/courses/[slug]`.
   - **Bottom Stepped Gradient Graphic**: Consistent Vertex luminous peach-coral gradient graphic at the bottom.

2. **Data Integration**:
   - `app/courses/page.tsx` is an async Server Component calling `getCourses()`.
   - Generates metadata (`Explore Courses | Vertex`).

## Files to create or change

```
app/courses/page.tsx                 implement All Courses catalog page
```

## Security considerations

- Read-only Server Component fetching with server-side read token.
- No exposed credentials or client secrets.
- Valid semantic HTML and accessible landmarks.

## Acceptance criteria

1. Visiting `/courses` renders all seeded courses in a 3-column grid.
2. Each course card shows its title, summary, level, duration, and module count, linking to `/courses/[slug]`.
3. Header displays breadcrumbs `Home > All Courses`.
4. Responsive across mobile, tablet, and desktop viewports.
5. `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass with zero errors.

## Checks to run

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Manual test steps

1. Run `npm run dev` and navigate to `http://localhost:3000/courses`.
2. Verify all 10 seeded courses render properly in the grid with accurate metadata.
3. Click on any course card and confirm it navigates to `/courses/[slug]`.
4. Check responsive layout on mobile viewports.
