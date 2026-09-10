"use client";

import { useSyncExternalStore, useMemo } from "react";
import posthog from "posthog-js";
import { registerCourseLearner } from "@/lib/enrollment";

const LEGACY_STORAGE_PREFIX = "vertex_course_progress_";
const USER_STORAGE_PREFIX = "vertex_progress_";
const ACTIVE_USER_KEY = "vertex_active_user_id";
export const PROGRESS_EVENT_NAME = "vertex_progress_updated";

export interface CourseProgressState {
  completedLessons: string[]; // array of lesson slugs
  lastWatchedSlug?: string;
  isCourseCompleted?: boolean;
  updatedAt?: number;
  completedAt?: number;
}

const DEFAULT_EMPTY_STATE: CourseProgressState = Object.freeze({
  completedLessons: Object.freeze([]) as unknown as string[],
  isCourseCompleted: false,
});

let memoryActiveUserId: string | null = null;

/**
 * Get the active Clerk user ID from memory or localStorage.
 */
export function getActiveUserId(): string | null {
  if (memoryActiveUserId) return memoryActiveUserId;
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(ACTIVE_USER_KEY);
    if (stored) {
      memoryActiveUserId = stored;
      return stored;
    }
  } catch {}
  return null;
}

/**
 * Set or clear the active Clerk user ID.
 * When a user signs in, seamlessly migrates any legacy un-scoped progress to this user.
 */
export function setActiveUserId(userId: string | null): void {
  const previous = memoryActiveUserId;
  memoryActiveUserId = userId;

  if (typeof window !== "undefined") {
    try {
      if (userId) {
        localStorage.setItem(ACTIVE_USER_KEY, userId);
        migrateLegacyProgressToUser(userId);
      } else {
        localStorage.removeItem(ACTIVE_USER_KEY);
      }
    } catch (e) {
      console.error("Error setting active user ID in localStorage:", e);
    }

    // Invalidate cached snapshots across user switches
    snapshotCache.clear();
    fallbackCache.clear();

    if (previous !== userId) {
      window.dispatchEvent(
        new CustomEvent(PROGRESS_EVENT_NAME, {
          detail: { courseSlug: "*", state: DEFAULT_EMPTY_STATE },
        })
      );
    }
  }
}

/**
 * Migrate legacy un-scoped progress records (vertex_course_progress_*)
 * strictly to the currently logged-in user and delete the legacy records.
 */
function migrateLegacyProgressToUser(userId: string): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LEGACY_STORAGE_PREFIX)) {
        const slug = key.slice(LEGACY_STORAGE_PREFIX.length);
        if (slug) {
          const raw = localStorage.getItem(key);
          const targetKey = `${USER_STORAGE_PREFIX}${userId}_${slug}`;
          // Only copy if user doesn't already have explicit progress for this course
          if (!localStorage.getItem(targetKey) && raw) {
            localStorage.setItem(targetKey, raw);
          }
          // Remove legacy un-scoped key to prevent bleeding to other users
          localStorage.removeItem(key);
        }
      }
    }
  } catch (err) {
    console.error("Failed to migrate legacy progress to user:", err);
  }
}

/**
 * Get the user-scoped localStorage key for a specific course.
 */
