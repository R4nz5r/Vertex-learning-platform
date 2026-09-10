# Implementation Prompt 30: Add Design System Link to Navbar

## Goal
Add direct navigation access to the Design System showcase (`/design-system`) by including a "Design System" link across the top Navbar component and all page navigation headers (`/`, `/courses`, `/courses/[slug]`, `/lessons/[slug]`, `/search`, and `/my-learning`).

---

## Relevant Skills & Guidelines Inspected
- `AGENTS.md` (Rules 2, 4, 7, 13)
- `components/nav/navbar.tsx` (Navbar component and NavLink interface)
- App router pages rendering `<Navbar ... />`:
  - `app/page.tsx`
  - `app/courses/page.tsx`
  - `app/courses/[slug]/page.tsx`
  - `app/lessons/[slug]/page.tsx`
  - `app/search/page.tsx`
  - `app/my-learning/page.tsx`
- `app/design-system/page.tsx` (Showcase page and Section 13 navigation mockup)

---

## Proposed Changes

### 1. `components/nav/navbar.tsx`
- Update `defaultLinks` array to include `{ label: "Design System", href: "/design-system" }`:
```typescript
const defaultLinks: NavLink[] = [
  { label: "Courses", href: "/courses" },
  { label: "My Learning", href: "/my-learning" },
  { label: "Design System", href: "/design-system" },
];
```

### 2. Page Navigation Instances
Update the `links` prop passed to `<Navbar />` across all views:
- **`app/page.tsx`**: Add `{ label: "Design System", href: "/design-system" }`
- **`app/courses/page.tsx`**: Add `{ label: "Design System", href: "/design-system" }`
- **`app/courses/[slug]/page.tsx`**: Add `{ label: "Design System", href: "/design-system" }`
- **`app/lessons/[slug]/page.tsx`**: Add `{ label: "Design System", href: "/design-system" }`
- **`app/search/page.tsx`**: Add `{ label: "Design System", href: "/design-system" }`
- **`app/my-learning/page.tsx`**: Add `{ label: "Design System", href: "/design-system" }`

### 3. `app/design-system/page.tsx`
- Add a top return navigation link or header bar so users who navigate to the Design System page can easily return back to the catalog / home page without typing the URL.

---

## Verification Plan

### Automated Checks
- Run TypeScript type check: `npx tsc --noEmit`
- Run linter: `npm run lint`
- Build check: `npm run build`

### Manual Verification
1. Load `http://localhost:3000/` and verify "Design System" appears in the top navigation bar next to "Courses" and "My Learning".
2. Click "Design System" and verify it navigates cleanly to `/design-system`.
3. Check `/courses`, `/search`, `/my-learning`, `/courses/[slug]`, and `/lessons/[slug]` to confirm the navbar consistently displays the "Design System" link.
4. Verify responsive layout down to mobile viewports to ensure clean wrapping or display.
