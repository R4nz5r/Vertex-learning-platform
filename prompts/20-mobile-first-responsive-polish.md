# Implementation Prompt: Mobile-First Responsive Polish for My Learning Dashboard

## Goal

Apply expert responsive, mobile-first design refinements to the **My Learning** dashboard (`/my-learning`), ensuring flawless visual presentation, tap targets, typography scale, and layout transitions across all screen sizes (mobile 320px–480px, tablets 640px–768px, and desktop 1024px+).

---

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 3 UI work, 7 decisions, 13 checks).

---

## Code inspected

- `components/dashboard/my-learning-dashboard.tsx` — 4-card stats grid, filter tabs, responsive containers.
- `components/cards/my-learning-resume-banner.tsx` — Hero highlight banner and CTA layout.
- `components/cards/my-learning-card.tsx` — Progress card padding and action buttons.
- `app/my-learning/page.tsx` — Page container padding and header hierarchy.

---

## Decisions and assumptions

1. **Mobile-First 4-Card Stats Grid**:
   - Mobile: 2x2 grid (`grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5`).
   - Compact proportional icons (`w-9 h-9 sm:w-11 sm:h-11`) with flexible gutters (`gap-2.5 sm:gap-3.5`) and adaptive card heights (`h-[76px] sm:h-[86px]`).
   - Typography scaling: labels (`text-[9.5px] sm:text-[11px]`) and metrics (`text-[16px] sm:text-[19px] lg:text-[21px]`) to maintain 100% single-line baseline alignment across all mobile viewports down to 320px.
2. **Responsive Filter Tabs**:
   - `w-full sm:w-auto overflow-x-auto` with `flex-1 sm:flex-initial` buttons for comfortable full-width touch distribution on mobile devices.
3. **Hero Resume Banner Mobile Layout**:
   - Mobile-optimized card padding (`p-5 sm:p-7 lg:p-8`), responsive typography, and full-width touch-friendly CTA (`w-full md:w-auto min-h-[44px]`).
4. **Desktop Source of Truth**:
   - Preserve all existing desktop styles and layout dimensions exactly as implemented.

---

## Files to create or change

```text
components/dashboard/my-learning-dashboard.tsx  [MODIFY] Mobile-first stat cards, adaptive font scales, and responsive filter tab container
components/cards/my-learning-resume-banner.tsx  [MODIFY] Responsive padding, text scaling, and full-width mobile CTA
components/cards/my-learning-card.tsx           [MODIFY] Responsive card padding and touch-friendly actions
app/my-learning/page.tsx                       [MODIFY] Mobile-friendly page padding and header scale
```

---

## Requirements

1. Zero horizontal overflow on mobile viewports (320px–480px).
2. Stat cards maintain identical horizontal baselines and heights on mobile 2-column grid and desktop 4-column grid.
3. Filter tabs and buttons have accessibility-compliant touch targets (min 40px–44px).
4. Desktop layout remains pristine and identical.

---

## Acceptance criteria

1. All 4 stat cards render neatly aligned without clipping on mobile (375px/390px/414px) and desktop (1440px).
2. Filter tabs scale fluidly on mobile viewports.
3. TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), and build (`npm run build`) pass cleanly.

---

## Checks to run

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Manual test steps

1. Open `http://localhost:3000/my-learning`.
2. Inspect with browser DevTools in responsive mode at 375px (iPhone SE), 390px (iPhone 14/15), and 768px (iPad).
3. Verify that the 2x2 stat cards maintain identical baselines and alignment.
4. Verify that the filter tabs, resume card, and course cards fit smoothly without side-scrolling.
