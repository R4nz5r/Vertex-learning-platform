# 10 — Video playback observability

## Goal

Make lesson video playback observable. Today the only playback signal is
`video_played`, which fires on the play button click. Nothing reports whether the
embed actually plays, how far the learner watches, or whether the embed errors. This
gap is what AGENTS.md section 7 calls "a video play and how far it is watched" — the
second half is missing. It also produces unanswerable reports: a flagged session fired
many `video_played` events with no way to know if a single second played.

## Skills read

- AGENTS.md sections 3, 5, 7 (UI fidelity, client/server boundary, analytics moments).
- `node_modules/next/dist/docs/` for the App Router client component boundary.
- YouTube IFrame Player API reference (`onStateChange`, `onError`, error codes).

## Code inspected

- `components/lesson/lesson-video-player.tsx` — client player; swaps a poster for a
  cross-origin YouTube iframe; only fires `video_played` on click.
- `components/lesson/lesson-content.tsx` — the one caller, passes `startSeconds` deep
  link from search.
- `lib/video.ts` — `getEmbedUrl` parses YouTube / Vimeo / Bunny; seeded content is
  100% YouTube.
- `instrumentation-client.ts` — PostHog init; `capture_exceptions: true` with no
  environment gate.
- Existing events are inline string literals; there is no central event-name module,
  so new events stay inline to match.

## Decisions

- Drive the YouTube embed through the IFrame Player API so `onStateChange` and
  `onError` are observable. Vimeo / Bunny / generic keep the plain iframe (no seeded
  content uses them; out of scope).
- New events, all grounded in real player state:
  - `video_playback_started` — first `PLAYING` state. Confirms the embed really plays,
    distinct from the click.
  - `video_progress` — fired once per crossed milestone (25 / 50 / 75 / 100 percent).
    Carries `percent`, `seconds_watched`, `video_duration`. This is the watch-progress
    signal. Milestones dedupe so playback does not flood the stream.
  - `video_error` — `onError`, with `error_code` and a readable `error_reason`.
- On error, replace the black player with a visible fallback panel plus a retry
  button. Never link out to the provider (AGENTS.md section 7).
- Gate `capture_exceptions` to production so a localhost dev-build React error can not
  open a high-severity issue.
- Add `lib/youtube-iframe-api.ts` — minimal typings, a single-load promise for the API
  script, and an error-code-to-text helper. Keeps the component readable and typed
  without a new dependency.

## Files

- `instrumentation-client.ts` — gate `capture_exceptions`.
- `lib/youtube-iframe-api.ts` — new loader + typings.
- `components/lesson/lesson-video-player.tsx` — API player, events, error fallback.

## Security / boundary

- All work is client-side analytics with the public PostHog key. No token, no write.
- No new dependency; the API script loads from YouTube at runtime.

## Acceptance

- Playing a YouTube lesson fires `video_playback_started`, then `video_progress` at
  milestones; finishing fires `video_progress` at 100.
- An embed that errors (e.g. embedding disabled) fires `video_error` and shows the
  fallback with retry, not a black rectangle.
- No exceptions are captured outside production.
- The poster / play-button UI and the `startSeconds` deep link are unchanged.

## Checks

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
