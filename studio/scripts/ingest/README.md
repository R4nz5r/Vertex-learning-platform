# Vertex Video Ingestion Pipeline

The offline tooling that creates and maintains `video` documents in Sanity Studio, powering two-stage timestamped search and deep linking into lesson video moments.

## Architecture

```
studio/scripts/ingest/
├── parse-video-url.mjs      # URL parser and deterministic ID generator
├── chunk.mjs                # Subtitle cue merger and transcript chunker (~45s/350 chars)
├── providers/
│   └── youtube.mjs          # YouTube InnerTube iOS player API + timedtext cues & chapters
├── ingest-videos.mjs        # Master runner: queries lessons, dedupes, fetches, caches
├── build-ndjson.mjs         # Schema validator and NDJSON compiler
├── .cache/                  # Per-video cached documents (gitignored)
├── videos.ndjson            # Generated NDJSON ready for Sanity dataset import (gitignored)
└── README.md                # This guide
```

## How It Works

1. **Discovery**: Queries all lessons with `videoUrl` directly from Sanity (or falls back to `seed.ndjson`).
2. **Deduplication**: Groups lessons by canonical video URL so shared videos are only processed once.
3. **Provider Extraction**:
   - **YouTube**: Fetches `ytInitialData` from watch page for chapter markers; queries InnerTube iOS client context player endpoint to bypass unauthenticated caption blocks; parses `fmt=json3` timedtext cues.
   - **Vimeo / Bunny**: Registered in parser; reported as skipped when API credentials are required.
4. **Chunking**: Caption cues are merged into ~45-second / ~350-character chunks with decoded entities and non-negative integer `startSeconds`.
5. **Caching**: Results are saved to `.cache/<docId>.json` so re-runs require zero network traffic.
6. **Validation & Compilation**: `build-ndjson.mjs` validates monotonic timestamps, required fields, and stable `_key`s before creating `videos.ndjson`.

## Usage & Commands

From the `studio/` directory:

### 1. Ingest Video Data

```bash
# Smoke test first 3 videos
npm run ingest:videos -- --limit=3

# Ingest all lesson videos
npm run ingest:videos

# Force re-fetch from network (ignoring cache)
npm run ingest:videos -- --force
```

### 2. Validate & Compile NDJSON

```bash
npm run ingest:build
```

### 3. Import to Sanity Dataset

```bash
npm run ingest:import
```

> **Note**: The import uses `sanity dataset import ... --replace`, which is idempotent and uses the CLI's existing credentials.

## Studio Integration

Ingested video documents are defined by `studio/schemaTypes/documents/video.ts` and marked `readOnly: true` in the Studio. They serve as an internal lookup table for the intelligent search agent.
