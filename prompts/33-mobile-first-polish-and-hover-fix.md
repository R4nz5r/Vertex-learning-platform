# Implementation prompt: Mobile-First Polish and Button Hover Fix for Design System

## Goal

1. **Mobile-First Approach**: Refactor `/design-system` so that all 14 showcase sections and card panels are structured mobile-first:
   - Stacking cleanly on small screens (320px–640px) with responsive touch-friendly padding, flex-wrapping, and horizontal overflow protection for tables/charts.
   - Progressively enhancing to 2-, 3-, and 4-column layouts on `sm`, `md`, and `lg` breakpoints.
2. **Section 07 Interactive Button Hover States**: Fix the hover states in the Section 07 Buttons matrix and across interactive showcase elements:
   - Add active hover classes (`hover:from-... hover:to-... hover:bg-... hover:border-... hover:shadow-...`) and smooth transitions (`transition-all duration-150`) to Default and Hover row buttons.
   - Ensure visual feedback on mouseover / hover across Primary, Secondary, Tertiary, and Text variants.

## Skills and docs read

- `AGENTS.md` (sections 2 How to work, 3 UI work, 6 Tech stack, 13 Checks to run).
- `prompts/32-recreate-exact-design-system-page.md` (exact design system reference structure).

## Code inspected

- `app/design-system/page.tsx` (Current 14-section showcase page).
- `components/ui/button.tsx` (Button component tokens and variants).

## Decisions and assumptions

1. **Mobile-First Breakpoint Architecture**:
   - Base styles target narrow mobile viewports (e.g. 360px width).
   - Color swatches: `grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:flex lg:flex-wrap`.
   - Type scale & button tables: contained in touch-friendly horizontal scroll containers (`overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0`) with subtle custom scroll indicators.
   - Spacing bar chart: responsive container with flex shrinking/wrapping so all 9 tokens fit without overflowing narrow phone screens.
   - Cards & Principles: 1 column on mobile, 2 columns on `sm`, 4 columns on `lg`.
2. **Section 07 Button Hover Feedback**:
   - **Primary**: Default (`bg-gradient-to-b from-[#E76D42] to-[#D9572B] border border-[#D45428] shadow-sm`) with live hover `hover:from-[#DF6236] hover:to-[#CE4E22] hover:shadow-[0_4px_14px_rgba(225,98,55,0.38)] active:translate-y-px`.
   - **Secondary**: Default (`bg-white border border-[#FCDCC9] text-[#C24F1A]`) with live hover `hover:bg-[#FFF6F0] hover:border-[#EA580C] hover:text-[#A7320C] active:translate-y-px`.
   - **Tertiary**: Default (`bg-white border border-neutral-200 text-neutral-700`) with live hover `hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-900 active:translate-y-px`.
   - **Text**: Default (`text-[#C24F1A]`) with live hover `hover:text-[#9A2C0A] hover:underline active:translate-y-px`.
   - **Hover Row**: Styled with the dedicated hover colorway (`bg-[#B9380E]`, `bg-[#FFF6F0] border-[#F97316]`, `bg-neutral-100 border-neutral-300`, `text-[#9A2C0A]`) with interactive hover brightness/depth cues.

## Files to touch

- `app/design-system/page.tsx`

## Requirements

1. On mobile viewports (e.g. 375px), every card panel stacks without horizontal page scroll or broken layouts.
2. Section 07 buttons in the Default and Hover rows provide clear, interactive visual hover feedback on mouseover.
3. Desktop layout matches the reference images identically.

## Acceptance criteria

- [ ] Page renders smoothly on mobile (320px–768px) and desktop (1024px–1440px+).
- [ ] Hovering over Primary, Secondary, Tertiary, and Text buttons in Section 07 visibly changes background, border, shadow, or color.
- [ ] `npx tsc --noEmit` passes without errors.
- [ ] `npm run build` succeeds cleanly.

## Checks to run

```bash
npx tsc --noEmit
npm run build
```

## Manual test steps

1. Open `http://localhost:3000/design-system`.
2. Resize browser down to 375px width and test scrolling across all 14 sections.
3. Hover mouse over the buttons in Section 07 and observe the active hover transitions and styles.
