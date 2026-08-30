# PostHog Self-driving Setup Report — Vertex

**Date:** 2026-08-31  
**Project:** Vertex (id: 585685)  
**Inbox:** https://us.posthog.com/project/585685/inbox

## Summary

Session Replay, Error Tracking, and Support (Conversations) were enabled. Six native signal sources were wired up, and the scout troop was tuned to 8 active scouts (5 built-in + 3 custom built for Vertex's unique surfaces). Two Replay Vision monitors were created and configured to push findings directly into the Self-driving inbox. Findings will start appearing in the inbox within ~30 minutes.

---

## AI data processing

**Approved.** Organization AI data processing consent was granted before this run started.

---

## GitHub

**Connected during this run.** GitHub App installed for account R4nz5r (integration id: 259921, connected 2026-08-30). Self-driving can now research findings against the repository and open fix PRs.

---

## Products enabled

| Product | Result | Notes |
|---|---|---|
| Session Replay | **enabled** | `posthog.init` has no `disable_session_recording` override — server flip is effective |
| Error Tracking | **enabled** | `posthog.init` already has `capture_exceptions: true` — client and server aligned |
| Support (Conversations) | **enabled** | Tickets arrive once an inbound channel is connected (see Follow-ups) |

---

## Signal sources

| source_product | source_type | Action | Config id |
|---|---|---|---|
| `signals_scout` | `cross_source_issue` | **on by default** — no row needed; scout findings reach inbox automatically | — |
| `health_checks` | `health_issue` | **enabled** | 01a05425-49d6-… |
| `error_tracking` | `issue_created` | **enabled** | 01a05425-4ec7-… |
| `error_tracking` | `issue_reopened` | **enabled** | 01a05425-5219-… |
| `error_tracking` | `issue_spiking` | **enabled** | 01a05425-5543-… |
| `session_replay` | `session_analysis_cluster` | **enabled** (sample_rate: 0.1) | 01a05425-7fb8-… |
| `conversations` | `ticket` | **enabled** | 01a05425-81ba-… |
| `llm_analytics` | — | **skipped** — internal only, not a user-facing responder | — |
| `logs` | — | **skipped** — not a v1 responder | — |
| `replay_vision` | — | **skipped** — self-authorizing via `emits_signals` on each scanner (step 6c) | — |

---

## Connected tools

No external tools selected. All skipped (not used).

---

## Scout troop

**Run budget:** 100 runs/day (early access default, 0 used today). Budget confirmed via `scout-metadata-get`.  
**Banner:** "Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more."

**8 scouts active** (5 built-in + 3 custom), well within the 10-scout ceiling.

### Enabled

| Scout | Why |
|---|---|
| `signals-scout-general` | Cross-product correlations; was already active |
| `signals-scout-product-analytics` | Primary instrumented surface — posthog-js active with autocapture and identifies |
| `signals-scout-web-analytics` | Next.js app capturing pageviews across course and lesson pages |
| `signals-scout-observability-gaps` | Fresh project — surfaces events with no insight or dashboard coverage |
| `signals-scout-health-checks` | Validates the PostHog setup as instrumentation is added |
| `signals-scout-lesson-completion` | **Custom** — see Custom scouts section |
| `signals-scout-video-engagement` | **Custom** — see Custom scouts section |
| `signals-scout-search-quality` | **Custom** — see Custom scouts section |

### Disabled (22 scouts)

| Scout | Reason |
|---|---|
| `signals-scout-error-tracking` | **Covered by native source** — error tracking wired in step 4; scout would duplicate it |
| `signals-scout-session-replay` | **Covered by native source** — session replay wired in step 4; scout would duplicate it |
| `signals-scout-feature-flags` | Not in use — no feature flag calls in codebase; enable when flags are added |
| `signals-scout-experiments` | Not in use — no A/B experiments |
| `signals-scout-surveys` | Not in use — 0 surveys |
| `signals-scout-ai-observability` | Not in use — no `$ai_*` events or LLM SDK yet |
| `signals-scout-revenue-analytics` | Not in use — no payment SDK |
| `signals-scout-csp-violations` | Not in use — no CSP reporting configured |
| `signals-scout-logs` | Not in use — PostHog logs product not used |
| `signals-scout-customer-analytics` | Not applicable — consumer learning platform, not B2B accounts |
| `signals-scout-data-pipelines` | Not in use — no CDP destinations or hog flows |
| `signals-scout-data-warehouse` | Not in use — no warehouse imports |
| `signals-scout-replay-vision` | Skipped — scanners created in step 6c have no accumulated observations yet; enable once data arrives |
| `signals-scout-anomaly-detection` | Covered by general for now — enable if specific dashboard anomalies become important |
| `signals-scout-apm` | Not in use — no distributed tracing |
| `signals-scout-conversations` | Not in use — no inbound channel connected yet |
| `signals-scout-inbox-validation` | Not warranted — no shipped fixes to validate on a fresh setup |
| `signals-scout-insight-alerts` | Not in use — no insight alerts configured |
| `signals-scout-mcp-tool-calls` | Not applicable for this project |
| `signals-scout-tasks` | Not applicable for this project |
| `signals-scout-skills-store` | Not applicable for this project |
| `signals-scout-web-vitals` | No evidence of `$web_vitals` capture; enable if Web Vitals are added |

To re-enable any surface-specific scout, go to the inbox settings and toggle it on.

---

## Custom scouts

Three custom scouts were proposed and approved, covering Vertex-specific surfaces the built-in troop doesn't watch.

### `signals-scout-lesson-completion`

- **Surface:** Ratio of `lesson_completed` to `lesson_started` events per course and module
- **Discriminator:** Completion ratio drops ≥15% vs 14-day rolling average, affecting ≥5 distinct users, with a specific course or module identifiable
- **Why no built-in covers it:** `signals-scout-product-analytics` watches saved funnels only — none exist yet on this fresh project. Once funnels are saved, this custom scout and the built-in can coexist
- **Arms now, activates:** once `lesson_started` / `lesson_completed` events are instrumented
- **Noise escape hatch:** set `emit: false` on its config in PostHog to switch it to dry-run

### `signals-scout-video-engagement`

- **Surface:** Play-to-completion ratio per lesson (video_completed / video_play), plus watch depth
- **Discriminator:** A lesson's ratio drops ≥20% below its prior-7d ratio AND ≥10% below fleet median, with ≥5 plays
- **Why no built-in covers it:** No canonical scout watches video-specific engagement; this is unique to a video learning platform with YouTube/Vimeo/Bunny embeds
- **Arms now, activates:** once `video_play` / `video_completed` events are instrumented
- **Noise escape hatch:** set `emit: false` on its config in PostHog to switch it to dry-run

### `signals-scout-search-quality`

- **Surface:** Zero-result rate and click-through rate on `search_performed` events
- **Discriminator:** Zero-result rate >25% or rises ≥10pp vs baseline, OR CTR drops ≥15pp, with ≥20 searches in window
- **Why no built-in covers it:** Search is Vertex's core differentiator (per AGENTS.md); no canonical scout watches search quality metrics
- **Arms now, activates:** once `search_performed` / `search_result_clicked` events are instrumented
- **Noise escape hatch:** set `emit: false` on its config in PostHog to switch it to dry-run

**Surfaces considered and ruled out:**
- Auth flow (Clerk sign-in/sign-up) — covered by `general` and `health-checks`; too generic for a custom scout
- Content delivery (Sanity CMS) — surfaces as bounce rate or errors; covered by `web-analytics` and native error tracking source

---

## Replay Vision scanners

Replay Vision scanners are LLMs that watch individual session recordings on a schedule and push findings directly into the Self-driving inbox. Findings arrive at **half weight** — a single finding needs corroboration from another scan before being promoted into a full report. This prevents a single fluke from triggering action.

The `creating-replay-vision-scanners` in-product sizing skill was not available on this deploy, so monthly credit spend was not estimated. The briefs are deliberately small (bounded sampling rates), so spend is expected to be minimal. Verify quota in PostHog → Replay Vision settings.

No existing scanners were found — no collision handling needed.

### Created scanners

| Scanner | id | Type | Query scope | sampling_rate | Credits/observation | Monthly estimate |
|---|---|---|---|---|---|---|
| Course and lesson loading failures | 01a0543a-e243-… | monitor | URLs containing `/courses/` | 0.5 | 5 | 0 (no recordings yet) |
| Learner stuck on course or search flows | 01a0543a-f1db-… | monitor | `$rageclick` events (all pages) | 1.0 | 5 | 0 (no recordings yet) |

**Breakage monitor** (`Course and lesson loading failures`) — watches sessions on `/courses/` pages for blank screens, broken video embeds, CMS rendering failures, search returning no cards, and auth errors. URL-scoped to the core learning flow.

**Frustration monitor** (`Learner stuck on course or search flows`) — watches sessions containing a rage click anywhere in the app for repeated button hammering, failed search submits, video play buttons that don't respond, and navigation confusion.

Both scanners have `emits_signals: true` — their findings feed directly into the inbox. The project has no session recordings yet; scanners start working the day recordings begin, with no second setup.

**Queries are disjoint:** the breakage monitor owns the *where* axis (URL scope); the frustration monitor owns the *what they did* axis (`$rageclick`). They will not double-count the same defect.

---

## Follow-ups

- [ ] **Connect a Conversations inbound channel** — go to PostHog → Support in the product sidebar and connect an email address, inbox, or Slack channel. The source row is already enabled; tickets will reach the inbox automatically once a channel exists.
- [ ] **Instrument lesson events** — add `lesson_started` and `lesson_completed` custom events (with `course_slug` and `module_index` properties) to activate the lesson-completion scout.
- [ ] **Instrument video events** — add `video_play` and `video_completed` custom events (with `lesson_slug` property, and optionally `watch_depth_percent`) to activate the video-engagement scout.
- [ ] **Instrument search events** — add `search_performed` (with `query` and `result_count` properties) and `search_result_clicked` to activate the search-quality scout.
- [ ] **Verify Replay Vision quota** — the in-product sizing skill was unavailable on this deploy; check remaining credit budget in PostHog → Replay Vision before recordings start flowing at scale.
- [ ] **Enable `signals-scout-replay-vision`** — once the two scanners above have accumulated observations, enable this scout in PostHog to watch for trends across those observations.

---

## What happens next

The scout coordinator picks up fresh configs within ~30 minutes. Each enabled scout draws one run from the project's daily budget (100 runs/day during early access). Findings cluster into reports in the inbox at https://us.posthog.com/project/585685/inbox. Immediately-actionable reports can start coding tasks — Self-driving will research the issue against the GitHub repo connected in this run and can open a draft fix PR.
