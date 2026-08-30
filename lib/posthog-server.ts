import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog {
  if (!posthogClient) {
    posthogClient = new PostHog(
      process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!,
      {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        // flushAt: 1 and flushInterval: 0 ensure events are sent immediately.
        // Next.js route handlers are short-lived, so we must flush before returning.
        flushAt: 1,
        flushInterval: 0,
      }
    );
  }
  return posthogClient;
}
