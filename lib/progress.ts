"use client";

import { useSyncExternalStore, useMemo } from "react";
import posthog from "posthog-js";
import { registerCourseLearner } from "@/lib/enrollment";

const STORAGE_PREFIX = "vertex_course_progress_";
export const PROGRESS_EVENT_NAME = "vertex_progress_updated";

export interface CourseProgressState {
  completedLessons: string[]; // array of lesson slugs
  lastWatchedSlug?: string;
  isCourseCompleted?: boolean;
}

const DEFAULT_EMPTY_STATE: CourseProgressState = Object.freeze({
  completedLessons: Object.freeze([]) as unknown as string[],
  isCourseCompleted: false,
});

/**
 * Get the localStorage key for a specific course.
 */
function getStorageKey(courseSlug: string): string {
  return `${STORAGE_PREFIX}${courseSlug}`;
}

/**
 * Snapshot cache to guarantee referential stability for useSyncExternalStore.
 */
const snapshotCache = new Map<string, { raw: string; data: CourseProgressState }>();
const fallbackCache = new Map<string, CourseProgressState>();

/**
 * Load completed lessons from localStorage with stable object references.
 */
export function getStoredProgress(
  courseSlug: string,
  defaultPrecedingLessons: string[] = []
): CourseProgressState {
  if (typeof window === "undefined" || !courseSlug) {
    return DEFAULT_EMPTY_STATE;
  }

  try {
    const raw = localStorage.getItem(getStorageKey(courseSlug));
    if (!raw) {
      if (defaultPrecedingLessons.length === 0) {
        return DEFAULT_EMPTY_STATE;
      }
      let fallback = fallbackCache.get(courseSlug);
      if (!fallback) {
        fallback = Object.freeze({
          completedLessons: Object.freeze([...defaultPrecedingLessons]) as unknown as string[],
          isCourseCompleted: false,
        });
        fallbackCache.set(courseSlug, fallback);
      }
      return fallback;
    }

    const cached = snapshotCache.get(courseSlug);
    if (cached && cached.raw === raw) {
      return cached.data;
    }

    const parsed = JSON.parse(raw) as CourseProgressState;
    const frozenState = Object.freeze({
      ...parsed,
      completedLessons: Object.freeze(parsed.completedLessons || []) as unknown as string[],
    });

    snapshotCache.set(courseSlug, { raw, data: frozenState });
    return frozenState;
  } catch (err) {
    console.error("Failed to read course progress from localStorage:", err);
  }

  return DEFAULT_EMPTY_STATE;
}

/**
 * Save course progress to localStorage and broadcast change event.
 */
export function saveProgress(courseSlug: string, state: CourseProgressState): void {
  if (typeof window === "undefined" || !courseSlug) return;

  try {
    const raw = JSON.stringify(state);
    localStorage.setItem(getStorageKey(courseSlug), raw);

    const frozenState = Object.freeze({
      ...state,
      completedLessons: Object.freeze(state.completedLessons || []) as unknown as string[],
    });
    snapshotCache.set(courseSlug, { raw, data: frozenState });

    registerCourseLearner(courseSlug);

    window.dispatchEvent(
      new CustomEvent(PROGRESS_EVENT_NAME, {
        detail: { courseSlug, state: frozenState },
      })
    );
  } catch (err) {
    console.error("Failed to save course progress to localStorage:", err);
  }
}

/**
 * Mark a lesson as completed.
 */
