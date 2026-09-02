# Implementation prompt: Search Relevance & Precision Optimization

## Goal

Optimize the Vertex search backend and result rendering so that queries (such as `"server actions"`) return only highly-relevant, specific topic results (matching the exact module/topic concepts, such as 3 focused results across 1 course) instead of noisy partial-token matches (e.g., 11 loose results across 4 courses). Refine card UI elements to match the reference design in the user screenshot.

## Skills and docs read

- `AGENTS.md` — §1 (intelligent search linking straight to topic seconds), §3 (visual fidelity to reference screenshots), §7 (grounded search, relevance ranking by specificity: exact concept in title/module beats broad single-word hits in notes), §11 (ranked results with count, specificity ranking), §13 (checks: typecheck, lint, build).
- `sanity-best-practices` & GROQ token matching best practices.

## Code inspected

- `app/api/search/route.ts` — `executeGroqFallbackSearch` token matching and MCP/LLM search orchestration.
- `lib/search/system-prompt.ts` — System prompt search rules and specificity directives.
- `sanity/lib/queries.ts` — `SEARCH_LESSONS_GROQ_QUERY` and `LESSONS_BY_IDS_QUERY`.
- `components/search/lesson-result-card.tsx` — Left key points box icon (`FileText`), checkmark circle (`bg-[#1E293B] text-white`), and bottom metadata (`Module X`).
- `studio/scripts/seed/seed.ndjson` — Course structure for "Next.js App Router in Depth" (Module 4: "Server Actions and Mutations" containing 3 lessons: "Writing your first server action", "Forms, validation, and error states", "Optimistic updates").

## Decisions and assumptions

1. **Precision Relevance Scoring & Noise Filtering**:
   - For multi-word queries (e.g. `"server actions"`), compute a weighted specificity score:
     - Exact phrase match in lesson title or module title: +100 points
     - Exact phrase match in keyPoints or lesson notes: +60 points
     - All query tokens present in title or module title: +50 points
     - All query tokens present in keyPoints: +35 points
     - All query tokens present in notes: +15 points
     - Isolated partial-token matches (e.g. single word "server" when query is "server actions"): 0 points / low noise.
   - **Noise Filtering Threshold**: If specific topic hits (score >= 30) are found, drop low-scoring noise (score < 20) so queries return only the truly relevant lessons instead of broad keyword spam.
   - **Field-Aware Filtering**: When any title or module-topic match exists, note-only matches serve as fallbacks only. Retain lessons with a title or module match and exclude note-only hits unless no structural match is available.
   - For `"server actions"`, this returns the 3 focused lessons from Module 4 ("Server Actions and Mutations") across 1 course ("Next.js App Router in Depth").
2. **System Prompt & LLM Directives**:
   - Update `lib/search/system-prompt.ts` to instruct the LLM to strictly prioritize lessons where the full concept or module topic is taught, and forbid returning loose hits where only an isolated generic word is mentioned.
3. **Card UI Refinements (Matching Screenshot 2)**:
   - In `LessonResultCard`:
     - Top-left of keypoints box: Render a clean `FileText` icon (neutral-400 document icon).
     - Bottom-right of keypoints box: Render a dark circle badge (`bg-[#1E293B] text-white rounded-full w-5 h-5 flex items-center justify-center`).
     - Bottom metadata: Display `Module X` cleanly on the left (e.g. `Module 4`).
     - Description: Use authentic lesson summary / intro note text (e.g. "Define a Next.js server action, call it from a form or event, and revalidate data after a write.").

## Files to touch

- `app/api/search/route.ts` — Enhance `executeGroqFallbackSearch` with phrase matching, module-level topic matching, multi-token co-occurrence scoring, and noise threshold filtering.
- `lib/search/system-prompt.ts` — Refine LLM system prompt specificity rules to prevent loose single-word matches.
- `sanity/lib/queries.ts` — Include module title in `SEARCH_LESSONS_GROQ_QUERY` so module topic names (e.g. "Server Actions and Mutations") are factored into matching.
- `components/search/lesson-result-card.tsx` — Update keypoints container with `FileText` icon, dark checkmark circle, and clean `Module X` label.

## Requirements

1. Searching for `"server actions"` returns the 3 specific lessons from Next.js App Router in Depth ("Writing your first server action", "Forms, validation, and error states", "Optimistic updates") and shows `Found 3 results across 1 course`.
2. Loose matches that merely mention an isolated word (e.g. "Streaming responses to the browser") are filtered out when specific topic hits exist.
3. `LessonResultCard` displays the `FileText` icon, key points bullets, dark checkmark indicator, and `Module X` bottom label.

## Acceptance criteria

1. Query `"server actions"` produces 3 results across 1 course ranked by topic relevance.
2. Result cards visually match the reference screenshot.
3. `npx tsc --noEmit` and `npm run lint` pass with 0 errors.
4. `npm run build` succeeds cleanly.

## Checks to run

- `npx tsc --noEmit` in root web workspace
- `npm run lint` in root web workspace
- `npm run build` in root web workspace

## Exact manual test steps

1. Navigate to `/search?q=server+actions` in the browser.
2. Verify that header displays `Results for “server actions”` and `Found 3 results across 1 course`.
3. Verify the 3 result cards:
   - "Writing your first server action"
   - "Forms, validation, and error states"
   - "Optimistic updates"
4. Verify `LessonResultCard` styling: `FileText` icon in top-left of keypoints box, dark checkmark circle, and `Module 4` metadata label.
