"use client";

import { useSyncExternalStore, useMemo, useEffect, useState, useCallback } from "react";
import posthog from "posthog-js";
import { useAuth } from "@clerk/nextjs";
import { getAllStoredProgress, PROGRESS_EVENT_NAME } from "./progress";

const READ_NOTIFICATIONS_BASE_KEY = "vertex_read_notifications";
const MILESTONE_TIMESTAMPS_BASE_KEY = "vertex_milestone_timestamps";
export const NOTIFICATIONS_EVENT_NAME = "vertex_notifications_updated";

export interface NotificationItem {
  id: string;
  type: "new_course" | "course_milestone" | "announcement";
  title: string;
  message: string;
  href: string;
  timestamp: string | number;
  isRead: boolean;
  meta?: {
    courseSlug?: string;
    courseTitle?: string;
    instructorName?: string;
    categoryTitle?: string;
    level?: string;
  };
}

const EMPTY_ARRAY: string[] = Object.freeze([]) as unknown as string[];

const readCache = new Map<string, { raw: string; data: string[] }>();

function getReadStorageKey(userId?: string | null): string {
  return userId ? `${READ_NOTIFICATIONS_BASE_KEY}_${userId}` : READ_NOTIFICATIONS_BASE_KEY;
}

function getMilestoneStorageKey(userId?: string | null): string {
  return userId ? `${MILESTONE_TIMESTAMPS_BASE_KEY}_${userId}` : MILESTONE_TIMESTAMPS_BASE_KEY;
}

/**
 * Read the list of read notification IDs from localStorage, strictly scoped by userId.
 */
export function getReadNotificationIds(userId?: string | null): string[] {
  if (typeof window === "undefined") {
    return EMPTY_ARRAY;
  }

  const key = getReadStorageKey(userId);

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return EMPTY_ARRAY;
    }

    const cached = readCache.get(key);
    if (cached && cached.raw === raw) {
      return cached.data;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const frozen = Object.freeze([...parsed]) as unknown as string[];
      readCache.set(key, { raw, data: frozen });
      return frozen;
    }
  } catch (err) {
    console.error("Failed to read notifications read list from localStorage:", err);
  }

  return EMPTY_ARRAY;
}

/**
 * Mark a specific notification as read for a given user.
 */
export function markNotificationAsRead(id: string, userId?: string | null): void {
  if (typeof window === "undefined" || !id) return;

  const key = getReadStorageKey(userId);

  try {
    const current = getReadNotificationIds(userId);
    const set = new Set(current);
    if (!set.has(id)) {
      set.add(id);
      const updated = Array.from(set);
      const raw = JSON.stringify(updated);
      localStorage.setItem(key, raw);

      const frozen = Object.freeze(updated) as unknown as string[];
      readCache.set(key, { raw, data: frozen });

      window.dispatchEvent(
        new CustomEvent(NOTIFICATIONS_EVENT_NAME, {
          detail: { readIds: updated, action: "read_single", id, userId },
        })
      );

      posthog.capture("notification_read", { notification_id: id, user_id: userId });
    }
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
  }
}

/**
 * Mark multiple or all given notification IDs as read for a given user.
 */
export function markAllNotificationsAsRead(ids: string[], userId?: string | null): void {
  if (typeof window === "undefined" || !ids || ids.length === 0) return;

  const key = getReadStorageKey(userId);

  try {
    const current = getReadNotificationIds(userId);
    const set = new Set(current);
    let changed = false;

    for (const id of ids) {
      if (!set.has(id)) {
        set.add(id);
        changed = true;
      }
    }

    if (changed) {
      const updated = Array.from(set);
      const raw = JSON.stringify(updated);
      localStorage.setItem(key, raw);

      const frozen = Object.freeze(updated) as unknown as string[];
      readCache.set(key, { raw, data: frozen });

      window.dispatchEvent(
        new CustomEvent(NOTIFICATIONS_EVENT_NAME, {
          detail: { readIds: updated, action: "read_all", userId },
        })
      );

      posthog.capture("notifications_marked_all_read", { count: ids.length, user_id: userId });
    }
  } catch (err) {
    console.error("Failed to mark all notifications as read:", err);
  }
}

const getServerSnapshot = () => EMPTY_ARRAY;

/**
 * React hook observing read notification IDs across tabs and components for the active user.
 */
