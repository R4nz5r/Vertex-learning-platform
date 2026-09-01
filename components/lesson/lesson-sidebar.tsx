"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Menu,
  Play,
  X,
} from "lucide-react";
import { formatDurationHoursMinutes, formatDurationMinutesSeconds } from "@/lib/format";
import { useCourseProgress } from "@/lib/progress";
import posthog from "posthog-js";

export interface SidebarLesson {
  _id: string;
  title: string;
  slug: string;
  duration?: number;
  freePreview?: boolean;
}

export interface SidebarModule {
  _key: string;
  title: string;
  summary?: string;
  lessons?: SidebarLesson[];
}

export interface SidebarCourse {
  _id: string;
  title: string;
  slug: string;
  modules?: SidebarModule[];
  coverImageUrl?: string | null;
}

interface LessonSidebarProps {
  course: SidebarCourse;
  currentLessonSlug: string;
  currentModuleIndex: number;
}

export function LessonSidebar({
  course,
  currentLessonSlug,
  currentModuleIndex,
}: LessonSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const modules = React.useMemo(() => course.modules || [], [course.modules]);
  const totalModules = modules.length;

  // Flatten all course lessons and derive default preceding lessons (pre-completed)
  const { allLessons, defaultPrecedingSlugs } = React.useMemo(() => {
    const lessons: SidebarLesson[] = [];
    const preceding: string[] = [];

    modules.forEach((mod, mIdx) => {
      (mod.lessons || []).forEach((les) => {
        lessons.push(les);
        if (mIdx < currentModuleIndex) {
          preceding.push(les.slug);
        }
      });
    });

    return { allLessons: lessons, defaultPrecedingSlugs: preceding };
  }, [modules, currentModuleIndex]);

  const progress = useCourseProgress(course.slug, defaultPrecedingSlugs);
  const completedSet = new Set(progress.completedLessons);

  const totalLessonsCount = allLessons.length;
  const completedLessonsCount = completedSet.size;

  const isCourseFullyCompleted =
    progress.isCourseCompleted ||
    (totalLessonsCount > 0 && completedLessonsCount >= totalLessonsCount);

  const progressPercentage = isCourseFullyCompleted
    ? 100
    : totalLessonsCount > 0
    ? Math.min(99, Math.round((completedLessonsCount / totalLessonsCount) * 100))
    : 0;

  // Track expanded modules. Open the active module by default.
  const [expandedModules, setExpandedModules] = useState<Set<number>>(() => {
    return new Set([currentModuleIndex >= 0 ? currentModuleIndex : 0]);
  });

  const toggleModule = (index: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FAF7F2]">
      {/* ── Top Header Section: Back link & Course Summary ── */}
      <div className="p-6 border-b border-[#EBE4DC] bg-[#FAF7F2]">
        {/* Back to course link */}
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-primary-600 hover:text-primary-700 transition-colors mb-5 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to course</span>
        </Link>

        {/* Course Info Card */}
        <div className="flex items-center gap-3.5">
          {/* Course Icon Badge */}
          <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0 shadow-sm overflow-hidden relative">
            {course.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={course.coverImageUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-display font-bold text-xl tracking-tight">
                {course.title.charAt(0) || "N"}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-[14.5px] font-bold text-neutral-900 truncate leading-snug">
              {course.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[12px] font-medium text-neutral-500">
                {progressPercentage}% complete
              </span>
              <div className="flex-1 h-1.5 bg-[#EBE4DC] rounded-full overflow-hidden max-w-[80px]">
                <div
                  className="h-full bg-primary-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Module / Lesson Curriculum Navigation ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 divide-y divide-[#F0EAE1]">
        {/* Header Indicator */}
        <div className="flex items-center justify-between px-2 py-2 text-[13.5px] font-semibold text-neutral-800">
          <span>
            Module {currentModuleIndex + 1} of {totalModules}
          </span>
          <ChevronDown className="w-4 h-4 text-neutral-400" />
        </div>

        {/* List of Modules */}
        <div className="space-y-2 pt-2">
          {modules.map((mod, modIdx) => {
            const isCurrentModule = modIdx === currentModuleIndex;
            const modLessons = mod.lessons || [];
            const isCompleted =
              isCourseFullyCompleted ||
              (modLessons.length > 0 && modLessons.every((l) => completedSet.has(l.slug)));
            const isExpanded = expandedModules.has(modIdx);
            const moduleNumber = modIdx + 1;

            const modSeconds = modLessons.reduce(
              (acc, l) => acc + (l.duration || 0),
              0
            );
            const formattedModDuration = formatDurationHoursMinutes(modSeconds);

            return (
              <div
                key={mod._key || modIdx}
                className="rounded-xl transition-all overflow-hidden"
              >
                {/* Module Header Button */}
                <button
                  type="button"
                  onClick={() => toggleModule(modIdx)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    isCurrentModule
                      ? "bg-transparent font-medium"
                      : "hover:bg-neutral-100/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    {/* Module Number Circle Badge */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[12.5px] font-semibold transition-colors ${
                        isCurrentModule
                          ? "bg-primary-600 text-white shadow-sm"
                          : "border border-neutral-300/80 bg-white text-neutral-700"
                      }`}
                    >
                      {moduleNumber}
                    </div>

                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold text-neutral-900 truncate">
                        {mod.title}
                      </div>
                      <div className="text-[11.5px] text-neutral-500">
                        {formattedModDuration}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0" />
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>
                </button>

                {/* Sub-lessons list inside expanded module */}
                {isExpanded && modLessons.length > 0 && (
                  <div className="pl-6 pr-2 py-2 space-y-1">
                    {modLessons.map((les, lesIdx) => {
                      const isCurrentLesson = les.slug === currentLessonSlug;
                      const isLessonCompleted = isCourseFullyCompleted || completedSet.has(les.slug);
                      const lesDuration = formatDurationMinutesSeconds(
                        les.duration || 0
                      );

                      return (
                        <Link
                          key={les._id || les.slug || lesIdx}
                          href={`/lessons/${les.slug}`}
                          onClick={() => {
                            setMobileOpen(false);
                            posthog.capture("lesson_sidebar_clicked", {
                              lesson_title: les.title,
                              lesson_slug: les.slug,
                              module_title: mod.title,
                              is_current: isCurrentLesson,
                            });
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all group ${
                            isCurrentLesson
                              ? "bg-white border border-[#EBE4DC] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                              : "hover:bg-neutral-100/70"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            {/* Bullet Dot / Checkmark */}
                            {isLessonCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 shrink-0 ml-0.5" />
                            ) : isCurrentLesson ? (
                              <div className="w-2 h-2 rounded-full bg-primary-600 shrink-0 ml-0.5" />
                            ) : (
                              <div className="w-2 h-2 rounded-full border border-neutral-400 shrink-0 ml-0.5" />
                            )}

                            <div className="min-w-0">
                              <span
                                className={`text-[13px] block truncate transition-colors ${
                                  isCurrentLesson
                                    ? "font-semibold text-neutral-900"
                                    : isLessonCompleted
                                    ? "font-medium text-neutral-800"
                                    : "font-normal text-neutral-700 group-hover:text-neutral-900"
                                }`}
                              >
                                {les.title}
                              </span>
                              {isCurrentLesson && (
                                <span className="text-[11.5px] font-medium text-primary-600 block mt-0.5">
                                  Now playing
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center">
                            {isCurrentLesson ? (
                              <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-sm">
                                <Play className="w-3 h-3 fill-white ml-0.5" />
                              </div>
                            ) : (
                              <span className="text-[11.5px] text-neutral-400 font-normal">
                                {lesDuration}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile Sidebar Toggle Bar ── */}
      <div className="lg:hidden w-full bg-[#FAF7F2] border-b border-[#EBE4DC] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#EBE4DC] bg-white text-[13px] font-medium text-neutral-700 shadow-sm"
        >
          <Menu className="w-4 h-4 text-neutral-500" />
          <span>Curriculum ({currentModuleIndex + 1}/{totalModules})</span>
        </button>

        <Link
          href={`/courses/${course.slug}`}
          className="text-[12.5px] font-medium text-primary-600 hover:text-primary-700"
        >
          Back to course
        </Link>
      </div>

      {/* ── Mobile Drawer Overlay ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-[85%] max-w-[340px] bg-[#FAF7F2] h-full shadow-2xl z-10 flex flex-col">
            <div className="p-3 border-b border-[#EBE4DC] flex justify-end">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">{sidebarContent}</div>
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar Container (Sticky & Scrollable) ── */}
      <aside className="hidden lg:block w-[340px] shrink-0 border-r border-[#EBE4DC] bg-[#FAF7F2] min-h-[calc(100vh-65px)]">
        {sidebarContent}
      </aside>
    </>
  );
}
