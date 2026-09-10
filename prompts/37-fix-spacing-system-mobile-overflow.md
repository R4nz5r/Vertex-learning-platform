# Implementation prompt: Fix Section 04 Spacing System Mobile Overflow

## Goal

Fix the horizontal overflow on ultra-compact mobile viewports (320px–375px) caused by Section 04 (Spacing System):
1. Wrap Section 04's vertical bar chart in a smooth horizontal scroll container (`overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0`) with a calibrated minimum width (`min-w-[360px] sm:min-w-0`) so all 9 spacing tokens fit gracefully without stretching or breaking the 320px viewport layout.
2. Add `overflow-hidden` to card panel wrappers across the showcase so no nested elements can cause page-level horizontal scrolling.

## Skills and docs read

- `AGENTS.md` (sections 2 How to work, 3 UI work, 6 Tech stack, 13 Checks to run).

## Code inspected

- `app/design-system/page.tsx` (Section 04 Spacing System bar chart and parent containers).

## Decisions and assumptions

1. **Section 04 Mobile Handling**:
   - In Section 04, the 9 spacing bars (4px to 64px) with `(rem)` labels require ~360px width.
   - On viewports <375px (e.g. 320px), the bar chart will scroll horizontally within its card container cleanly (`overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0`), keeping the card border and main page exactly within 320px.
   - On tablet and desktop (≥640px), the bar chart fills the available width naturally (`sm:min-w-0 flex-1`).
2. **Page & Card Overflow Protection**:
   - Ensure card panels have `overflow-hidden` to prevent child contents from exceeding container bounds.

## Files to touch

- `app/design-system/page.tsx`

## Requirements

1. On a 320px viewport in DevTools, Section 04 and the entire `/design-system` page must fit strictly within 320px width without horizontal page scrolling or broken side borders.
2. All 9 spacing tokens and bars remain accessible and clearly formatted.

## Acceptance criteria

- [ ] On a 320px viewport, the page width stays locked at 320px with zero horizontal body overflow.
- [ ] Section 04 spacing chart scrolls smoothly inside its card on narrow screens and displays full-width on wider screens.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run build` succeeds cleanly.

## Checks to run

```bash
npx tsc --noEmit
npm run build
```

## Manual test steps

1. Navigate to `http://localhost:3000/design-system`.
2. Set DevTools responsive mode to 320px width.
3. Verify that the page fits cleanly with no horizontal scrollbar on the page body.
4. Inspect Section 04 to verify the spacing bars fit cleanly within the card.
