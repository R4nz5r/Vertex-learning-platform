"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { formatDurationHoursMinutes } from "@/lib/format";
import posthog from "posthog-js";

export interface NavLesson {
  title: string;
  slug: string;
  duration?: number;
}

interface LessonNavigationProps {
  prevLesson: NavLesson | null;
  nextLesson: NavLesson | null;
  currentLessonTitle: string;
}

export function LessonNavigation({
  prevLesson,
  nextLesson,
  currentLessonTitle,
}: LessonNavigationProps) {
  return (
    <nav
      aria-label="Lesson navigation"
      className="w-full border-t border-[#EBE4DC] pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-6"
    >
      {/* ── Previous Lesson ── */}
      <div className="w-full sm:w-auto flex items-center gap-4">
        {prevLesson ? (
          <>
            <Link
              href={`/lessons/${prevLesson.slug}`}
              onClick={() =>
                posthog.capture("lesson_nav_prev_clicked", {
                  current_lesson: currentLessonTitle,
                  prev_lesson: prevLesson.title,
                })
              }
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#EBE4DC] bg-white text-[14px] font-semibold text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300 shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-600" />
              <span>Previous Lesson</span>
            </Link>

            <div className="hidden md:flex flex-col text-left">
              <span className="text-[13px] font-medium text-neutral-800 line-clamp-1">
                {prevLesson.title}
              </span>
              <span className="text-[11.5px] text-neutral-500">
                {formatDurationHoursMinutes(prevLesson.duration || 0)}
              </span>
            </div>
          </>
        ) : (
          <div className="invisible" />
        )}
      </div>

      {/* ── Next Lesson ── */}
      <div className="w-full sm:w-auto flex items-center justify-end gap-4">
        {nextLesson ? (
          <>
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[13px] font-medium text-neutral-800 line-clamp-1">
                {nextLesson.title}
              </span>
              <span className="text-[11.5px] text-neutral-500">
                {formatDurationHoursMinutes(nextLesson.duration || 0)}
              </span>
            </div>

            <Link
              href={`/lessons/${nextLesson.slug}`}
              onClick={() =>
                posthog.capture("lesson_nav_next_clicked", {
                  current_lesson: currentLessonTitle,
                  next_lesson: nextLesson.title,
                })
              }
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-[14px] font-semibold shadow-[0_2px_10px_rgba(217,90,43,0.3)] hover:shadow-[0_4px_14px_rgba(217,90,43,0.4)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              <span>Next Lesson</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        ) : (
          <div className="invisible" />
        )}
      </div>
    </nav>
  );
}
