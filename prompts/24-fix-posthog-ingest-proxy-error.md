# Implementation Prompt: Fix PostHog Ingest 500 Internal Server Error

## Goal

Resolve the client-side `[PostHog.js] "Bad HTTP status: 500 Internal Server Error"` console error by configuring `instrumentation-client.ts` to prioritize `NEXT_PUBLIC_POSTHOG_HOST` (direct host `https://us.i.posthog.com`) and verifying valid token presence before initializing and dispatching analytics payloads.

---

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 6 tech stack, 7 decisions, 12 things that trip you up, 13 checks).
- `node_modules/next/dist/docs/` — Next.js rewrites and instrumentation.

---

## Code inspected

- `instrumentation-client.ts` — Discovered hardcoded `api_host: "/ingest"`. In local development, the Next.js rewrite proxy `/ingest` fails or returns 500 Internal Server Error when proxying outbound telemetry requests.
- `next.config.ts` — Contains rewrites proxying `/ingest/:path*` to `https://us.i.posthog.com/:path*`.
- `.env.example` — Defines `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com` and `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`.
- `lib/posthog-server.ts` — Server-side PostHog client initialization.

---

## Decisions and assumptions

1. **Direct Host Fallback in `instrumentation-client.ts`**:
   - Update `api_host` to use `process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"`, routing requests directly to the PostHog API endpoint rather than relying on local development server `/ingest` proxy rewrites.
   - Add a safeguard to ensure PostHog is only initialized if `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` is present and valid (not empty/placeholder).
2. **Server-Side Client Safeguard (`lib/posthog-server.ts`)**:
   - Ensure `NEXT_PUBLIC_POSTHOG_HOST` has a sensible default (`https://us.i.posthog.com`).

---

## Files to create or change

```
instrumentation-client.ts                       [MODIFY] Use direct NEXT_PUBLIC_POSTHOG_HOST and check token validity
lib/posthog-server.ts                           [MODIFY] Ensure fallback host https://us.i.posthog.com
```

---

## Requirements

1. Eliminate the `500 Internal Server Error` console warning in the browser.
2. Ensure PostHog analytics continue to function properly when a valid project token is configured.
3. Prevent initialization when no valid token is provided.

---

## Security considerations

- PostHog project token is public by design for browser tracking.
- Private server keys remain on the server.

---

## Acceptance criteria

1. Browser console does not throw `[PostHog.js] "Bad HTTP status: 500 Internal Server Error"`.
2. `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass cleanly.

---

## Checks to run

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Manual test steps

1. Open `http://localhost:3000/courses/building-ai-apps-with-llms`.
2. Open browser Developer Tools (F12) Console tab.
3. Verify no `[PostHog.js] "Bad HTTP status: 500 Internal Server Error"` occurs on page load or when clicking actions.
