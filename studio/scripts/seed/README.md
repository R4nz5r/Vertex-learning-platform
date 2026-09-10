# Vertex Seeding & Content Ingestion Pipeline

This folder contains the seed dataset and tooling for safely populating and expanding Sanity Studio with courses, modules, lessons, instructors, and categories.

## Guarantees

1. **Strictly Additive / Non-Destructive**: Seeding, generating, or importing new courses will **never delete** previously added courses, lessons, user progress, or categories.
2. **Merge-by-ID**: Documents with new IDs are added; documents with matching IDs are deterministically updated without affecting any other documents.

## Files

- **`seed.ndjson`**: The consolidated NDJSON dataset (contains all current courses, lessons, instructors, and categories).
- **`safe-import.mjs`**: Safe, non-destructive import runner that uses transaction batches with `createIfNotExists` and field-level `patch` updates, ensuring existing documents retain unmentioned fields with zero deletion capability.
- **`generate-seed.mjs`**: Seed generation script that loads existing `seed.ndjson` records and non-destructively merges newly defined courses.
- **`build-ndjson.mjs`**: Validation and compilation script that checks document references, prevents missing relations, and formats `seed.ndjson`.
- **`content.mjs`**: Helper module providing structured programmatic access to local seed documents.

## Usage

### 1. Validate Dataset Integrity

From inside the `studio/` directory:

```bash
npm run seed:build
```

### 2. Safely Import / Sync into Sanity

To safely sync all seed documents into your Sanity dataset without deleting existing content:

```bash
npm run seed:import
```

You can also specify a custom `.ndjson` file to import:

```bash
node scripts/seed/safe-import.mjs path/to/another-dataset.ndjson
```
