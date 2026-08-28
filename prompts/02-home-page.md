# Implementation prompt: Vertex Home Page

## Goal

Implement the Vertex home page at `app/page.tsx` by reproducing `design/vertex-home.png` with pixel-perfection: responsive layout, subtle diagonal background texture, header with navigation, notification bell and user avatar, hero section with "INTELLIGENT LEARNING" pill, Playfair Display display typography, "Explore Courses →" CTA, full-featured search bar, 3-card "All Courses" grid with rich icons and metadata, weekly update banner, and the decorative stepped geometric bars at the bottom.

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 3 UI work, 5 structure, 6 stack, 7 decisions, 13 checks, 14 when in doubt).
- `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md` — font variables (`--font-playfair`, `--font-inter`).
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` — Tailwind v4 CSS utility tokens.
- `lib/design-tokens.ts` and `app/globals.css` — verified design tokens and type utilities.

## Code inspected

- `app/page.tsx` — current empty placeholder returning `null`.
- `app/layout.tsx` — Playfair Display + Inter fonts configured with `--font-playfair` and `--font-inter`.
- `app/globals.css` — Tailwind v4 tokens for colors (`primary-500`, `neutral-900`, `neutral-500`, etc.), type scale utilities (`text-display-1`, `text-heading-1`, etc.), shadows and radii.
- `components/brand/logo.tsx` — Vertex logo SVG component with configurable size and className.
- `components/nav/navbar.tsx` — navbar component; needs extension to support right-side actions (notification bell and user avatar) matching `vertex-home.png`.
- `components/cards/course-card.tsx` — existing course card component; needs support for custom icon/node rendering (e.g. Next.js, Docker whale illustration, TypeScript) and serif title typography matching the reference image.
- `components/ui/button.tsx` — button component with primary, secondary, tertiary, text variants.
- `components/ui/search-input.tsx` — search input with icon and `⌘ K` keyboard shortcut badge.

## Decisions and assumptions

1. **Exact match to `design/vertex-home.png`**:
   - Background has the subtle warm diagonal pinstripe texture on the page canvas.
   - Header has Vertex logo, "Courses" and "My Learning" navigation links, an outline notification bell button, and a circular user profile avatar.
   - Hero section has the "INTELLIGENT LEARNING" badge pill, the 2-line bold serif headline "Search your learning in plain English.", the 2-line descriptive subtitle, the primary "Explore Courses →" button, and the full-width search bar with placeholder "Ask anything about your learning..." and `⌘ K` badge.
   - "All Courses" section with Playfair Display heading, "View all courses →" link, and 3 rich course cards:
     1. "Next.js for Production" (Next.js dark logo, "Build scalable, high-performance web applications with Next.js.", Intermediate, 18h 24m, 12 modules).
     2. "Docker Essentials" (Docker whale illustration, "Containerize applications and streamline your development workflow.", Beginner, 10h 12m, 8 modules).
     3. "TypeScript Deep Dive" (TypeScript blue logo, "Go beyond the basics and write safer, more expressive code.", Intermediate, 14h 36m, 10 modules).
   - Mid-page star divider with "New courses and lessons added every week." flanked by hairline rules.
   - Bottom decorative geometric warm gradient stepped bars illustration.
2. **Component reuse and non-breaking enhancement**:
   - Enhance `components/nav/navbar.tsx` to support notification bell and user avatar with graceful defaults, maintaining backwards compatibility with `/design-system`.
   - Enhance `components/cards/course-card.tsx` to accept an optional custom `icon` element (or fallback to `logoChar`), an optional `href`, and use `font-display` for the title.
3. **Icons & Assets**:
   - Use `lucide-react` for standard UI icons: `Bell`, `Search`, `ArrowRight`, `BarChart2`, `Clock`, `BookOpen` / `FileText`, `Star`.
   - Provide clean, crisp SVGs for Next.js, Docker, and TypeScript logos.
   - User avatar uses a high quality, optimized placeholder/image component with crisp styling.
4. **Responsive design**:
   - Desktop view matches `vertex-home.png` 1:1.
   - Gracefully stacks to single column on mobile/tablet viewports (< 768px) with preserved spacing and typography.

## Files to create or change

```
components/nav/navbar.tsx            enhance with right-side bell icon & user avatar
components/cards/course-card.tsx     enhance to support custom icon node & serif title
app/page.tsx                         implement the complete Vertex home page
app/globals.css                      add subtle striped canvas background utility if needed
```

## Security considerations

- Completely presentational and client-safe.
- No secrets, tokens, or credentials exposed.
- Semantic HTML and valid accessibility attributes throughout.

## Acceptance criteria

1. Visiting `/` renders the complete Vertex home page matching `design/vertex-home.png`.
2. Header shows the Vertex logo, navigation links ("Courses", "My Learning"), notification bell, and user avatar.
3. Hero shows "INTELLIGENT LEARNING" pill, "Search your learning in plain English." headline, subtitle, "Explore Courses →" button, and search input with `⌘ K` badge.
4. "All Courses" section renders the 3 cards with exact logos, titles, descriptions, and metadata chips.
5. Star banner renders with "New courses and lessons added every week.".
6. Bottom decorative warm stepped gradient bars render cleanly.
7. Responsive on mobile, tablet, and desktop without horizontal scroll.
8. `npx tsc --noEmit`, `npm run lint`, and `npm run build` all pass with zero errors.

## Checks to run

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Manual test steps

1. Run `npm run dev` and open `http://localhost:3000`.
2. Verify visual match with `design/vertex-home.png`: header, hero, search bar, 3 course cards, weekly banner, and bottom decorative gradient bars.
3. Verify `/design-system` continues to render properly without regressions.
4. Check responsive scaling by resizing the browser down to 375px mobile viewport.
