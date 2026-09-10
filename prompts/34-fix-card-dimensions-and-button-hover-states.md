# Implementation prompt: Fix Section 12 Card Dimensions and Section 07 Button Hover States

## Goal

1. **Fix Section 12 Cards Dimensions & Overflow**:
   - Ensure all 4 cards in Section 12 (Course Card, Lesson Card Video, Lesson Card Lesson, Resource Card) have uniform height (`h-full min-h-[220px]`), ample spacing, and proper responsive flex alignment so that meta text (e.g., `Intermediate`, `18h 24m`, `12 modules`, `Watch from 12:45`) stays cleanly inside the card without wrapping awkwardly, overlapping, or clipping outside the bottom border.
2. **Fix Section 07 Button States**:
   - In Section 07 (Buttons table), ensure the **Default** row displays the fixed default appearance without triggering hover style changes.
   - Ensure the **Hover** row specifically illustrates and activates the hover visual states (darker primary gradient, orange tint secondary, neutral tint tertiary, dark underlined text).
   - Ensure the **Disabled** row displays the disabled state.

## Skills and docs read

- `AGENTS.md` (sections 2 How to work, 3 UI work, 6 Tech stack, 13 Checks to run).

## Code inspected

- `app/design-system/page.tsx` (Section 12 Cards layout and Section 07 Buttons table).

## Decisions and assumptions

1. **Card Layout & Typography Polish (Section 12)**:
   - Use `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch`.
   - Each card shell uses `bg-white rounded-[14px] border border-[#EBE4DC] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between h-full min-h-[220px]`.
   - For Course Card meta row:
     `<div className="flex items-center justify-between text-[11px] text-neutral-400 pt-3 border-t border-neutral-100 mt-auto">`
     `<span className="inline-flex items-center gap-1"><Signal size={12} /> Intermediate</span>`
     `<span className="inline-flex items-center gap-1"><Clock size={12} /> 18h 24m</span>`
     `<span className="inline-flex items-center gap-1"><Layers size={12} /> 12 modules</span>`
     `</div>`
     with `text-[10.5px] sm:text-[11px]` and flex distribution to prevent text wrapping or overflow.
2. **Button State Separation (Section 07)**:
   - **Default row**: Renders default styles statically (`pointer-events-none` or static presentation classes) representing the baseline state.
   - **Hover row**: Renders the hover state styling (`bg-[#B9380E]`, `bg-[#FFF6F0] border-[#F97316] text-[#A7320C]`, `bg-neutral-100 border-neutral-300 text-neutral-900`, `text-[#9A2C0A] underline`) with interactive hover response.
   - **Disabled row**: Renders disabled state with `disabled` attribute and muted palette.

## Files to touch

- `app/design-system/page.tsx`

## Requirements

1. No text or icons in Section 12 cards may overflow or clip outside card borders.
2. Section 07 Default row maintains default styling without triggering hover changes; Hover row showcases the hover states.

## Acceptance criteria

- [ ] All 4 cards in Section 12 render cleanly with equal heights and no overflowing text.
- [ ] Section 07 Default row shows default style without hover alterations; Hover row exhibits hover styles.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run build` passes.

## Checks to run

```bash
npx tsc --noEmit
npm run build
```

## Manual test steps

1. Navigate to `http://localhost:3000/design-system`.
2. Inspect Section 12 (Cards): verify all 4 cards have matching heights and clean bottom meta borders with zero text overflow.
3. Inspect Section 07 (Buttons): verify the Default row displays default button styles and the Hover row displays the hover states.
