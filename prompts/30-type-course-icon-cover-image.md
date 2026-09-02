# Implementation Prompt: Type CourseIconProps coverImage with SanityImageSource

## Goal

Update the `coverImage` prop type in `CourseIconProps` in `components/search/course-icons.tsx` from `unknown` to `Parameters<typeof urlFor>[0] | null | undefined` (or `SanityImageSource | null | undefined`), preserving existing image URL generation behavior and ensuring strict type safety.

---

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 4 skills, 6 tech stack, 13 checks).
- `sanity/lib/image.ts` (`urlFor` definition importing `SanityImageSource` from `@sanity/image-url`).

---

## Code inspected

- `components/search/course-icons.tsx` — `CourseIconProps` uses `coverImage?: unknown;` while line 122 invokes `urlFor(coverImage)`.
- `sanity/lib/image.ts` — `export const urlFor = (source: SanityImageSource) => builder.image(source)`.
- `components/search/video-result-card.tsx` & `components/search/lesson-result-card.tsx` — pass `result.courseCoverImage` to `CourseTechIcon`.

---

## Decisions and assumptions

1. **Type Definition**:
   - Change `coverImage?: unknown;` in `CourseIconProps` to `coverImage?: Parameters<typeof urlFor>[0] | null;`.
   - Maintain the safe try/catch block around `urlFor(coverImage)` to handle potential malformed asset objects gracefully at runtime.
2. **Backwards Compatibility**:
   - Both `undefined` and `null` values are supported seamlessly.

---

## Files to touch

```text
components/search/course-icons.tsx              [MODIFY] Replace unknown with Parameters<typeof urlFor>[0] | null | undefined for coverImage
```

---

## Requirements

1. `CourseIconProps.coverImage` is typed as `Parameters<typeof urlFor>[0] | null | undefined`.
2. TypeScript compilation (`npx tsc --noEmit`) passes with 0 errors.
3. ESLint (`npm run lint`) passes with 0 errors and 0 warnings.
4. Next.js production build (`npm run build`) compiles cleanly.

---

## Security considerations

- No tokens or external APIs involved. Strictly compile-time type safety improvement.

---

## Acceptance criteria

1. `CourseIconProps` has no `unknown` type for `coverImage`.
2. `npx tsc --noEmit` succeeds with 0 errors.
3. `npm run lint` succeeds with 0 errors.
4. `npm run build` succeeds with 0 errors.

---

## Checks to run

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Manual test steps

1. Run `npx tsc --noEmit` and confirm type-checking passes.
2. Open `/search?q=next` and verify course icons render properly without runtime errors.
