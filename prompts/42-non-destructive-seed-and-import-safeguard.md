# Implementation Prompt: Non-Destructive Seeding & Additive Import Safeguards

## Goal

Ensure that adding new courses, modules, or lessons in the future is strictly **non-destructive** and **additive**, guaranteeing that existing courses, lessons, user progress, and metadata are never deleted or lost.

## Skills and Docs Read

- `AGENTS.md` (Sections 1, 2, 4, 5 Structure, 7 Decisions, 8 Data Model, 13 Checks).
- `sanity-best-practices` (`references/schema.md`, `references/groq.md`).

## Code Inspected

- `studio/scripts/seed/generate-seed.mjs` (Replaced the file wholesale rather than merging).
- `studio/scripts/seed/http-import.mjs` (Contained legacy cleanup deletion logic).
- `studio/scripts/seed/import-seed.mjs` & `studio/scripts/seed/merge-and-sync.mjs`.
- `studio/scripts/seed/build-ndjson.mjs`.
- `studio/package.json` (`seed:import` script).
- `studio/scripts/seed/README.md`.

## Decisions and Assumptions

1. **Zero-Deletion & Field-Preserving Policy**:
   - All dataset import tools, scripts, and commands in the codebase must strictly perform additive imports using `createIfNotExists` and field-level `patch` mutations rather than wholesale `createOrReplace` (which would overwrite unmentioned fields on existing documents).
   - Any logic that queries existing documents and issues `delete` mutations is permanently eliminated.
2. **Persistent Merge-on-Write**:
   - `generate-seed.mjs` (and any future generation/seeding script) must read existing documents from `seed.ndjson` first, index them by `_id`, merge incoming documents, and write back the consolidated dataset. Existing documents on disk are never purged.
3. **Dedicated `safe-import.mjs` & npm script**:
   - Standardize `npm run seed:import` to run `node scripts/seed/safe-import.mjs`, which performs safe batched `createIfNotExists` and field-level `patch` mutations via the Sanity API, confirms that 0 deletions occurred, preserves existing document fields absent from seed payloads, and verifies document counts.
4. **Permanent Guidelines in `README.md`**:
   - Update `studio/scripts/seed/README.md` with explicit instructions on how to add new courses incrementally without overwriting past data.

## Files to Touch / Create

```text
studio/scripts/seed/generate-seed.mjs      [MODIFY] Load existing seed.ndjson before writing; merge incoming documents by _id
studio/scripts/seed/http-import.mjs        [DELETE] Remove script containing legacy deletion logic
studio/scripts/seed/safe-import.mjs        [NEW] Safe additive upsert script with zero deletion capability
studio/package.json                       [MODIFY] Point seed:import to safe-import.mjs
studio/scripts/seed/README.md             [MODIFY] Document additive import workflow and safeguards
```

## Security Considerations

- API mutations use server-side tokens only.
- Safeguards prevent accidental bulk deletions of production data.

## Acceptance Criteria

1. No code or script in the repository contains `delete` mutations for dataset sync or seed operations.
2. `generate-seed.mjs` reads existing `seed.ndjson` and merges by `_id`, preserving all existing records.
3. `npm run seed:import` successfully upserts documents into Sanity `production` without dropping existing courses.
4. Live Sanity document count remains intact with all 20 courses and 240 lessons.
5. `npm run seed:build` in `studio/` passes with 0 errors.

## Checks to Run

```bash
cd f:\Nextjs\vertex\studio
npm run seed:build
npm run seed:import
```

## Manual Test Steps

1. Run `npm run seed:build` in `studio/` to verify reference graph integrity.
2. Run `npm run seed:import` in `studio/` to verify safe additive upsert.
3. Confirm Sanity dataset counts (`courses: 20`, `lessons: 240`) remain completely preserved.
