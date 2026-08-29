# Implementation prompt: Standalone Studio and Server-Only Tagged Data Layer

## Goal

1. **Move Sanity Studio to a standalone workspace** (`studio/`) alongside the Next.js web application (`web`/root), decoupling Studio builds, auto-updates, schema authoring, and TypeGen from the Next.js App Router, while removing the embedded `/studio` route.
2. **Implement server-only Sanity client and tagged fetch helper**:
   - Server-only client reading the private dataset with `SANITY_API_READ_TOKEN` and protected by `server-only`.
   - Tagged `sanityFetch` helper supporting Next.js ISR/cache revalidation tags and granular TTLs.
   - Update all data fetchers in `sanity/lib/fetchers.ts` with domain-specific cache tags (`course`, `lesson`, `instructor`, `category`, etc.).

## Skills and docs read

- `AGENTS.md` (sections 1, 2, 4, 5 Structure, 6 Tech stack, 7 Decisions, 8 Data model, 12 Gotchas, 13 Checks).
- `sanity-best-practices` (`references/project-structure.md`, `references/nextjs.md`, `references/schema.md`).
- `references/groq.md` (query definition and type safety).

## Code inspected

- `sanity.config.ts`, `sanity.cli.ts` at root.
- `sanity/schemaTypes/` (all 6 schema definitions and index).
- `sanity/structure.ts` (Studio structure).
- `app/studio/[[...tool]]/page.tsx` (embedded studio route).
- `sanity/lib/client.ts`, `sanity/lib/live.ts`, `sanity/lib/queries.ts`, `sanity/lib/fetchers.ts`.
- `package.json`, `.env.example`, `.env.local`.

## Decisions and assumptions

1. **Standalone Studio Workspace (`studio/`)**:
   - Create `studio/` directory with its own `package.json`, `sanity.config.ts`, `sanity.cli.ts`, `tsconfig.json`, `structure.ts`, and `schemaTypes/`.
   - Studio uses `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` (with fallback to default config values).
   - Studio `sanity.cli.ts` points TypeGen output to web root if configured.
   - Remove embedded Studio route (`app/studio/[[...tool]]/page.tsx`) and root `sanity.config.ts`.
2. **Server-Only Data Access & Boundary Protection**:
   - Install `server-only` in the Next.js web workspace.
   - `sanity/lib/client.ts` imports `'server-only'` to guarantee that private dataset access and token handling never leak into client bundles.
   - Server client uses `useCdn: false`, `stega: false`, and `token: process.env.SANITY_API_READ_TOKEN`.
3. **Tagged `sanityFetch` Helper**:
   - Implement `sanityFetch` with signature:
     ```typescript
     export async function sanityFetch<const QueryString extends string>({
       query,
       params = {},
       revalidate = 60,
       tags = [],
     }: {
       query: QueryString
       params?: QueryParams
       revalidate?: number | false
       tags?: string[]
     })
     ```
   - Wire `next: { revalidate: tags.length ? false : revalidate, tags }` into `client.fetch`.
4. **Domain Cache Tagging in Fetchers**:
   - `getCourses()` -> `tags: ['course', 'instructor', 'category']`
   - `getCourseBySlug(slug)` -> `tags: ['course', `course:${slug}`, 'instructor', 'category', 'lesson']`
   - `getLessonBySlug(slug)` -> `tags: ['lesson', `lesson:${slug}`, 'course']`
   - `getInstructors()` -> `tags: ['instructor']`
   - `getInstructorBySlug(slug)` -> `tags: ['instructor', `instructor:${slug}`, 'course']`
   - `getCategories()` -> `tags: ['category']`
   - `getCoursesByCategory(categorySlug)` -> `tags: ['course', `category:${categorySlug}`]`
5. **Clean up Legacy Live Content API**:
   - Remove `sanity/lib/live.ts` since tagged `sanityFetch` replaces `defineLive`.

## Files to create or change

```
studio/package.json                  [NEW] Standalone Studio package configuration
studio/sanity.config.ts              [NEW] Standalone Studio configuration
studio/sanity.cli.ts                 [NEW] Standalone Studio CLI & TypeGen configuration
studio/tsconfig.json                 [NEW] Studio TypeScript configuration
studio/structure.ts                  [NEW] Studio desk structure
studio/schemaTypes/*                 [NEW] Moved schemas into studio/schemaTypes/
studio/.env.example                  [NEW] Studio env vars template
app/studio/                          [DELETE] Remove embedded studio page
sanity.config.ts                     [DELETE] Root sanity config removed (moved to studio/)
sanity/schemaTypes/                  [DELETE] Root schemas moved to studio/
sanity/structure.ts                  [DELETE] Root structure moved to studio/
sanity/lib/live.ts                   [DELETE] Replaced by tagged sanityFetch helper
sanity/lib/client.ts                 [MODIFY] Server-only client + tagged sanityFetch helper
sanity/lib/fetchers.ts               [MODIFY] Add cache tags to all data fetchers
package.json                         [MODIFY] Add server-only dependency
.env.example                         [MODIFY] Update env docs
```

## Security considerations

- Private Sanity dataset read token (`SANITY_API_READ_TOKEN`) stays strictly on the server and is enforced by `import 'server-only'`.
- The browser never receives the read token or calls Sanity directly.
- Standalone Studio runs independently (e.g. `localhost:3333`) and connects via authenticated Sanity user session or CORS-configured origin.

## Acceptance criteria

1. `studio/` exists as a valid standalone Sanity Studio with its own dependencies and configuration.
2. Embedded `/studio` route is completely removed from Next.js.
3. `sanity/lib/client.ts` enforces `import 'server-only'`, uses `SANITY_API_READ_TOKEN`, and exports the tagged `sanityFetch` helper.
4. `sanity/lib/fetchers.ts` exports typed fetchers with domain-specific cache tags.
5. `npx tsc --noEmit` in root passes with zero errors.
6. `npm run lint` in root passes with zero errors.
7. `npm run build` in root passes cleanly.

## Checks to run

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Manual test steps

1. In root, run `npm run build` and verify `/studio` is no longer built as a Next.js route.
2. In `studio/`, run `npm install` and verify `sanity dev` starts on `http://localhost:3333`.
3. In Next.js server components/pages, call `getCourses()` and verify content fetches via `sanityFetch` with tag-based caching.
