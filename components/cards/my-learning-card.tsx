"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, BarChart2, Clock, FileText, Play, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCourseProgress } from "@/lib/progress";
import posthog from "posthog-js";

export interface MyLearningLesson {
  _id: string;
  title: string;
  slug: string;
  duration?: number | null;
}

export interface MyLearningModule {
  _key: string;
  title: string;
  lessons?: MyLearningLesson[] | null;
}

export interface MyLearningCardProps {
  courseId: string;
  title: string;
  slug: string;
  summary?: string | null;
  level?: string | null;
  duration?: string | null;
  moduleCount?: number | null;
  lessonCount?: number | null;
  modules?: MyLearningModule[] | null;
  defaultPrecedingLessons?: string[];
  icon?: React.ReactNode;
  logoChar?: string;
  logoBg?: string;
  className?: string;
}

export function MyLearningCard({
  title,
  slug,
  summary,
  level = "Intermediate",
  duration,
  moduleCount = 0,
  lessonCount = 0,
  modules = [],
  defaultPrecedingLessons = [],
  icon,
  logoChar,
  logoBg = "#0F172A",
  className,
}: MyLearningCardProps) {
  // Extract all lessons
  const allLessons = useMemo(() => {
    const list: { lesson: MyLearningLesson; moduleTitle: string }[] = [];
    (modules || []).forEach((mod) => {
      (mod.lessons || []).forEach((les) => {
        list.push({ lesson: les, moduleTitle: mod.title });
      });
    });
    return list;
  }, [modules]);

  const totalLessons = allLessons.length > 0 ? allLessons.length : (lessonCount || 1);

  // Live progress synchronization
  const progress = useCourseProgress(slug, defaultPrecedingLessons);
  const completedSet = useMemo(() => new Set(progress.completedLessons), [progress.completedLessons]);

  const isCompleted =
    progress.isCourseCompleted ||
    (allLessons.length > 0 && allLessons.every((item) => completedSet.has(item.lesson.slug))) ||
    (allLessons.length === 0 && completedSet.size >= totalLessons);

  const completedCount = isCompleted ? totalLessons : Math.min(totalLessons, completedSet.size);
  const clampedProgress = isCompleted
    ? 100
    : totalLessons > 0
    ? Math.min(99, Math.round((completedCount / totalLessons) * 100))
    : 0;

  // Find the next uncompleted lesson
  const nextItem = useMemo(() => {
    if (isCompleted || allLessons.length === 0) return null;
    return allLessons.find((item) => !completedSet.has(item.lesson.slug)) || allLessons[0];
  }, [isCompleted, allLessons, completedSet]);

  const nextLessonSlug = isCompleted ? null : nextItem ? nextItem.lesson.slug : allLessons[0]?.lesson?.slug;
  const nextLessonTitle = nextItem ? nextItem.lesson.title : null;
  const nextModuleTitle = nextItem ? nextItem.moduleTitle : null;

  const resumeHref = nextLessonSlug ? `/lessons/${nextLessonSlug}` : `/courses/${slug}`;

  return (
    <Card
      className={cn(
        "flex flex-col justify-between p-6 bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200",
        className,
      )}
    >
      <div>
        {/* Top row: Course icon & Status badge */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {icon ? (
              <div className="flex items-center">{icon}</div>
            ) : (
              <div
                className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center text-white font-bold text-base shrink-0"
                style={{ backgroundColor: logoBg }}
              >
                {logoChar || (title ? title.charAt(0) : "C")}
              </div>
            )}
          </div>

          {isCompleted ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              <span>Completed</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF6F0] border border-[#FCDCC9] text-[#C24F1A] text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              <span>In Progress</span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link
          href={`/courses/${slug}`}
          className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm"
        >
          <h3 className="font-display text-[19px] font-bold text-neutral-900 leading-snug group-hover:text-primary-600 transition-colors mb-2">
            {title}
          </h3>
        </Link>

        {/* Summary */}
        {summary && (
          <p className="text-[13px] text-neutral-500 leading-relaxed line-clamp-2 mb-4">
            {summary}
          </p>
        )}

        {/* Current Lesson / Up Next Pill */}
        {!isCompleted && nextLessonTitle ? (
          <div className="p-3 mb-5 rounded-lg bg-[#FAF7F2] border border-[#EBE4DC] flex flex-col gap-0.5">
            <span className="text-[10.5px] uppercase font-semibold tracking-wider text-neutral-600">
              {nextModuleTitle ? `${nextModuleTitle} · Next Lesson` : "Up Next"}
            </span>
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-neutral-900 truncate">
              <Play className="w-3 h-3 text-primary-500 fill-primary-500 shrink-0" strokeWidth={0} />
              <span className="truncate">{nextLessonTitle}</span>
            </div>
          </div>
        ) : isCompleted ? (
          <div className="p-3 mb-5 rounded-lg bg-green-50/60 border border-green-200/80 flex items-center gap-2 text-[12.5px] font-medium text-green-800">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>All {totalLessons} lessons completed!</span>
          </div>
        ) : null}

        {/* Progress Bar & Counter */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-medium text-neutral-600">
              {completedCount} of {totalLessons} lessons completed
            </span>
            <span className={cn("font-bold", isCompleted ? "text-green-600" : "text-primary-600")}>
              {clampedProgress}%
            </span>
          </div>

          <div
            className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={clampedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${clampedProgress}% complete`}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isCompleted
                  ? "bg-green-600"
                  : "bg-gradient-to-r from-primary-500 to-[#E76D42]",
              )}
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        {/* Course Meta Info */}
        <div className="flex items-center justify-between text-[11.5px] text-neutral-600 border-t border-neutral-100/90 pt-3.5 mb-4">
          <span className="inline-flex items-center gap-1">
            <BarChart2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" aria-hidden="true" />
            <span>{level}</span>
          </span>
          {duration && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" aria-hidden="true" />
              <span>{duration}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" aria-hidden="true" />
            <span>{moduleCount} modules</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href={resumeHref}
            onClick={() => {
              posthog.capture("my_learning_resume_clicked", {
                course_title: title,
                course_slug: slug,
                progress_percentage: clampedProgress,
                lesson_slug: nextLessonSlug,
              });
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg font-medium text-[13px] text-white bg-gradient-to-b from-[#E76D42] to-[#D9572B] border border-[#D45428] shadow-[0_2px_8px_rgba(225,98,55,0.25)] hover:from-[#DF6236] hover:to-[#CE4E22] active:translate-y-px transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-white" strokeWidth={0} />
            <span>{isCompleted ? "Review Course" : "Continue"}</span>
          </Link>

          <Link
            href={`/courses/${slug}`}
            className="inline-flex items-center justify-center h-9 px-3 rounded-lg text-[13px] font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
          >
            <span>Syllabus</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 text-neutral-400" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
