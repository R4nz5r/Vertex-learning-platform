"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

interface CatalogAnalyticsProps {
  totalCourses: number;
}

export function CatalogAnalytics({ totalCourses }: CatalogAnalyticsProps) {
  useEffect(() => {
    posthog.capture("catalog_viewed", {
      total_courses: totalCourses,
    });
  }, [totalCourses]);

  return null;
}
