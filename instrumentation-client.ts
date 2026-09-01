import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  // Include the defaults option as required by PostHog
  defaults: "2026-01-30",
  // Capture unhandled exceptions via Error Tracking in production only, so
  // dev-build React errors on localhost do not open high-severity issues.
  capture_exceptions: process.env.NODE_ENV === "production",
  // Turn on debug in development mode
  debug: process.env.NODE_ENV === "development",
});

// IMPORTANT: Never combine this approach with other client-side PostHog initialization
// approaches, especially components like a PostHogProvider.
// instrumentation-client.ts is the correct solution for initializing client-side
// PostHog in Next.js 15.3+ apps.
