# Implementation Prompt: Batch Review Fixes - Asset Ingestion, Design System Tokens, and Hero Fallback

## Goal

Resolve verified, still-valid review findings across `upload-assets.mjs`, `app/design-system/page.tsx`, and `components/course/course-hero.tsx`:
1. **`studio/scripts/seed/upload-assets.mjs`**:
   - Environment parsing: Load and require `SANITY_API_WRITE_TOKEN` (from `process.env` or `.env.local`), preventing `SANITY_API_READ_TOKEN` from overriding `token`. Exit with code 1 if missing.
   - Response validation: Validate `coursesRes.ok` and `instructorsRes.ok`, throwing an Error on failure rather than defaulting to empty arrays and reporting success.
   - Concurrency & revisions: Project `_rev` in GROQ queries and apply `ifRevisionID: doc._rev` on patches. Handle HTTP 409 Conflict responses gracefully by logging a warning/skipping so concurrent edits are not clobbered.
2. **`app/design-system/page.tsx`**:
   - Update interactive controls in the design-system showcase to match `lib/design-tokens.ts`:
     - Buttons: `h-[44px]` and `rounded-[12px]`.
     - Inputs / Selects: `h-[44px]` and `rounded-[12px]`.
     - Input focus: `focus-within:border-[#FB923C] focus-within:ring-[#FB923C]`.
3. **`components/course/course-hero.tsx`**:
   - Implement `onError` image fallback in `CourseHero` so that failed or broken Sanity CDN image loads fall back to the deterministic Picsum URL or placeholder cover.
4. **Skip Invalid / Already Resolved Findings**:
   - Skip finding 6 (`my-learning-dashboard.tsx` `userId` memo dependency): Already implemented in prompt 47.
   - Skip finding 7 (`notifications.ts` `PROGRESS_EVENT_NAME` subscription): Already implemented in prompt 48.
   - Skip finding 8 (`progress.ts` anonymous writes prohibition): Already implemented in prompt 49.
   - Skip finding 9 (`prompts/40-seed-sample-content-sanity.md` baseline invariants): Already verified and enforced in prompt 50.

---

## Skills and Docs Read

- `AGENTS.md` (Section 2 How to work, Section 3 UI work, Section 8 Data model, Section 13 Checks).
- `studio/scripts/seed/upload-assets.mjs`.
- `app/design-system/page.tsx`.
- `lib/design-tokens.ts`.
- `components/course/course-hero.tsx`.

---

## Code Inspected

- `studio/scripts/seed/upload-assets.mjs`:
  - Lines 9-21: Reads `SANITY_API_READ_TOKEN` and can overwrite `token`; no check for `process.env` write token or exit on missing token.
  - Lines 64 & 126: Queries omit `_rev`.
  - Lines 65-71 & 127-133: Omit checking `.ok`, defaulting silently to `[]`.
  - Lines 87-121 & 148-180: Patches omit `ifRevisionID` and do not detect 409 Conflict.
- `app/design-system/page.tsx`:
  - Lines 400-510: Showcase buttons use `h-[38px]` and `rounded-[8px]`.
  - Lines 533 & 545: Search input and select use `h-[42px]`, `rounded-[10px]`, and `#F97316`.
- `components/course/course-hero.tsx`:
  - Line 129: `<Image src={imageUrl} ... />` has no `onError` fallback handling.

---

## Decisions and Assumptions

1. **`upload-assets.mjs`**:
   - Follow established pattern from `safe-import.mjs` and `test-asset.mjs` for write token loading and validation.
   - Throw on `!coursesRes.ok` or `!instructorsRes.ok` with status and body.
   - Include `_rev` in `coursesQuery` and `instructorsQuery`.
   - Pass `ifRevisionID: course._rev` / `ifRevisionID: inst._rev` in patch operations. If `patchRes.status === 409`, log conflict warning and skip.
2. **`design-system/page.tsx`**:
   - Align button heights and radiuses with `button.height` (44) and `button.borderRadius` (12) from `lib/design-tokens.ts`.
   - Align inputs with `input.height` (44), `input.borderRadius` (12), and `input.focusColor` (`#FB923C`).
3. **`course-hero.tsx`**:
   - Use React state `currentSrc` initialized to `imageUrl || fallbackUrl`.
   - On `<Image onError={...}>`, if `currentSrc !== fallbackUrl && fallbackUrl`, switch to `fallbackUrl`.

---

## Files to Create or Change

```text
studio/scripts/seed/upload-assets.mjs    [MODIFY] Fix token parsing, query .ok checks, _rev projections & 409 handling
app/design-system/page.tsx              [MODIFY] Align showcase controls with lib/design-tokens.ts (44px, 12px, #FB923C)
components/course/course-hero.tsx       [MODIFY] Add Image onError fallback to Picsum source
```

---

## Requirements

1. Token parsing in `upload-assets.mjs` must require `SANITY_API_WRITE_TOKEN` and fail if missing.
2. Query flows in `upload-assets.mjs` must validate `.ok` and include `_rev`.
3. Patch operations in `upload-assets.mjs` must supply `ifRevisionID` and handle 409 Conflict.
4. Design system showcase controls must use 44px height, 12px radius, and `#FB923C` focus color.
5. `CourseHero` must gracefully fall back to Picsum image on Sanity image load error.
6. All checks (`node -c`, `npx tsc --noEmit`) must pass with code 0.

---

## Security Considerations

- Enforcing `ifRevisionID` prevents lost updates during concurrent Studio or script operations.
- Requiring `SANITY_API_WRITE_TOKEN` ensures authenticated mutation access before initiating network asset transfers.

---

## Acceptance Criteria

1. `upload-assets.mjs` fails early without write token and validates queries and revisions.
2. Design system page controls reflect 44px height and 12px radius.
3. `CourseHero` switches to fallback URL upon image error.
4. `npx tsc --noEmit` and `node -c` pass without errors.

---

## Checks to Run

- `node -c studio/scripts/seed/upload-assets.mjs`
- `node studio/scripts/seed/upload-assets.mjs` (verify early failure without token)
- `npx tsc --noEmit`

---

## Exact Manual Test Steps

1. Inspect `studio/scripts/seed/upload-assets.mjs` to verify token validation, `_rev` query fields, `.ok` checks, and `ifRevisionID` on patch mutations.
2. Inspect `app/design-system/page.tsx` around lines 400-550 to verify `h-[44px]`, `rounded-[12px]`, and `#FB923C` on controls.
3. Inspect `components/course/course-hero.tsx` to verify `onError` fallback handling.
4. Run `node studio/scripts/seed/upload-assets.mjs` to verify it fails if `SANITY_API_WRITE_TOKEN` is missing.
5. Run `npx tsc --noEmit` from workspace root.