function getStorageKey(courseSlug: string, explicitUserId?: string | null): string {
  const userId = explicitUserId || getActiveUserId();
  if (userId) {
    return `${USER_STORAGE_PREFIX}${userId}_${courseSlug}`;
  }
  return `${LEGACY_STORAGE_PREFIX}${courseSlug}`;
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
  defaultPrecedingLessons: string[] = [],
  explicitUserId?: string | null
): CourseProgressState {
  if (typeof window === "undefined" || !courseSlug) {
    return DEFAULT_EMPTY_STATE;
  }

  // If explicitUserId is explicitly null, treat as absent user and return empty state
  if (explicitUserId === null) {
    return DEFAULT_EMPTY_STATE;
  }

  const userId = explicitUserId !== undefined ? explicitUserId : getActiveUserId();
  if (!userId) {
    return DEFAULT_EMPTY_STATE;
  }

  const storageKey = getStorageKey(courseSlug, userId);
  const cacheKey = `${userId}_${courseSlug}`;

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      if (defaultPrecedingLessons.length === 0) {
        return DEFAULT_EMPTY_STATE;
      }
      let fallback = fallbackCache.get(cacheKey);
      if (!fallback) {
        fallback = Object.freeze({
          completedLessons: Object.freeze([...defaultPrecedingLessons]) as unknown as string[],
          isCourseCompleted: false,
        });
        fallbackCache.set(cacheKey, fallback);
      }
      return fallback;
    }

    const cached = snapshotCache.get(cacheKey);
    if (cached && cached.raw === raw) {
      return cached.data;
    }

    const parsed = JSON.parse(raw) as CourseProgressState;
    const frozenState = Object.freeze({
      ...parsed,
      completedLessons: Object.freeze(parsed.completedLessons || []) as unknown as string[],
      completedAt: parsed.isCourseCompleted ? (parsed.completedAt || parsed.updatedAt || 0) : undefined,
    });

    snapshotCache.set(cacheKey, { raw, data: frozenState });
    return frozenState;
  } catch (err) {
    console.error("Failed to read course progress from localStorage:", err);
  }

  return DEFAULT_EMPTY_STATE;
}

/**
 * Get all stored course progress records across localStorage strictly for the active or given user.
 * If no user is logged in, returns an empty record set.
 */
export function getAllStoredProgress(explicitUserId?: string | null): Record<string, CourseProgressState> {
  if (typeof window === "undefined") return {};
  const userId = explicitUserId || getActiveUserId();
  const result: Record<string, CourseProgressState> = {};

  // If no user is active/logged in, do not return any private progress
  if (!userId) {
    return result;
  }

  const prefix = `${USER_STORAGE_PREFIX}${userId}_`;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const slug = key.slice(prefix.length);
        if (slug) {
          result[slug] = getStoredProgress(slug, [], userId);
        }
      }
    }
  } catch (err) {
    console.error("Failed to read user-scoped course progress:", err);
  }
  return result;
}

/**
 * Save course progress to localStorage and broadcast change event.
 */
