"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";

/**
 * Identifies the currently signed-in Clerk user with PostHog.
 * Renders nothing — place this once inside a client boundary in the root layout.
 */
export function PostHogIdentify() {
  const { isSignedIn, user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      // Use the stable Clerk user ID as the distinct ID.
      // PII (name, email) goes into person properties via identify(), never into capture() event properties.
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName ?? undefined,
        username: user.username ?? undefined,
      });
    } else {
      // User signed out — reset so the anonymous visitor gets a fresh distinct ID.
      posthog.reset();
    }
  }, [isSignedIn, user, isLoaded]);

  return null;
}
