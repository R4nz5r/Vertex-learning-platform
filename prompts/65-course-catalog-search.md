# Implementation Prompt 65: Course Catalog Search on Courses Page

## Goal
Implement a fast, responsive, and beautifully integrated course search and filter experience on the `/courses` (All Courses) page. Learners will be able to filter courses in real time by title, description/summary, and skill level, view live result counts, clear queries with one click, and see helpful empty states that link to global AI video search when needed.

## Skills Read
- `AGENTS.md` (Server/client component boundaries, design system adherence, search requirements)
- `node_modules/next/dist/docs/` (Server Component data fetching with Client Component interactivity)

## Code Inspected
- `app/courses/page.tsx`: Server component fetching `getCourses()`. Renders header, breadcrumbs, catalog analytics, and course cards grid.
- `components/ui/search-input.tsx`: Vertex search input with search icon, focus styling, and shortcut indicator.
- `components/cards/course-card.tsx`: CourseCard component rendering card metadata, icon, duration, and module count.
- `lib/format.ts`: `formatDurationHoursMinutes` helper.

## Decisions and Assumptions
- Preserve Server Component architecture for `app/courses/page.tsx`: keeps initial SSR data fetching, metadata generation, and SEO optimal.
- Extract the search bar, filter controls, and dynamic grid into a dedicated client component: `components/course/course-search-catalog.tsx`.
- Real-time search: filters courses client-side against `title`, `summary`, `level`, and `slug` with debounce/immediate feedback.
- Level filter pills: provide quick toggles for "All", "Beginner", "Intermediate", and "Advanced" alongside the search input.
- Result count feedback: display dynamic count (e.g. "Showing 3 of 22 courses" or "22 courses available").
- Clear affordance: show an accessible clear (`✕`) button inside the search bar whenever a query exists.
- Empty state: display a clean Vertex-styled empty state card when no courses match, offering a "Clear search" button and a prompt to search video transcripts at `/search?q=...`.
- Styling: follow Vertex design tokens (warm off-white `#FAF7F2`, `#EBE4DC` borders, `#C24F1A` / `#FB923C` primary accents, 44px input height, 12px radii).

## Files Expected to Touch
- `components/course/course-search-catalog.tsx` [NEW]
- `app/courses/page.tsx` [MODIFY]

## Requirements
1. Build `CourseSearchCatalog` component:
   - Search input supporting live query changes, clear button, and Enter key handling.
   - Level filter buttons ("All", "Beginner", "Intermediate", "Advanced").
   - Course count indicator.
   - Filtered grid rendering using existing `CourseCard` components.
   - Polished empty state with "Clear Search" and link to global intelligent search.
2. Update `app/courses/page.tsx`:
   - Replace static `.map` grid with `<CourseSearchCatalog courses={courses} />`.
   - Maintain breadcrumbs, header, catalog analytics, and bottom stepped gradient graphic.
3. Ensure responsiveness across mobile, tablet, and desktop layouts.

## Security Considerations
- Pure client presentation component filtering public catalog data.
- No tokens or sensitive attributes exposed.

## Acceptance Criteria
- Search input is visible on `/courses`.
- Typing "Ruby" immediately filters the view to the Ruby on Rails course.
- Typing "OOP" immediately filters to the Object-Oriented Programming course.
- Level filter buttons accurately filter courses by level.
- Clearing the search or clicking "All" restores the full 22 courses.
- No matching results displays the empty state with reset button.
- `npx tsc --noEmit` passes with 0 errors.

## Checks to Run
- `npx tsc --noEmit`
- Next.js build / typecheck verification

## Exact Manual Test Steps
1. Navigate to `http://localhost:3000/courses`.
2. Verify search input and level filter pills appear below the page header.
3. Type "Ruby" in the input; verify only the "Ruby on Rails Modern Web Development" course is displayed and count shows "Showing 1 of 22 courses".
4. Click the "✕" clear button; verify all 22 courses are restored.
5. Click the "Advanced" level pill; verify only advanced courses are shown.
6. Type "NonExistentCourseXYZ"; verify the empty state appears with "Clear search" button.