export function saveProgress(
  courseSlug: string,
  state: CourseProgressState,
  explicitUserId?: string | null
): void {
  if (typeof window === "undefined" || !courseSlug) return;

  const userId = explicitUserId || getActiveUserId();
  if (!userId) {
    // Only persist progress for authenticated users; legacy prefix is read-only for migration
    return;
  }

  try {
    const now = Date.now();
    const existing = getStoredProgress(courseSlug, [], userId);
    const existingCompletedAt = existing.completedAt || (existing.isCourseCompleted ? existing.updatedAt : undefined);
    const stateCompletedAt = state.completedAt || (state.isCourseCompleted ? (existingCompletedAt || now) : undefined);

    const stateWithTimes: CourseProgressState = {
      ...state,
      updatedAt: state.updatedAt || now,
      completedAt: state.isCourseCompleted ? stateCompletedAt : undefined,
    };

    const raw = JSON.stringify(stateWithTimes);
    const storageKey = getStorageKey(courseSlug, userId);
    localStorage.setItem(storageKey, raw);

    const frozenState = Object.freeze({
      ...stateWithTimes,
      completedLessons: Object.freeze(stateWithTimes.completedLessons || []) as unknown as string[],
    });

    const cacheKey = `${userId || "anon"}_${courseSlug}`;
    snapshotCache.set(cacheKey, { raw, data: frozenState });

    registerCourseLearner(courseSlug);

    window.dispatchEvent(
      new CustomEvent(PROGRESS_EVENT_NAME, {
        detail: { courseSlug, state: frozenState, userId },
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
  totalCourseLessons?: number,
  explicitUserId?: string | null
): CourseProgressState {
  const userId = explicitUserId || getActiveUserId();
  if (!userId) {
    return DEFAULT_EMPTY_STATE;
  }

  const current = getStoredProgress(courseSlug, [], userId);
  const wasAlreadyCompleted = current.completedLessons.includes(lessonSlug);
  const wasCourseCompleted = Boolean(current.isCourseCompleted);

  const completedSet = new Set(current.completedLessons);
  completedSet.add(lessonSlug);

  const completedList = Array.from(completedSet);
  const isCourseCompleted =
    Boolean(totalCourseLessons && totalCourseLessons > 0 && completedList.length >= totalCourseLessons) ||
    wasCourseCompleted;

  const now = Date.now();
  const nextState: CourseProgressState = {
    ...current,
    completedLessons: completedList,
    lastWatchedSlug: lessonSlug,
    isCourseCompleted,
    updatedAt: now,
    completedAt: isCourseCompleted ? (current.completedAt || now) : undefined,
  };

  saveProgress(courseSlug, nextState, userId);

  if (!wasAlreadyCompleted) {
    posthog.capture("lesson_completed", {
      course_slug: courseSlug,
      lesson_slug: lessonSlug,
      total_completed: completedList.length,
      is_course_completed: isCourseCompleted,
      user_id: userId,
    });
  }

  if (isCourseCompleted && !wasCourseCompleted) {
    posthog.capture("course_completed", {
      course_slug: courseSlug,
      total_lessons: totalCourseLessons,
      user_id: userId,
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
  totalCourseLessons?: number,
  explicitUserId?: string | null
): CourseProgressState {
  const userId = explicitUserId || getActiveUserId();
  if (!userId) {
    return DEFAULT_EMPTY_STATE;
  }

  const current = getStoredProgress(courseSlug, [], userId);
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

  const now = Date.now();
  const nextState: CourseProgressState = {
    ...current,
    completedLessons: completedList,
    lastWatchedSlug: lessonSlug,
    isCourseCompleted,
    updatedAt: now,
    completedAt: isCourseCompleted ? (current.completedAt || now) : undefined,
  };

  saveProgress(courseSlug, nextState, userId);

  if (!wasCompleted) {
    posthog.capture("lesson_completed", {
      course_slug: courseSlug,
      lesson_slug: lessonSlug,
      total_completed: completedList.length,
      is_course_completed: isCourseCompleted,
      completed_via: "manual_toggle",
      user_id: userId,
    });

    if (isCourseCompleted && !wasCourseCompleted) {
      posthog.capture("course_completed", {
        course_slug: courseSlug,
        total_lessons: totalCourseLessons,
        user_id: userId,
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
  allLessonSlugs: string[],
  explicitUserId?: string | null
): CourseProgressState {
  const userId = explicitUserId || getActiveUserId();
  if (!userId) {
    return DEFAULT_EMPTY_STATE;
  }

  const current = getStoredProgress(courseSlug, [], userId);
  const now = Date.now();
  const nextState: CourseProgressState = {
    ...current,
    completedLessons: Array.from(new Set([...current.completedLessons, ...allLessonSlugs])),
    isCourseCompleted: true,
    updatedAt: now,
    completedAt: current.completedAt || now,
  };

  saveProgress(courseSlug, nextState, userId);

  posthog.capture("course_completed", {
    course_slug: courseSlug,
    total_lessons: allLessonSlugs.length,
    completed_via: "complete_course_button",
    user_id: userId,
  });

  return nextState;
}

const getServerSnapshot = () => DEFAULT_EMPTY_STATE;

/**
 * React Hook for consuming live course progress via useSyncExternalStore.
 */
export function useCourseProgress(
  courseSlug: string,
  defaultPrecedingLessons: string[] = [],
  explicitUserId?: string | null
): CourseProgressState {
  const activeUser = explicitUserId || getActiveUserId();

  const subscribe = useMemo(() => {
    return (callback: () => void) => {
      if (typeof window === "undefined" || !courseSlug) return () => {};
      const handler = (e: Event) => {
        const customEvent = e as CustomEvent<{ courseSlug: string; state: CourseProgressState }>;
        if (
          !customEvent.detail ||
          customEvent.detail.courseSlug === "*" ||
          customEvent.detail.courseSlug === courseSlug
        ) {
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
    return () => getStoredProgress(courseSlug, defaultPrecedingLessons, activeUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug, defaultKey, activeUser]);

  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
}
