"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, BookOpen, Trophy, Sparkles, Check, CheckCheck } from "lucide-react";
import { useNotifications, NotificationItem } from "@/lib/notifications";
import { cn } from "@/lib/utils";

function formatRelativeTime(timestamp: string | number): string {
  try {
    const time = typeof timestamp === "number" ? timestamp : new Date(timestamp).getTime();
    if (isNaN(time)) return "Recently";

    const diffSeconds = Math.floor((Date.now() - time) / 1000);

    if (diffSeconds < 60) return "Just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return new Date(time).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Recently";
  }
}

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: NotificationItem) => {
    markAsRead(notification.id);
    setIsOpen(false);
    if (notification.href) {
      router.push(notification.href);
    }
  };

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "new_course":
        return (
          <div className="w-8 h-8 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0 text-primary-600">
            <BookOpen className="w-4 h-4" />
          </div>
        );
      case "course_milestone":
        return (
          <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-amber-600">
            <Trophy className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
            <Sparkles className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "relative p-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer",
          isOpen ? "bg-neutral-200/60 text-neutral-900" : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
        )}
      >
        <Bell className="w-4 h-4 text-neutral-800" strokeWidth={1.75} aria-hidden="true" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center px-1 rounded-full bg-primary-500 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50 duration-200"
            aria-hidden="true"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications popover"
          className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] max-w-[calc(100vw-24px)] z-50 rounded-xl bg-[#FAF7F2] border border-[#EBE4DC] shadow-[0_16px_36px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#EBE4DC] bg-[#FAF7F2]/90 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-neutral-900 m-0">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[11px] font-semibold bg-primary-100 text-primary-700 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-primary-600 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Popover Notifications List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-[#EBE4DC]/60 focus:outline-none">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center flex flex-col items-center justify-center text-neutral-500">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-2.5 text-neutral-400">
                  <Check className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-neutral-800 m-0">You&apos;re all caught up!</p>
                <p className="text-xs text-neutral-500 mt-1 m-0">No new notifications right now.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleNotificationClick(item);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  className={cn(
                    "flex items-start gap-3 p-3.5 text-left transition-colors cursor-pointer group focus-visible:outline-none focus-visible:bg-neutral-100",
                    !item.isRead ? "bg-primary-50/25 hover:bg-primary-50/40" : "hover:bg-neutral-100/70"
                  )}
                >
                  {getNotificationIcon(item.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p
                        className={cn(
                          "text-xs leading-snug truncate m-0",
                          !item.isRead ? "font-bold text-neutral-900" : "font-medium text-neutral-800"
                        )}
                      >
                        {item.title}
                      </p>
                      <span className="text-[11px] text-neutral-400 shrink-0 whitespace-nowrap">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>

                    <p className="text-[12px] text-neutral-600 leading-snug line-clamp-2 m-0">
                      {item.message}
                    </p>

                    {item.meta?.level && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-white border border-[#EBE4DC] text-neutral-600 rounded">
                          {item.meta.level}
                        </span>
                        {item.meta.categoryTitle && (
                          <span className="text-[11px] text-neutral-500">
                            • {item.meta.categoryTitle}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Unread indicator dot */}
                  {!item.isRead && (
                    <span
                      className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5"
                      aria-label="Unread notification"
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Popover Footer */}
          <div className="p-2.5 border-t border-[#EBE4DC] bg-[#FAF7F2] text-center">
            <Link
              href="/courses"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-neutral-700 hover:text-primary-600 transition-colors inline-block py-1 px-3 rounded-md hover:bg-neutral-100/60"
            >
              Explore all courses &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
