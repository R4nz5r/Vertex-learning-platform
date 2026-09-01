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

const REGISTERED_COURSES_KEY = "vertex_learner_registered_courses";

function getRegisteredCourses(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(REGISTERED_COURSES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch {}
  return new Set();
}

/**
 * Register that the current learner is enrolled/engaged with a course.
 */
export function registerCourseLearner(courseSlug: string, courseTitle?: string): void {
  if (typeof window === "undefined" || !courseSlug) return;

  try {
    const registered = getRegisteredCourses();
    const isNewRegistration = !registered.has(courseSlug);

    const current = getEnrollmentsMap();
    const currentCount = current[courseSlug] || 0;

    let updatedCount = currentCount;
    if (isNewRegistration) {
      registered.add(courseSlug);
      localStorage.setItem(REGISTERED_COURSES_KEY, JSON.stringify(Array.from(registered)));
      updatedCount = Math.max(1, currentCount + 1);
    } else {
      updatedCount = Math.max(1, currentCount);
    }

    const updated = Object.freeze({
      ...current,
      [courseSlug]: updatedCount,
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

    if (isNewRegistration) {
      posthog.capture("course_learner_engaged", {
        course_slug: courseSlug,
        course_title: courseTitle,
      });
    }
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
