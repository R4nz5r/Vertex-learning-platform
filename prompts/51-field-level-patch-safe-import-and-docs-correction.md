# Implementation Prompt: Field-Level Patch Safe Import & Documentation Correction

## Goal

Ensure that importing seed documents into Sanity preserves any existing document fields absent from the incoming seed payloads, and correct misleading documentation regarding `--replace` and `createOrReplace`:
1. **Field-Level Patch Import in `safe-import.mjs`**: Update `studio/scripts/seed/safe-import.mjs` from wholesale `createOrReplace` mutations to field-level patches using `createIfNotExists` followed by `patch: { id, set: fields }`. This ensures any custom or Studio-authored fields on existing documents are preserved rather than wiped out.
2. **Correct Prompt 40 Guidance**: In `prompts/40-seed-sample-content-sanity.md`, replace the `--replace` workflow and safety claim (lines 49, 86-87, and 93) with guidance to use `npm run seed:import` (which uses non-destructive, field-level patching).
3. **Correct Prompt 42 Claims**: In `prompts/42-non-destructive-seed-and-import-safeguard.md` (lines 24-29), clarify that `createOrReplace` replaces whole documents, and update the documented decision to specify field-level patches (`createIfNotExists` and `patch`) to retain existing fields.
4. **Update `studio/scripts/seed/README.md`**: Update line 13 to reflect field-level patch updates.

---

## Skills and Docs Read

- `AGENTS.md` (Section 2 How to work, Section 4 Skills, Section 8 Data Model, Section 13 Checks).
- `sanity-best-practices` (`references/schema.md`, `references/groq.md`).
- `sanity-migration` (`SKILL.md`).
- `prompts/40-seed-sample-content-sanity.md`.
- `prompts/42-non-destructive-seed-and-import-safeguard.md`.

---

## Code Inspected

- `studio/scripts/seed/safe-import.mjs`:
  - Lines 52-53: Currently uses `createOrReplace: doc`, which completely overwrites existing documents in Sanity and erases any fields not present in the seed document.
- `prompts/40-seed-sample-content-sanity.md`:
  - Line 49: Claims deterministic IDs allow "safe, idempotent imports with `--replace`".
  - Lines 86-87 & 93: Instructs running `npx sanity dataset import scripts/seed/seed.ndjson production --replace`.
- `prompts/42-non-destructive-seed-and-import-safeguard.md`:
  - Lines 24-29: Describes `createOrReplace` as an additive strategy that preserves existing content, which conflates preserving other documents with preserving unmentioned fields on existing documents.

---

## Decisions and Assumptions

1. **Field-Level Patch Mutations**:
   - In `safe-import.mjs`, for each document in a batch, separate `_id` and `_type` from the remaining attributes:
     - `const { _id, _type, ...fields } = doc`
     - Generate two coordinated mutations per document:
       1. `{ createIfNotExists: { _id, _type, ...fields } }`: Creates the document with all initial fields if it does not yet exist.
       2. `{ patch: { id: _id, set: fields } }`: Applies field-level updates to the specified fields only.
     - If the document already exists in Sanity, `createIfNotExists` is a no-op, and `patch.set` updates the seed-defined fields while leaving any existing fields absent from the payload intact.
2. **Accurate Importer Guidance**:
   - Replace `--replace` CLI commands in prompt 40 with `npm run seed:import` (which executes `safe-import.mjs`).
   - In prompt 42, explicitly explain that `createOrReplace` overwrites all document fields, whereas field-level patches preserve unmentioned fields.

---

## Files to Create or Change

```text
studio/scripts/seed/safe-import.mjs                        [MODIFY] Use createIfNotExists and patch.set instead of wholesale createOrReplace
studio/scripts/seed/README.md                             [MODIFY] Update safe-import description to reflect field-level patches
prompts/40-seed-sample-content-sanity.md                  [MODIFY] Replace --replace references with safe-import runner guidance
prompts/42-non-destructive-seed-and-import-safeguard.md   [MODIFY] Correct additive claim to specify field-level patches
```

---

## Requirements

1. Existing documents in Sanity must retain fields absent from seed payloads when running `safe-import.mjs`.
2. Do not use wholesale `createOrReplace` for existing document updates.
3. Remove claims that `sanity dataset import ... --replace` or `createOrReplace` preserve existing fields.
4. Keep changes minimal and validate syntax and execution.

---

## Security Considerations

- Prevents accidental loss of user-generated or CMS-authored metadata when syncing seed datasets.
- Mutations continue using authorized server-side tokens only.

---

## Acceptance Criteria

1. `studio/scripts/seed/safe-import.mjs` sends `createIfNotExists` and `patch.set` mutations instead of wholesale `createOrReplace`.
2. `studio/scripts/seed/safe-import.mjs` syntax passes node check.
3. Documentation files accurately guide developers to use `safe-import.mjs` and accurately describe field-level patch behavior.

---

## Checks to Run

- `node -c studio/scripts/seed/safe-import.mjs`
- `npm run seed:build` in `studio/`
- `npx tsc --noEmit`

---

## Exact Manual Test Steps

1. Inspect `studio/scripts/seed/safe-import.mjs` mutation generation logic to confirm `createIfNotExists` and `patch.set` are generated per document.
2. Run `node -c studio/scripts/seed/safe-import.mjs` to verify syntax.
3. Inspect `prompts/40-seed-sample-content-sanity.md` and `prompts/42-non-destructive-seed-and-import-safeguard.md` to confirm `--replace` instructions and inaccurate `createOrReplace` claims have been replaced with field-level patch guidance.
