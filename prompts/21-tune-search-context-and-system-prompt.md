# Implementation Prompt: 21-tune-search-context-and-system-prompt

## Goal
Tune the intelligent search system by crafting the Sanity Context document scope filter and instructions using `dial-your-context`, and shaping the inline system prompt using `shape-your-agent`.

---

## Skills Consulted
- `dial-your-context` (`.agents/skills/dial-your-context/SKILL.md`): Applied pure-deltas principles, GROQ filter scoping, non-obvious schema relations, and two-stage video resolution instructions.
- `shape-your-agent` (`.agents/skills/shape-your-agent/SKILL.md`): Structured the system prompt into Role, Voice, Ranking & Grounding Rules, Boundaries, and Structured Output Contract.
- `create-agent-with-sanity-context` (`.agents/skills/create-agent-with-sanity-context/SKILL.md`): MCP client connectivity, tool handling, and initial context injection.
- `sanity-best-practices` (`.agents/skills/sanity-best-practices/SKILL.md`): GROQ projection patterns, Portable Text plain-text extraction (`pt::text()`), and dataset document conventions.

---

## Code Inspected
- `lib/search/system-prompt.ts`: Current inline system prompt builder and context injection.
- `lib/search/mcp.ts`: Initial context fetching with 5-minute TTL caching and MCP tool client creation.
- `lib/search/ground.ts`: Post-search two-stage data grounding and catalog enrichment.
- `app/api/search/route.ts`: Search route pipeline combining rate limiting, MCP tool calling, structured generation, GROQ fallback, and PostHog tracking.
- `studio/scripts/context/vertex-search.ndjson`: Existing Sanity Context document with groqFilter and instructions.
- `studio/scripts/context/README.md`: Import procedure via `npm run context:import`.

---

## Decisions & Assumptions
1. **GROQ Scope Filter**:
   - `_type in ["course", "lesson", "instructor", "category", "video"] && !(_id in path("drafts.**"))`
   - Scopes search strictly to published content documents and internal video lookup documents.
2. **Context Document Instructions (`dial-your-context` pure deltas)**:
   - Provide only non-obvious rules that the generated schema cannot communicate:
     - Parent course derivation: `*[_type == "course" && references(^._id)][0]` (lessons do not store parent reference).
     - Positional module/lesson numbering (e.g. Lesson 5.1 is derived from ordering in `course.modules[]`).
     - Portable Text search: `pt::text(notes)` required for text matching.
     - Video internal lookup: videos are never standalone results; link them to lessons via `videoUrl == video.url`.
     - Two-stage video timestamp resolution: `chapters[].label` first, fallback to `chunks[].text` only if no chapter matches.
     - Projection limit: never project full `chunks` or `chapters` array (take max 3 filtered matches) to prevent context overflow.
     - Fallback rule: fall back to token wildcarding if `text::semanticSimilarity()` is unavailable.
3. **Inline System Prompt (`shape-your-agent` structure)**:
   - Echo critical query, ranking, and grounding rules (as models follow system prompts most reliably per AGENTS.md §12).
   - Define concrete Voice, Boundaries, Fallback, and Structured Output Contract.
   - Escape all backticks properly inside template literals.

---

## Files to Touch
1. `studio/scripts/context/vertex-search.ndjson` (Update Sanity Context document with refined `groqFilter` and concise pure-delta `instructions`).
2. `lib/search/system-prompt.ts` (Refine `buildSystemPrompt` to integrate shaped role, voice, grounding, two-stage video resolution, and guardrails).

---

## Requirements & Rules
- Ground every result in authentic Sanity data; zero hallucination of courses, lessons, timestamps, or durations.
- Two-stage video resolution: match chapters first, fallback to transcript chunks.
- Clean separation: Context instructions contain data deltas; system prompt contains agent behavior, voice, and grounding policy.
- All backticks in TypeScript template literals must be escaped (`\``).

---

## Security Considerations
- Read-only Sanity queries with server-side tokens only.
- Strict refusal boundaries for non-search queries, prompt extraction, or data mutations.
- Rate limiting remains enforced at API route entry.

---

## Acceptance Criteria
- [x] `studio/scripts/context/vertex-search.ndjson` contains clean GROQ filter and pure-delta instructions.
- [x] `lib/search/system-prompt.ts` adheres to `shape-your-agent` architecture with clear Voice, Boundaries, Ranking, and Output Contract.
- [x] TypeScript compiles with 0 errors (`npx tsc --noEmit`).
- [x] ESLint passes with 0 errors (`npm run lint`).

---

## Checks to Run
- `npm run lint` in web workspace
- `npx tsc --noEmit` in web workspace

---

## Manual Test Steps
1. Verify `lib/search/system-prompt.ts` generates a valid string with initial context injected.
2. Verify search queries (e.g. "server actions", "streaming", "data fetching") via `/api/search` or search UI `/search?q=server+actions`.
3. Verify video timestamp resolution (chapter vs chunk) links correctly to video playback at target second.
4. Verify non-search prompts are handled gracefully and safely.