export function useReadNotificationIds(userId?: string | null): string[] {
  const subscribe = useMemo(() => {
    return (callback: () => void) => {
      if (typeof window === "undefined") return () => {};
      const handler = (e: Event) => {
        const customEvent = e as CustomEvent<{ userId?: string | null }>;
        if (!customEvent.detail || customEvent.detail.userId === undefined || customEvent.detail.userId === userId) {
          callback();
        }
      };
      window.addEventListener(NOTIFICATIONS_EVENT_NAME, handler);
      window.addEventListener("storage", callback);
      return () => {
        window.removeEventListener(NOTIFICATIONS_EVENT_NAME, handler);
        window.removeEventListener("storage", callback);
      };
    };
  }, [userId]);

  const getSnapshot = useCallback(() => getReadNotificationIds(userId), [userId]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// In-memory cache for server notifications so repeated mounts don't constantly re-fetch
let cachedServerNotifications: Array<Omit<NotificationItem, "isRead">> | null = null;

function getMilestoneTimestamp(milestoneId: string, stateTimestamp?: number, userId?: string | null): number {
  if (typeof window === "undefined") {
    return stateTimestamp && stateTimestamp > 0 ? stateTimestamp : Date.now();
  }

  const storageKey = getMilestoneStorageKey(userId);

  try {
    const raw = localStorage.getItem(storageKey);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};

    // 1. If we already recorded a stable milestone timestamp, return it
    if (map[milestoneId] && map[milestoneId] > 0) {
      return map[milestoneId];
    }

    // 2. If progress state has an explicit valid timestamp (> 0), store and return it
    if (stateTimestamp && stateTimestamp > 0) {
      map[milestoneId] = stateTimestamp;
      localStorage.setItem(storageKey, JSON.stringify(map));
      return stateTimestamp;
    }

    // 3. Fallback: if course was completed earlier without timestamp, record a stable past time (1 hour ago)
    const initialTime = Date.now() - 3600 * 1000;
    map[milestoneId] = initialTime;
    localStorage.setItem(storageKey, JSON.stringify(map));
    return initialTime;
  } catch {
    return stateTimestamp && stateTimestamp > 0 ? stateTimestamp : Date.now();
  }
}

/**
 * Comprehensive hook providing user-isolated active notifications, unread count, and management actions.
 */
export function useNotifications() {
  const { userId, isSignedIn } = useAuth();
  const readIds = useReadNotificationIds(userId);
  const [progressVersion, setProgressVersion] = useState(0);

  // Subscribe to progress updates so milestone notifications and unread counts recompute immediately
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleProgress = (e: Event) => {
      const customEvent = e as CustomEvent<{ userId?: string | null }>;
      if (!customEvent.detail || customEvent.detail.userId === undefined || customEvent.detail.userId === userId) {
        setProgressVersion((v) => v + 1);
      }
    };

    window.addEventListener(PROGRESS_EVENT_NAME, handleProgress);
    window.addEventListener("storage", handleProgress);

    return () => {
      window.removeEventListener(PROGRESS_EVENT_NAME, handleProgress);
      window.removeEventListener("storage", handleProgress);
    };
  }, [userId]);

  const [serverNotifications, setServerNotifications] = useState<Array<Omit<NotificationItem, "isRead">>>(
    cachedServerNotifications || []
  );
  const [loading, setLoading] = useState(cachedServerNotifications === null);

  // Fetch course notifications from the server API route
  useEffect(() => {
    let isMounted = true;

    async function fetchCourseNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          if (data?.notifications && Array.isArray(data.notifications)) {
            if (isMounted) {
              cachedServerNotifications = data.notifications;
              setServerNotifications(data.notifications);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch course notifications:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCourseNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  // Merge server-side new course notifications with local milestones (e.g. course completed)
  // Milestone notifications are STRICTLY isolated to the signed-in user
  const notifications: NotificationItem[] = useMemo(() => {
    void progressVersion;
    const list: NotificationItem[] = [];
    const readSet = new Set(readIds);

    // 1. Add public course notifications from Sanity
    for (const item of serverNotifications) {
      list.push({
        ...item,
        isRead: readSet.has(item.id),
      });
    }

    // 2. Add course completion milestone notifications STRICTLY for the current authenticated user
    if (typeof window !== "undefined" && isSignedIn && userId) {
      try {
        const progressRecords = getAllStoredProgress(userId);
        for (const [courseSlug, state] of Object.entries(progressRecords)) {
          if (state.isCourseCompleted) {
            const milestoneId = `milestone-completed-${userId}-${courseSlug}`;
            const courseName = courseSlug
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");

            list.push({
              id: milestoneId,
              type: "course_milestone",
              title: "Course Completed! 🎉",
              message: `Congratulations! You have completed all lessons in ${courseName}.`,
              href: `/my-learning`,
              timestamp: getMilestoneTimestamp(milestoneId, state.completedAt || state.updatedAt, userId),
              isRead: readSet.has(milestoneId),
              meta: {
                courseSlug,
                courseTitle: courseName,
              },
            });
          }
        }
      } catch (e) {
        console.error("Error reading progress for milestone notifications:", e);
      }
    }

    // Sort notifications: newest first
    return list.sort((a, b) => {
      const timeA = typeof a.timestamp === "number" ? a.timestamp : new Date(a.timestamp).getTime();
      const timeB = typeof b.timestamp === "number" ? b.timestamp : new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
  }, [serverNotifications, readIds, isSignedIn, userId, progressVersion]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const markAsRead = useCallback(
    (id: string) => {
      markNotificationAsRead(id, userId);
    },
    [userId]
  );

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    markAllNotificationsAsRead(allIds, userId);
  }, [notifications, userId]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  };
}
