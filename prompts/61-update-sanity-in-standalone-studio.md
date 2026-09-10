# Implementation Prompt 61: Update Sanity in Standalone Studio

## Goal
Update Sanity dependencies in the standalone Studio workspace (`studio/`) to their latest compatible versions, resolving peer dependency mismatches with `@sanity/vision` and updating `@sanity/icons`, while ensuring TypeScript compilation, schema definitions, and studio tooling remain fully functional.

## Skills Read
- `AGENTS.md` (Standalone Studio workspace architecture, checks, and independent deploy rules)
- `sanity-best-practices` (`.agents/skills/sanity-best-practices/SKILL.md`)

## Code Inspected
- `studio/package.json`: Contains `sanity` (currently `^6.13.1` following manual install), `@sanity/vision` (`^5.31.2` causing peer dependency warning `peer sanity@"^4.0.0-0 || ^5.0.0-0"`), `@sanity/icons` (`^3.8.0`), and React 19.
- `studio/sanity.config.ts`: Imports `defineConfig`, `structureTool`, and `visionTool`.
- `studio/sanity.cli.ts`: Defines CLI config and typegen paths.
- `studio/tsconfig.json`: TypeScript configuration for Studio.

## Decisions and Assumptions
- Keep Studio strictly standalone and decoupled from the Next.js web application as mandated by `AGENTS.md` Section 5.
- Update `@sanity/vision` to `^6.13.1` to match `sanity` and eliminate the peer dependency warning.
- Retain `@sanity/icons` at `^3.8.0` because v5 removed root named exports (`BookIcon`, `PlayIcon`, etc.), which would break all schema type and desk definitions; v3.8.0 provides full React 19 and Sanity 6 compatibility with clean root named exports.
- Run clean `npm install` in `studio/` to update `package-lock.json`.
- Validate that TypeScript checks (`tsc --noEmit`), studio build (`sanity build`), and seed validation (`seed:build`) all pass.

## Files Expected to Touch
- `studio/package.json`
- `studio/package-lock.json`

## Requirements
1. Update `dependencies` in `studio/package.json`:
   - `"sanity": "^6.13.1"`
   - `"@sanity/vision": "^6.13.1"`
   - `"@sanity/icons": "^5.2.2"`
2. Run `npm install` in `studio/` without peer dependency warnings or overrides.
3. Verify type safety with `npx tsc --noEmit` in `studio/`.
4. Verify Studio build with `npm run build` in `studio/`.
5. Verify seed generation scripts (`npm run seed:build`) continue to operate properly.

## Security Considerations
- Keep Studio credentials and tokens strictly in `.env` / environment variables.
- Standalone Studio workspace continues to be independently deployable.

## Acceptance Criteria
- `studio/package.json` reflects matched v6 versions of `sanity` and `@sanity/vision`.
- `npm install` in `studio/` resolves peer dependencies cleanly.
- `npx tsc --noEmit` in `studio/` exits with code 0.
- `npm --prefix studio run build` succeeds.
- `npm --prefix studio run seed:build` succeeds.

## Checks to Run
- `npm install` in `studio/`
- `npx tsc --noEmit` in `studio/`
- `npm --prefix studio run build`
- `npm --prefix studio run seed:build`

## Exact Manual Test Steps
1. Navigate to `studio/` and run `npm run dev`.
2. Open `http://localhost:3333` in browser.
3. Verify that the Studio desk loads schemas (Course, Lesson, Instructor, Category).
4. Verify that the Vision plugin tab is accessible and queries execute correctly.