export function markLessonCompleted(
  courseSlug: string,
  lessonSlug: string,
  totalCourseLessons?: number
): CourseProgressState {
  const current = getStoredProgress(courseSlug);
  const wasAlreadyCompleted = current.completedLessons.includes(lessonSlug);
  const wasCourseCompleted = Boolean(current.isCourseCompleted);

  const completedSet = new Set(current.completedLessons);
  completedSet.add(lessonSlug);

  const completedList = Array.from(completedSet);
  const isCourseCompleted =
    Boolean(totalCourseLessons && totalCourseLessons > 0 && completedList.length >= totalCourseLessons) ||
    wasCourseCompleted;

  const nextState: CourseProgressState = {
    ...current,
    completedLessons: completedList,
    lastWatchedSlug: lessonSlug,
    isCourseCompleted,
  };

  saveProgress(courseSlug, nextState);

  if (!wasAlreadyCompleted) {
    posthog.capture("lesson_completed", {
      course_slug: courseSlug,
      lesson_slug: lessonSlug,
      total_completed: completedList.length,
      is_course_completed: isCourseCompleted,
    });
  }

  if (isCourseCompleted && !wasCourseCompleted) {
    posthog.capture("course_completed", {
      course_slug: courseSlug,
      total_lessons: totalCourseLessons,
    });
  }

  return nextState;
}

/**
 * Toggle completion status of a lesson.
 */
export function toggleLessonCompleted(
  courseSlug: string,
  lessonSlug: string,
  totalCourseLessons?: number
): CourseProgressState {
  const current = getStoredProgress(courseSlug);
  const completedSet = new Set(current.completedLessons);
  const wasCompleted = completedSet.has(lessonSlug);
  const wasCourseCompleted = Boolean(current.isCourseCompleted);

  if (wasCompleted) {
    completedSet.delete(lessonSlug);
  } else {
    completedSet.add(lessonSlug);
  }

  const completedList = Array.from(completedSet);
  const isCourseCompleted = Boolean(
    totalCourseLessons && totalCourseLessons > 0 && completedList.length >= totalCourseLessons
  );

  const nextState: CourseProgressState = {
    ...current,
    completedLessons: completedList,
    lastWatchedSlug: lessonSlug,
    isCourseCompleted,
  };

  saveProgress(courseSlug, nextState);

  // Emit completion events only when toggling TO completed (not when uncompleting)
  if (!wasCompleted) {
    posthog.capture("lesson_completed", {
      course_slug: courseSlug,
      lesson_slug: lessonSlug,
      total_completed: completedList.length,
      is_course_completed: isCourseCompleted,
      completed_via: "manual_toggle",
    });

    if (isCourseCompleted && !wasCourseCompleted) {
      posthog.capture("course_completed", {
        course_slug: courseSlug,
        total_lessons: totalCourseLessons,
      });
    }
  }

  return nextState;
}

/**
 * Mark an entire course as 100% completed with all lesson slugs.
 */
export function markEntireCourseCompleted(
  courseSlug: string,
  allLessonSlugs: string[]
): CourseProgressState {
  const current = getStoredProgress(courseSlug);
  const nextState: CourseProgressState = {
    ...current,
    completedLessons: Array.from(new Set([...current.completedLessons, ...allLessonSlugs])),
    isCourseCompleted: true,
  };

  saveProgress(courseSlug, nextState);

  posthog.capture("course_completed", {
    course_slug: courseSlug,
    total_lessons: allLessonSlugs.length,
    completed_via: "complete_course_button",
  });

  return nextState;
}

const getServerSnapshot = () => DEFAULT_EMPTY_STATE;

/**
 * React Hook for consuming live course progress via useSyncExternalStore.
 */
export function useCourseProgress(
  courseSlug: string,
  defaultPrecedingLessons: string[] = []
): CourseProgressState {
  const subscribe = useMemo(() => {
    return (callback: () => void) => {
      if (typeof window === "undefined" || !courseSlug) return () => {};
      const handler = (e: Event) => {
        const customEvent = e as CustomEvent<{ courseSlug: string; state: CourseProgressState }>;
        if (!customEvent.detail || customEvent.detail.courseSlug === courseSlug) {
          callback();
        }
      };
      window.addEventListener(PROGRESS_EVENT_NAME, handler);
      window.addEventListener("storage", callback);
      return () => {
        window.removeEventListener(PROGRESS_EVENT_NAME, handler);
        window.removeEventListener("storage", callback);
      };
    };
  }, [courseSlug]);

  const defaultKey = defaultPrecedingLessons.join(",");

  const getSnapshot = useMemo(() => {
    return () => getStoredProgress(courseSlug, defaultPrecedingLessons);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug, defaultKey]);

  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
}
