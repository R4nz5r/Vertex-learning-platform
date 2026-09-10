# Implementation prompt: Align Design System Page Layout, Background, and Styling

## Goal

Align the `/design-system` showcase page layout and background aesthetics with the rest of the application (`/`, `/courses`, `/my-learning`, `/courses/[slug]`, and `/lessons/[slug]`). Specifically:
1. Wrap the page in the outer framed container featuring the fixed diagonal cross-hatch gradient pattern visible on wide screens on the left and right margins.
2. Embed the content inside the centered `max-w-[1440px]` framed container with the warm `#FAF7F2` background, vertical side borders `border-[#EBE4DC]`, and matching hairline section dividers.
3. Align the top Navbar and bottom Footer borders and styling to match the unified platform theme.

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 3 UI work, 6 Tech stack, 13 Checks to run, 14 When in doubt).
- `prompts/01-design-system.md` (original design system tokens and showcase structure).
- `prompts/30-add-design-system-nav-link.md` (navigation integration).

## Code inspected

- `app/page.tsx` (Reference 1440px framed layout, outer cross-hatch background, and warm `#FAF7F2` / `#EBE4DC` styling).
- `app/courses/page.tsx` (Reference page layout with breadcrumbs, navbar, and container styling).
- `app/my-learning/page.tsx` (Reference dashboard container and navbar styling).
- `app/courses/[slug]/page.tsx` (Reference course detail container styling).
- `app/lessons/[slug]/page.tsx` (Reference lesson container styling).
- `app/design-system/page.tsx` (Existing showcase page using full-width `bg-white` without the 1440px framed container and side cross patterns).

## Decisions and assumptions

1. **Outer Frame & Background Texture**:
   The outer wrapper will use `min-h-screen w-full bg-[#FAF7F2]` with the repeating diagonal linear gradient `repeating-linear-gradient(45deg, rgba(230, 220, 210, 0.45) 0, rgba(230, 220, 210, 0.45) 1px, transparent 0, transparent 12px)` with `backgroundAttachment: "fixed"`. This creates the left and right side textured cross pattern on wide/full screens.
2. **Central 1440px Frame**:
   The page content will sit inside `<div className="max-w-[1440px] w-full mx-auto min-h-screen bg-[#FAF7F2] border-x border-[#EBE4DC] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.02)]">`.
3. **Navbar & Divider Alignment**:
   - Update `<Navbar>` in `app/design-system/page.tsx` to use `className="border-b border-[#EBE4DC] px-8 sm:px-12 bg-[#FAF7F2]"`.
   - Update the section `Rule()` divider component in `app/design-system/page.tsx` from `border-neutral-100` to `border-[#EBE4DC]`.
   - Update footer styling to use `border-t border-[#EBE4DC]`.
4. **Preserve Showcase Integrity**:
   Keep all 14 showcase sections intact (01 Colors, 02 Typography, 03 Type Scale, 04 Spacing, 05 Radius & Shadows, 06 Icons, 07 Buttons, 08 Inputs, 09 Badges, 10 Status, 11 Progress Bar, 12 Cards, 13 Navigation, 14 Principles) with all component demonstrations rendered properly on the warm `#FAF7F2` canvas.

## Files to touch

- `app/design-system/page.tsx`

## Requirements

1. `/design-system` must render inside the 1440px centered frame with `border-x border-[#EBE4DC]`.
2. On screens wider than 1440px (or full screen displays), the left and right margins must show the fixed diagonal repeating cross pattern identical to the Home, Courses, and My Learning pages.
3. The background color of the container and navbar must match `#FAF7F2` with warm dividers `#EBE4DC`.
4. All 14 showcase sections, components, tables, and swatches must display without visual defects.

## Security considerations

- Presentational update only; no auth, server secrets, or data mutation involved.

## Acceptance criteria

- [ ] `/design-system` has the outer container with `bg-[#FAF7F2]` and `repeating-linear-gradient` fixed background.
- [ ] `/design-system` is centered in a `max-w-[1440px]` container with `border-x border-[#EBE4DC]` and `bg-[#FAF7F2]`.
- [ ] Navbar and section rules use `border-[#EBE4DC]`.
- [ ] Colors and aesthetics match the rest of the application pages seamlessly.
- [ ] TypeScript type checks (`npm run type-check` or `npx tsc --noEmit`) pass without errors.
- [ ] Production build (`npm run build`) passes cleanly.

## Checks to run

```bash
npm run type-check
npm run build
```

## Manual test steps

1. Open `http://localhost:3000/design-system` in a wide browser window (>1440px).
2. Verify the left and right margins display the subtle diagonal cross-hatch pattern just like `/` and `/courses`.
3. Verify the central 1440px container has the warm `#FAF7F2` background with subtle vertical borders `#EBE4DC`.
4. Verify all 14 design system sections (Colors, Typography, Type Scale, Spacing, Radius & Shadows, Icons, Buttons, Inputs, Badges, Status, Progress, Cards, Navigation, Principles) render clearly with matching divider borders.
