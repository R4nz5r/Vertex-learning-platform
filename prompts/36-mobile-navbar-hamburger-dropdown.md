# Implementation prompt: Mobile Navbar Hamburger Menu & Dropdown

## Goal

Add a responsive mobile hamburger toggle and dropdown menu to `components/nav/navbar.tsx`:
- On desktop (`md:` and above, ≥768px): Maintain the existing horizontal navbar layout (`Courses`, `My Learning`, `Design System`, and auth actions).
- On mobile and small screens (`<md`, <768px): Hide the horizontal link list and display a sleek, accessible hamburger toggle button (`Menu` / `X` icons). When opened, render a dropdown menu panel containing the navigation links and actions with warm platform styling.

## Skills and docs read

- `AGENTS.md` (sections 2 How to work, 3 UI work, 6 Tech stack, 13 Checks to run).
- `prompts/02-home-page.md`, `prompts/30-add-design-system-nav-link.md`.

## Code inspected

- `components/nav/navbar.tsx` (Navbar component with static horizontal links and Clerk auth).

## Decisions and assumptions

1. **Client Boundary**:
   - Turn `components/nav/navbar.tsx` into a `"use client"` component (or add client state for dropdown toggle `isOpen`).
2. **Responsive Behavior**:
   - Desktop (`md:flex`): Links shown in horizontal row (`gap-6`). Mobile toggle is hidden (`hidden md:flex`).
   - Mobile (`<md`): Links hidden from the top bar (`hidden md:flex`). Hamburger button displayed on the right (`md:hidden`).
   - Dropdown panel: Opens right below the navbar with smooth animation, containing:
     - Navigation links (`Courses`, `My Learning`, `Design System`) with active indicators.
     - Auth buttons (Sign in / Sign up if logged out) directly accessible.
     - Automatically closes when a link is clicked or when clicking outside / pressing Escape.
3. **Styling & Aesthetics**:
   - Warm background `#FAF7F2` or `#FFFFFF`, border `#EBE4DC`, shadow-lg.
   - Accessible ARIA attributes (`aria-expanded`, `aria-label`, `aria-controls`).

## Files to touch

- `components/nav/navbar.tsx`

## Requirements

1. On mobile viewports (e.g. 320px–640px), the navbar header must never squeeze or overflow horizontally.
2. Tapping the hamburger button opens the dropdown menu with all navigation options.
3. On desktop (≥768px), the navbar remains horizontal as per the desktop design.

## Acceptance criteria

- [ ] Mobile viewports (320px–767px) display logo, notifications/avatar, and a hamburger icon button.
- [ ] Tapping hamburger toggles the mobile dropdown menu with navigation links.
- [ ] Desktop layout (≥768px) remains identical to existing design.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run build` passes.

## Checks to run

```bash
npx tsc --noEmit
npm run build
```

## Manual test steps

1. Navigate to `http://localhost:3000/courses` (and `/design-system`, `/my-learning`, `/`).
2. Resize browser to 320px–480px width.
3. Verify the navbar is clean without text overflow or wrapping.
4. Tap the menu button, verify the dropdown opens smoothly with all links.
5. Tap a link and confirm navigation works properly.
