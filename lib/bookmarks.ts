"use client";

import { useSyncExternalStore, useMemo, useCallback } from "react";
import posthog from "posthog-js";

const COURSE_BOOKMARKS_KEY = "vertex_course_bookmarks";
const LESSON_BOOKMARKS_KEY = "vertex_lesson_bookmarks";
export const BOOKMARKS_EVENT_NAME = "vertex_bookmarks_updated";

interface BookmarkDetail {
  slug: string;
  type: "course" | "lesson";
  isBookmarked: boolean;
}

const EMPTY_ARRAY: string[] = Object.freeze([]) as unknown as string[];

let cachedCourseBookmarksRaw: string | null = null;
let cachedCourseBookmarks: string[] = EMPTY_ARRAY;

let cachedLessonBookmarksRaw: string | null = null;
let cachedLessonBookmarks: string[] = EMPTY_ARRAY;

/**
 * Read bookmarked course slugs from localStorage.
 */
export function getStoredCourseBookmarks(): string[] {
  if (typeof window === "undefined") {
    return EMPTY_ARRAY;
  }

  try {
    const raw = localStorage.getItem(COURSE_BOOKMARKS_KEY);
    if (!raw) {
      cachedCourseBookmarksRaw = null;
      cachedCourseBookmarks = EMPTY_ARRAY;
      return EMPTY_ARRAY;
    }

    if (raw === cachedCourseBookmarksRaw) {
      return cachedCourseBookmarks;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cachedCourseBookmarksRaw = raw;
      cachedCourseBookmarks = Object.freeze([...parsed]) as unknown as string[];
      return cachedCourseBookmarks;
    }
  } catch (err) {
    console.error("Failed to read course bookmarks from localStorage:", err);
  }

  return EMPTY_ARRAY;
}

/**
 * Read bookmarked lesson slugs from localStorage.
 */
export function getStoredLessonBookmarks(): string[] {
  if (typeof window === "undefined") {
    return EMPTY_ARRAY;
  }

  try {
    const raw = localStorage.getItem(LESSON_BOOKMARKS_KEY);
    if (!raw) {
      cachedLessonBookmarksRaw = null;
      cachedLessonBookmarks = EMPTY_ARRAY;
      return EMPTY_ARRAY;
    }

    if (raw === cachedLessonBookmarksRaw) {
      return cachedLessonBookmarks;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cachedLessonBookmarksRaw = raw;
      cachedLessonBookmarks = Object.freeze([...parsed]) as unknown as string[];
      return cachedLessonBookmarks;
    }
  } catch (err) {
    console.error("Failed to read lesson bookmarks from localStorage:", err);
  }

  return EMPTY_ARRAY;
}

/**
 * Check if a course is currently bookmarked.
 */
export function isCourseBookmarked(slug: string): boolean {
  if (!slug) return false;
  const list = getStoredCourseBookmarks();
  return list.includes(slug);
}

/**
 * Check if a lesson is currently bookmarked.
 */
export function isLessonBookmarked(slug: string): boolean {
  if (!slug) return false;
  const list = getStoredLessonBookmarks();
  return list.includes(slug);
}

/**
 * Toggle bookmark state for a course.
 */
export function toggleCourseBookmark(
  slug: string,
  courseTitle?: string,
  level?: string
): boolean {
  if (typeof window === "undefined" || !slug) return false;

  try {
    const current = getStoredCourseBookmarks();
    const set = new Set(current);
    const willBeBookmarked = !set.has(slug);

    if (willBeBookmarked) {
      set.add(slug);
    } else {
      set.delete(slug);
    }

    const updated = Array.from(set);
    const raw = JSON.stringify(updated);
    localStorage.setItem(COURSE_BOOKMARKS_KEY, raw);
    cachedCourseBookmarksRaw = raw;
    cachedCourseBookmarks = Object.freeze(updated) as unknown as string[];

    // Dispatch custom event for immediate in-page UI updates
    window.dispatchEvent(
      new CustomEvent<BookmarkDetail>(BOOKMARKS_EVENT_NAME, {
        detail: { slug, type: "course", isBookmarked: willBeBookmarked },
      })
    );

    // Track in PostHog
    if (willBeBookmarked) {
      posthog.capture("course_bookmarked", {
        course_slug: slug,
        course_title: courseTitle,
        course_level: level,
      });
    } else {
      posthog.capture("course_unbookmarked", {
        course_slug: slug,
        course_title: courseTitle,
        course_level: level,
      });
    }

    return willBeBookmarked;
  } catch (err) {
    console.error("Failed to toggle course bookmark:", err);
    return false;
  }
}

