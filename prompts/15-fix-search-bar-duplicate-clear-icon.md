# Implementation prompt: Fix Search Bar Duplicate Clear (Cross) Icon

## Goal

Remove the duplicate native browser clear/cancel button (`::-webkit-search-cancel-button`) from search inputs across the application so that only one single, styled clear button (`<X />`) is rendered in the search bar.

## Skills and docs read

- `AGENTS.md` — §2 (workflow: prompt, approval, implement, check, report), §3 (UI precision matching reference designs).

## Code inspected

- `components/search/search-header.tsx` — uses `<input type="search" />` with an absolute-positioned React `<X />` button at `right-14`. In WebKit/Blink browsers (Chrome, Edge, Safari), `type="search"` automatically renders a native cancel button (`::-webkit-search-cancel-button`), causing two 'x' (cross) clear icons to appear side by side.
- `components/ui/search-input.tsx` — uses `<input type="search" />`.
- `app/globals.css` — Global stylesheet where `-webkit-search-cancel-button` reset can be globally applied.

## Decisions and assumptions

1. Add a global reset in `app/globals.css` to hide native search cancel and decoration buttons across all WebKit and standard browsers (`input[type="search"]::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; display: none; }`).
2. Add explicit Tailwind utility classes `[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:hidden` to `components/search/search-header.tsx` and `components/ui/search-input.tsx` for robust defense-in-depth.

## Files to touch

- `app/globals.css` — Add global CSS rule to suppress default search cancel buttons.
- `components/search/search-header.tsx` — Add explicit search cancel button suppression classes and adjust clear button positioning.
- `components/ui/search-input.tsx` — Add search cancel button suppression.

## Requirements

1. Only one single clear button appears in the search input when text is typed.
2. Clicking the clear button clears the search query.
3. The keyboard shortcut badge (`⌘ K`) remains cleanly positioned on the right.

## Acceptance criteria

1. Typing a query into the search bar shows exactly one clear ("x") icon.
2. `npx tsc --noEmit` passes with 0 errors.
3. `npm run lint` passes with 0 errors.
4. `npm run build` succeeds cleanly.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Exact manual test steps

1. Navigate to `/search?q=agent` in the browser.
2. Verify the search bar contains only a single clear "x" button and the `⌘ K` badge.
3. Click the "x" button and verify the input text is cleared.
