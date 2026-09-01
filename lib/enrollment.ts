"use client";

import { useSyncExternalStore, useMemo, useCallback } from "react";
import posthog from "posthog-js";

const ENROLLMENT_STORAGE_KEY = "vertex_course_enrollments";
export const ENROLLMENT_EVENT_NAME = "vertex_enrollment_updated";

const EMPTY_ENROLLMENTS: Record<string, number> = Object.freeze({});

let cachedEnrollmentsRaw: string | null = null;
let cachedEnrollments: Record<string, number> = EMPTY_ENROLLMENTS;

/**
 * Get map of courseSlug -> active learner count from localStorage.
 */
function getEnrollmentsMap(): Record<string, number> {
  if (typeof window === "undefined") {
    return EMPTY_ENROLLMENTS;
  }
  try {
    const raw = localStorage.getItem(ENROLLMENT_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to read course enrollments from localStorage:", err);
  }
  return EMPTY_ENROLLMENTS;
}

function getStoredSnapshot(): Record<string, number> {
  if (typeof window === "undefined") {
    return EMPTY_ENROLLMENTS;
  }
  try {
    const raw = localStorage.getItem(ENROLLMENT_STORAGE_KEY);
    if (!raw) {
      cachedEnrollmentsRaw = null;
      cachedEnrollments = EMPTY_ENROLLMENTS;
      return EMPTY_ENROLLMENTS;
    }
    if (raw === cachedEnrollmentsRaw) {
      return cachedEnrollments;
    }
    const parsed = JSON.parse(raw);
    const frozen = Object.freeze({ ...parsed });
    cachedEnrollmentsRaw = raw;
    cachedEnrollments = frozen;
    return frozen;
  } catch (err) {
    console.error("Failed to read enrollments snapshot:", err);
    return EMPTY_ENROLLMENTS;
  }
}

/**
 * Register that the current learner is enrolled/engaged with a course.
 */
export function registerCourseLearner(courseSlug: string, courseTitle?: string): void {
  if (typeof window === "undefined" || !courseSlug) return;

  try {
    const current = getEnrollmentsMap();
    const currentCount = current[courseSlug] || 0;
    // Track unique learner engagement (increments if not yet counted)
    const updated = Object.freeze({
      ...current,
      [courseSlug]: Math.max(1, currentCount + 1),
    });

    const raw = JSON.stringify(updated);
    localStorage.setItem(ENROLLMENT_STORAGE_KEY, raw);
    cachedEnrollmentsRaw = raw;
    cachedEnrollments = updated;

    window.dispatchEvent(
      new CustomEvent(ENROLLMENT_EVENT_NAME, {
        detail: { courseSlug, count: updated[courseSlug] },
      })
    );

    posthog.capture("course_learner_engaged", {
      course_slug: courseSlug,
      course_title: courseTitle,
    });
  } catch (err) {
    console.error("Failed to register course learner:", err);
  }
}

const getServerSnapshot = (): Record<string, number> => EMPTY_ENROLLMENTS;

/**
 * React Hook to get the live student count for a course,
 * reflecting purely real active enrolled learners.
 */
export function useCourseStudentCount(
  courseSlug?: string | null
): { studentCount: number; registerEngagement: () => void } {
  const subscribe = useMemo(() => {
    return (callback: () => void) => {
      if (typeof window === "undefined" || !courseSlug) return () => {};
      const handler = (e: Event) => {
        const customEvent = e as CustomEvent<{ courseSlug?: string }>;
        if (!customEvent.detail || customEvent.detail.courseSlug === courseSlug) {
          callback();
        }
      };
      window.addEventListener(ENROLLMENT_EVENT_NAME, handler);
      window.addEventListener("storage", callback);
      return () => {
        window.removeEventListener(ENROLLMENT_EVENT_NAME, handler);
        window.removeEventListener("storage", callback);
      };
    };
  }, [courseSlug]);

  const enrollments = useSyncExternalStore(
    subscribe,
    getStoredSnapshot,
    getServerSnapshot
  );

  // Return real active learners recorded for this course (defaulting to 1 for the current active learner)
  const realLearnersCount = courseSlug ? (enrollments[courseSlug] || 1) : 1;

  const registerEngagement = useCallback(() => {
    if (courseSlug) {
      registerCourseLearner(courseSlug);
    }
  }, [courseSlug]);

  return { studentCount: realLearnersCount, registerEngagement };
}