/**
 * Toggle bookmark state for a lesson.
 */
export function toggleLessonBookmark(
  courseSlug: string,
  lessonSlug: string,
  lessonTitle?: string
): boolean {
  if (typeof window === "undefined" || !lessonSlug) return false;

  try {
    const current = getStoredLessonBookmarks();
    const set = new Set(current);
    const willBeBookmarked = !set.has(lessonSlug);

    if (willBeBookmarked) {
      set.add(lessonSlug);
    } else {
      set.delete(lessonSlug);
    }

    const updated = Array.from(set);
    const raw = JSON.stringify(updated);
    localStorage.setItem(LESSON_BOOKMARKS_KEY, raw);
    cachedLessonBookmarksRaw = raw;
    cachedLessonBookmarks = Object.freeze(updated) as unknown as string[];

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent<BookmarkDetail>(BOOKMARKS_EVENT_NAME, {
        detail: { slug: lessonSlug, type: "lesson", isBookmarked: willBeBookmarked },
      })
    );

    // Track in PostHog
    posthog.capture("lesson_bookmark_toggled", {
      course_slug: courseSlug,
      lesson_slug: lessonSlug,
      lesson_title: lessonTitle,
      bookmarked: willBeBookmarked,
    });

    return willBeBookmarked;
  } catch (err) {
    console.error("Failed to toggle lesson bookmark:", err);
    return false;
  }
}

const getServerSnapshot = () => EMPTY_ARRAY;

/**
 * React hook for observing all course bookmarks.
 */
export function useCourseBookmarks(): string[] {
  const subscribe = useMemo(() => {
    return (callback: () => void) => {
      if (typeof window === "undefined") return () => {};
      const handler = (e: Event) => {
        const customEvent = e as CustomEvent<BookmarkDetail>;
        if (!customEvent.detail || customEvent.detail.type === "course") {
          callback();
        }
      };
      window.addEventListener(BOOKMARKS_EVENT_NAME, handler);
      window.addEventListener("storage", callback);
      return () => {
        window.removeEventListener(BOOKMARKS_EVENT_NAME, handler);
        window.removeEventListener("storage", callback);
      };
    };
  }, []);

  return useSyncExternalStore(subscribe, getStoredCourseBookmarks, getServerSnapshot);
}

/**
 * React hook for observing all lesson bookmarks.
 */
export function useLessonBookmarks(): string[] {
  const subscribe = useMemo(() => {
    return (callback: () => void) => {
      if (typeof window === "undefined") return () => {};
      const handler = (e: Event) => {
        const customEvent = e as CustomEvent<BookmarkDetail>;
        if (!customEvent.detail || customEvent.detail.type === "lesson") {
          callback();
        }
      };
      window.addEventListener(BOOKMARKS_EVENT_NAME, handler);
      window.addEventListener("storage", callback);
      return () => {
        window.removeEventListener(BOOKMARKS_EVENT_NAME, handler);
        window.removeEventListener("storage", callback);
      };
    };
  }, []);

  return useSyncExternalStore(subscribe, getStoredLessonBookmarks, getServerSnapshot);
}

/**
 * React hook for a single course's bookmark state and toggle action.
 */
export function useCourseBookmark(slug?: string | null, title?: string, level?: string) {
  const bookmarks = useCourseBookmarks();
  const isBookmarked = useMemo(() => {
    if (!slug) return false;
    return bookmarks.includes(slug);
  }, [bookmarks, slug]);

  const toggle = useCallback(() => {
    if (!slug) return false;
    return toggleCourseBookmark(slug, title, level);
  }, [slug, title, level]);

  return { isBookmarked, toggle };
}

/**
 * React hook for a single lesson's bookmark state and toggle action.
 */
export function useLessonBookmark(courseSlug?: string | null, lessonSlug?: string | null, title?: string) {
  const bookmarks = useLessonBookmarks();
  const isBookmarked = useMemo(() => {
    if (!lessonSlug) return false;
    return bookmarks.includes(lessonSlug);
  }, [bookmarks, lessonSlug]);

  const toggle = useCallback(() => {
    if (!lessonSlug) return false;
    return toggleLessonBookmark(courseSlug || "", lessonSlug, title);
  }, [courseSlug, lessonSlug, title]);

  return { isBookmarked, toggle };
}
