# Implementation prompt: Fix Responsive Grid and Card Metadata Overflow at 1024px Viewport

## Goal

Fix the layout and metadata text overflow in Section 12 (Cards) and Section 14 (Principles) on tablet and laptop screens (around 1024px width):
1. Change Section 12 and Section 14 grid definitions to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5` so that on 1024px viewports (`lg`), cards render in a 2-column layout with ample width (~420px per card) instead of being squeezed into 4 narrow ~180px columns.
2. In the card metadata footers (e.g., `12 modules`, `Watch from 12:45`, `Intermediate`, `18h 24m`), remove restrictive wrapping constraints and use flexible gap and alignment utilities with `shrink-0` to ensure no text or icons clip outside the cards on any screen size.

## Skills and docs read

- `AGENTS.md` (sections 2 How to work, 3 UI work, 6 Tech stack, 13 Checks to run).

## Code inspected

- `app/design-system/page.tsx` (Section 12 Cards and Section 14 Principles grid layouts).

## Decisions and assumptions

1. **Responsive Breakpoint Enhancement**:
   - `grid-cols-1` on mobile (<640px)
   - `sm:grid-cols-2` on tablet portrait (640px–1023px)
   - `lg:grid-cols-2` on tablet landscape / small desktop (1024px–1279px)
   - `xl:grid-cols-4` on wide desktop (≥1280px)
2. **Card Footer Polish**:
   - Spacing: `gap-2 pt-3.5 border-t border-neutral-100 mt-auto`
   - Course card metadata: `Intermediate`, `18h 24m`, `12 modules` spaced evenly with icons.
   - Video card action: `Lesson 5.1 · 12:45` and `Watch from 12:45` aligned with play icon.

## Files to touch

- `app/design-system/page.tsx`

## Requirements

1. On 1024px width (as tested in dev tools responsive mode), cards in Section 12 must not overflow or push `12 modules` or `Watch from 12:45` outside the card frame.
2. The cards must fit cleanly across mobile, tablet, laptop, and desktop.

## Acceptance criteria

- [ ] At 1024px width, Section 12 cards render without any text overflowing or clipping outside the card borders.
- [ ] At 1440px width, Section 12 displays 4 cards cleanly side-by-side.
- [ ] `npx tsc --noEmit` passes with zero errors.
- [ ] `npm run build` succeeds cleanly.

## Checks to run

```bash
npx tsc --noEmit
npm run build
```

## Manual test steps

1. Navigate to `http://localhost:3000/design-system`.
2. Set browser viewport to 1024px width in DevTools.
3. Scroll to Section 12 (Cards) and verify that `12 modules` and `Watch from 12:45` are completely inside their card containers.
