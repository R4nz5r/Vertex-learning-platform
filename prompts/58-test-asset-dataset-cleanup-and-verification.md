# Implementation Prompt: Test Asset Dataset Config and Ephemeral Cleanup

## Goal

Update `testAssetUpload()` in `studio/scripts/seed/test-asset.mjs` to:
1. Allow targeting a non-production or disposable dataset via environment configuration (`process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'`).
2. Verify `uploadRes.ok` before reporting success.
3. Automatically delete the created test asset document in a `finally` block using Sanity's mutation API (`{ delete: { id: assetId } }`) to prevent test assets from persisting in the dataset.

---

## Skills and Docs Read

- `AGENTS.md` (Section 2 How to work, Section 8 Data Model, Section 13 Checks).
- `studio/scripts/seed/test-asset.mjs`.

---

## Code Inspected

- `studio/scripts/seed/test-asset.mjs`:
  - Line 36: Hardcoded URL `https://0p3a2wia.api.sanity.io/v2024-01-01/assets/images/production?filename=test-image.jpg` uploads test assets directly into the `production` dataset.
  - The returned image asset document is never cleaned up, leaving orphan test assets in the Sanity dataset.
  - While `uploadRes.ok` was previously checked, `finally` cleanup was missing.

---

## Decisions and Assumptions

1. **Configurable Dataset**:
   - Use `const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'` and `const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0p3a2wia'`.
   - Constructs `uploadUrl` dynamically:
     ```javascript
     const uploadUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/assets/images/${dataset}?filename=test-image.jpg`
     ```
2. **Ephemeral Asset Cleanup in `finally` Block**:
   - Track `let assetId = null` in outer scope.
   - When upload succeeds and returns `uploadJson.document?._id`, assign `assetId = uploadJson.document._id`.
   - In a `finally` block, if `assetId` is present, issue a delete mutation to `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`.
   - Gracefully log cleanup success or warn on error without masking upload exceptions.

---

## Files to Create or Change

```text
studio/scripts/seed/test-asset.mjs    [MODIFY] Dynamic dataset config & finally block deletion of created test asset
```

---

## Requirements

1. Allow specifying a non-production dataset via `SANITY_DATASET` / `NEXT_PUBLIC_SANITY_DATASET`.
2. Confirm `uploadRes.ok` is checked before reporting success.
3. Delete the returned asset document in a `finally` block so test data does not persist.
4. Syntax and checks must pass with exit code 0.

---

## Security Considerations

- Prevents littering production Sanity media libraries with transient test image assets from smoke/test scripts.

---

## Acceptance Criteria

1. Dataset in `test-asset.mjs` is configurable and defaults to `production`.
2. `uploadRes.ok` is verified before extracting asset ID and logging success.
3. `finally` block deletes the uploaded asset document from the dataset.
4. `node -c studio/scripts/seed/test-asset.mjs` passes with code 0.
5. `npx tsc --noEmit` passes with code 0.

---

## Checks to Run

- `node -c studio/scripts/seed/test-asset.mjs`
- `npx tsc --noEmit`

---

## Exact Manual Test Steps

1. Inspect `studio/scripts/seed/test-asset.mjs` to verify configurable `dataset` in `uploadUrl`.
2. Inspect the `try ... finally` block in `testAssetUpload` to verify asset deletion mutation on `uploadJson.document?._id`.
3. Run `node -c studio/scripts/seed/test-asset.mjs` to verify syntax.
