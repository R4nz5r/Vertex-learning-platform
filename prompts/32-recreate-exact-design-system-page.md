# Implementation prompt: Recreate Exact Design System Page from Reference Images

## Goal

Pixel-perfectly recreate the `/design-system` showcase page to match the provided 5 reference image panels:
- Each section is structured into distinct white card panels (`bg-white rounded-[16px] border border-[#EBE4DC] shadow-[0_1px_3px_rgba(0,0,0,0.02)]`) placed over the warm cream canvas (`#FAF7F2`) within the 1440px framed layout with the outer diagonal cross-hatch background.
- Accurately render all 14 sections with exact layouts, typography, swatches, tables, bars, button states, inputs, badges, cards, navigation, and principles.

## Skills and docs read

- `AGENTS.md` (sections 1, 2, 3 UI work, 6 Tech stack, 13 Checks to run, 14 When in doubt).
- `prompts/01-design-system.md` (original tokens and specs).

## Reference breakdown (matching the 5 provided images)

1. **Top Row (Header + 01 Colors)**:
   - Single large white card panel (`bg-white rounded-[16px] border border-[#EBE4DC] p-8 lg:p-10`).
   - Left side (~32% width): Vertex Logo (orange chevron + "Vertex" wordmark), `h1` "Design System" in Playfair Display bold, subtitle paragraph, bottom "VERSION 1.0 · MAY 2025" in tracking-widest uppercase.
   - Vertical divider line (`border-r border-[#EBE4DC]`).
   - Right side (~68% width): Section label `01 COLORS`.
     - "Primary": 5 rounded color swatches in a row (Primary 500 `#F97316`, 400 `#FB923C`, 300 `#FDBA74`, 200 `#FED7AA`, 100 `#FFEEE5`) with label and hex below each.
     - "Neutral": 8 rounded color swatches in a row (Neutral 900 `#0F172A`, 700 `#334155`, 500 `#64748B`, 300 `#CBD5E1`, 200 `#E2E8F0`, 100 `#F1F5F9`, 50 `#FAFAFC`, White `#FFFFFF` with border) with label and hex below each.

2. **Row 2 (02 Typography & 03 Type Scale)**:
   - Left card panel (`bg-white rounded-[16px] border border-[#EBE4DC] p-8`):
     - Section label `02 TYPOGRAPHY`
     - Playfair Display showcase: Large serif `Ag`, "Playfair Display" font title, subtitle "Elegant · Readable · Timeless".
     - Inter showcase: Large sans `Ag`, "Inter" font title, subtitle "Clean · Modern · Highly legible".
   - Right card panel (`bg-white rounded-[16px] border border-[#EBE4DC] p-8`):
     - Section label `03 TYPE SCALE`
     - Structured table with columns `Style`, `Font`, `Size / Line Height`, `Weight`, `Use` for Display 1, Display 2, Heading 1, Heading 2, Heading 3, Body Large, Body, Small.

3. **Row 3 (04 Spacing System & 05 Radius & Shadows)**:
   - Left card panel:
     - Section label `04 SPACING SYSTEM`
     - "Base unit: 4px"
     - Visual vertical bar scale (4, 8, 12, 16, 24, 32, 40, 48, 64) with soft peach rounded bars and pixel / rem labels below.
   - Right card panel:
     - Section label `05 RADIUS & SHADOWS`
     - "Radius": 6 boxes for 4px (xs), 8px (sm), 12px (md), 16px (lg), 24px (xl), Full (circle).
     - "Shadows": 4 elevated white boxes with Sm, Md, Lg, Xl box-shadow specs and descriptions.

4. **Row 4 (06 Icons, 07 Buttons, 08 Inputs)**:
   - 3 card panels side-by-side:
     - Left (06 Icons): Outline Style (8 icons), Filled Style (8 icons), and "Icon Specs" bullet list.
     - Middle (07 Buttons): Interactive/visual table with columns Default, Hover, Disabled across Primary, Secondary, Tertiary, Text variants, plus "Button Specs" bullet list.
     - Right (08 Inputs): Search/Text Input with search icon and ⌘K badge, Select dropdown mockup, and "Field Specs" bullet list.

5. **Row 5 (09 Badges/Tags, 10 Status/Indicators, 11 Progress Bar)**:
   - White card panel with 3 columns:
     - 09 BADGES / TAGS: Video (orange), Lesson (indigo/purple), Popular (peach).
     - 10 STATUS / INDICATORS: In Progress, Completed, Now Playing, Locked.
     - 11 PROGRESS BAR: Horizontal progress bar (35% filled) with label "35% complete".

6. **Row 6 (12 Cards)**:
   - White card panel with Section label `12 CARDS`:
     - 4-column layout showing Course Card, Lesson Card (Video), Lesson Card (Lesson), Resource Card.

7. **Row 7 (13 Navigation)**:
   - White card panel with Section label `13 NAVIGATION`:
     - 3-column layout showing Mini Navbar mockup, Breadcrumbs ("All Courses > Next.js for Production > Data Fetching & Caching"), and Pagination (`< [1] 2 3 ... 8 >`).

8. **Row 8 (14 Principles)**:
   - White card panel with Section label `14 PRINCIPLES`:
     - 4-column layout with icon badges in circles: Clarity First (Eye), Consistency (Grid), Focus & Calm (Target), Accessible (CircleUserRound).

## Files to touch

- `app/design-system/page.tsx`
- `components/ui/badge.tsx` (ensure lesson variant matches `#EEF2FF` / text `#4F46E5` / `#6366F1` indigo look as shown in the reference).

## Security considerations

- Static UI presentational page; no auth, no sensitive data.

## Acceptance criteria

- [ ] All sections match the white card panel design on `#FAF7F2` warm background.
- [ ] Section 01 has the left hero text, vertical hairline divider, and 2 rows of swatches.
- [ ] Section 04 Spacing renders vertical peach bars with increasing heights matching the reference.
- [ ] Section 07 Buttons table shows Default, Hover, Disabled states for Primary, Secondary, Tertiary, Text.
- [ ] Section 09 Badges shows Video, Lesson (indigo), and Popular.
- [ ] Section 12 Cards renders all 4 card variants cleanly.
- [ ] Section 13 Navigation & Section 14 Principles match layout and typography.
- [ ] TypeScript check (`npx tsc --noEmit`) passes with 0 errors.
- [ ] Production build (`npm run build`) succeeds.

## Checks to run

```bash
npx tsc --noEmit
npm run build
```

## Manual test steps

1. Navigate to `http://localhost:3000/design-system`.
2. Compare each card panel section (01 to 14) directly with the 5 reference images.
3. Verify the white panels, spacing, font sizes, colors, and layout matches the reference images.
