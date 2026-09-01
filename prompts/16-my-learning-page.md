# Implementation Prompt: My Learning Page

## Goal

Implement the **My Learning** page (`/my-learning`) for Vertex, providing learners with a dedicated personal dashboard to view their in-progress courses, track lesson completion, resume video playback where they left off, and discover recommended courses. The page will integrate with Clerk authentication (rendering authenticated learner progress for signed-in users and a clean sign-in call-to-action for guests), read course and lesson data from Sanity, adhere strictly to Vertex design system aesthetics (warm neutral backgrounds, terracotta accents, typography, cards, and bottom stepped graphic), and maintain full responsiveness across desktop, tablet, and mobile devices.

---

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 3 UI work, 5 structure, 6 stack, 7 decisions, 8 data model, 12 things that will trip you up, 13 checks).
- `clerk` skill (`.agents/skills/clerk/SKILL.md`)
- `clerk-nextjs-patterns` skill (`.agents/skills/clerk-nextjs-patterns/SKILL.md`)
- `sanity-best-practices` skill (`.agents/skills/sanity-best-practices/SKILL.md`)

---

## Code inspected

- `app/layout.tsx` — Root layout with `<ClerkProvider>` and custom fonts (`Playfair_Display`, `Inter`).
- `app/page.tsx` & `app/courses/page.tsx` — Design token references, 1440px framed layout structure, custom brand icons (Next.js, Docker, TypeScript), and `BottomSteppedGraphic`.
- `components/nav/navbar.tsx` — Main navbar with `links` prop, Clerk `<Show when="signed-out">` / `<Show when="signed-in">`, and `<UserButton />`.
- `components/cards/course-card.tsx` — Course card UI component with metadata chips, level, duration, module count, and PostHog click capture.
- `components/ui/progress-bar.tsx` — Progress bar component with ARIA attributes and custom label support.
- `components/ui/status-indicator.tsx` — Status indicator component for "in-progress", "completed", "now-playing", and "locked".
- `sanity/lib/fetchers.ts` & `sanity/lib/queries.ts` — Sanity data fetching layer and GROQ queries for courses and lessons.

---

## Decisions and assumptions

1. **Route & Layout Architecture**:
   - Create `app/my-learning/page.tsx` as a Server Component rendering within the 1440px framed container (`#FAF7F2` background, `#EBE4DC` borders).
   - Update navbar links across pages so `My Learning` is set to `active: true` when visiting `/my-learning`.
   - Provide breadcrumb navigation: `Home` → `My Learning`.

2. **Authentication & User State (Clerk)**:
   - Use `await auth()` from `@clerk/nextjs/server` to determine whether the user is signed in.
   - **Signed-in user**: Render personalized stats summary (e.g. In Progress, Completed Lessons, Hours Learned), an active "Resume Learning" hero highlight card for quick 1-click continuation, an "In Progress" courses grid with real progress bars and lesson counters, and a "Recommended for You" / catalog discovery section.
   - **Signed-out visitor**: Render an inviting guest state with a clear value proposition ("Track your progress and resume where you left off"), a "Sign in with Clerk" / "Create Account" CTA modal trigger, and a showcase of available courses ready to start.

3. **Data Fetching & Progress Display**:
   - Per `AGENTS.md` section 7: *"Some surfaces are presentational only, with no backend of their own: the My Learning page... My Learning may read existing progress for display."*
   - Fetch Sanity courses with module and lesson details via `getCourses()`.
   - For signed-in users, derive initial representative course progress (e.g., active courses with progress percentages, current module & lesson indicators, and direct links to resume lessons) so learners immediately see a rich, interactive dashboard.

4. **Visual Design & Components**:
   - Hero banner: "MY LEARNING" badge (`#FFF6F0`, `#C24F1A` text, `#FCDCC9` border), header title "My Learning Dashboard", and motivating subtitle.
   - Stats row: 3 quick stat cards (In Progress Courses, Completed Lessons, Learning Hours).
   - "Resume Playing" banner card: Displays the active course, current lesson title, elapsed time / progress bar, and an orange "Resume Lesson →" button.
   - Course progress grid: Course cards enhanced with status badges (`StatusIndicator` or `ProgressBar`), progress completion text (`e.g., 3 of 8 lessons complete · 38%`), and "Continue →" action.
   - Empty/Discovery state: Encouraging empty state CTA pointing to `/courses` when no courses are active.
   - Footer: Reusable `BottomSteppedGraphic` matching the home and course catalog pages.

---

## Files to create or change

```
app/my-learning/page.tsx           [NEW] Main My Learning page with auth state handling, stats, resume banner, and in-progress courses
components/cards/my-learning-card.tsx [NEW] Dedicated learning progress card displaying course thumbnail, module info, progress bar, and resume action
components/nav/navbar.tsx          [MODIFY] Ensure active route detection or correct active link highlighting for /my-learning
```

---

## Requirements

1. **Routing**: Navigating to `/my-learning` or clicking "My Learning" in the top navbar renders the My Learning page.
2. **Auth Integration**: Accurately detects Clerk authentication state on the server.
3. **Signed-in Experience**:
   - Displays user learning summary statistics (Active Courses, Completed Lessons, Time Invested).
   - Displays a prominent "Resume Where You Left Off" card linking directly to the latest lesson.
   - Renders progress cards with custom course icons, completion percentage, progress bar, and lesson links.
   - Displays a "Browse More Courses" section with direct links to the catalog.
4. **Signed-out Experience**:
   - Shows an appealing guest banner prompting the user to sign in to save and track course progress.
   - Includes Clerk `SignInButton` / `SignUpButton` buttons.
   - Displays the course catalog preview so guest users can start exploring immediately.
5. **Aesthetics & Responsiveness**:
   - Matches Vertex design tokens, typography, borders, and warm palette.
   - Fully responsive down to mobile viewports with flexible grid layouts and zero horizontal scrolling.

---

## Security considerations

- Read-only presentation on the client; no secret keys exposed.
- Authentication handled securely via Clerk server-side `auth()`.
- Public browsing remains functional without auth lockouts.

---

## Acceptance criteria

1. Visiting `/my-learning` loads smoothly without any console or hydration errors.
2. Signed-in state renders the learning dashboard with summary stats, resume card, and in-progress course list.
3. Signed-out state presents an intuitive prompt to sign in alongside course catalog discovery.
4. Navbar accurately reflects active status for "My Learning".
5. All buttons and links ("Resume Lesson", "Explore Courses", "View Course") navigate to valid routes.
6. TypeScript check (`npx tsc --noEmit`), ESLint (`npm run lint`), and Next.js production build (`npm run build`) pass cleanly.

---

## Checks to run

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Manual test steps

1. Open `http://localhost:3000/my-learning` as a signed-out visitor:
   - Verify breadcrumb displays `Home / My Learning`.
   - Verify guest callout banner with "Sign in to track progress" CTA.
   - Verify catalog preview is visible below.
2. Sign in via Clerk in the top navbar:
   - Verify the page refreshes to the personalized My Learning dashboard.
   - Verify summary stats (In Progress, Completed Lessons, Learning Hours).
   - Verify "Resume Where You Left Off" card and click "Resume Lesson" to ensure navigation to `/lessons/[slug]`.
   - Verify in-progress course cards display progress bars and lesson counters.
3. Resize browser to tablet and mobile widths (375px, 768px, 1024px, 1440px) to verify responsive grid wrapping and layout harmony.
