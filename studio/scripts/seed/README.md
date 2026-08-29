# Vertex Seeding Pipeline

This folder contains the seed dataset and tooling for populating Sanity Studio with courses, modules, lessons, instructors, and categories.

## Files

- **`seed.ndjson`**: The complete NDJSON dataset containing 141 documents (6 categories, 5 instructors, 120 lessons, 10 courses).
- **`videos.json`**: Mappings for lesson videos (YouTube IDs, titles, durations, search queries).
- **`content.mjs`**: Module providing structured programmatic access to the seed documents.
- **`resolve-videos.mjs`**: Helper script to cross-reference and register lesson videos with `videos.json`.
- **`build-ndjson.mjs`**: Validation and compilation script that verifies all document references and formats `seed.ndjson`.

## Usage

### 1. Validate & Format Dataset

From inside the `studio/` directory:

```bash
node scripts/seed/build-ndjson.mjs
```

Or using the npm script:

```bash
npm run seed:build
```

### 2. Import Dataset into Sanity

To import the seed data into your Sanity dataset (e.g. `production`):

```bash
npx sanity dataset import scripts/seed/seed.ndjson production --replace
```

Or using the npm script:

```bash
npm run seed:import
```

> **Note**: The `--replace` flag ensures that documents with matching `_id`s are updated deterministically on each rerun.
