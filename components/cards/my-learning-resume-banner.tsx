"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { CheckCircle2, Play, Sparkles, Trophy } from "lucide-react";
import { useCourseProgress } from "@/lib/progress";

interface ResumeLesson {
  _id: string;
  title: string;
  slug: string;
  duration?: number | null;
}

interface ResumeModule {
  _key: string;
  title: string;
  lessons?: ResumeLesson[] | null;
}

interface ResumeCourse {
  _id: string;
  title: string;
  slug: string;
  modules?: ResumeModule[] | null;
  lessonCount?: number | null;
}

interface MyLearningResumeBannerProps {
  course: ResumeCourse;
  defaultPrecedingLessons?: string[];
}

export function MyLearningResumeBanner({
  course,
  defaultPrecedingLessons = [],
}: MyLearningResumeBannerProps) {
  const allLessons = useMemo(() => {
    const list: { lesson: ResumeLesson; moduleTitle: string }[] = [];
    (course.modules || []).forEach((mod) => {
      (mod.lessons || []).forEach((les) => {
        list.push({ lesson: les, moduleTitle: mod.title });
      });
    });
    return list;
  }, [course.modules]);

  const totalLessons = allLessons.length > 0 ? allLessons.length : (course.lessonCount || 1);

  const progress = useCourseProgress(course.slug, defaultPrecedingLessons);
  const completedSet = useMemo(() => new Set(progress.completedLessons), [progress.completedLessons]);

  const isCompleted =
    progress.isCourseCompleted ||
    (allLessons.length > 0 && allLessons.every((item) => completedSet.has(item.lesson.slug))) ||
    (allLessons.length === 0 && completedSet.size >= totalLessons);

  const completedCount = isCompleted ? totalLessons : Math.min(totalLessons, completedSet.size);
  const percentage = isCompleted
    ? 100
    : totalLessons > 0
    ? Math.min(99, Math.round((completedCount / totalLessons) * 100))
    : 0;

  // Find next uncompleted lesson
  const nextItem = useMemo(() => {
    if (isCompleted || allLessons.length === 0) return null;
    return allLessons.find((item) => !completedSet.has(item.lesson.slug)) || allLessons[0];
  }, [isCompleted, allLessons, completedSet]);

  const nextLessonSlug = nextItem ? nextItem.lesson.slug : allLessons[0]?.lesson?.slug;
  const nextLessonTitle = nextItem ? nextItem.lesson.title : null;
  const nextModuleTitle = nextItem ? nextItem.moduleTitle : null;

  return (
    <div className="p-5 sm:p-7 lg:p-8 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-3 max-w-xl z-10 w-full md:w-auto">
        {isCompleted ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 text-[11px] font-semibold tracking-wide uppercase">
            <Trophy className="w-3.5 h-3.5 text-green-400" />
            <span>Course Completed 🎉</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/90 border border-white/10 text-[11px] font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            <span>Resume where you left off</span>
          </div>
        )}

        <h2 className="font-display text-[20px] sm:text-[24px] lg:text-[26px] font-bold text-white leading-snug">
          {course.title}
        </h2>

        {isCompleted ? (
          <p className="text-[14px] text-neutral-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span>You&apos;ve completed all {totalLessons} lessons in this course!</span>
          </p>
        ) : nextLessonTitle ? (
          <p className="text-[14px] text-neutral-300 flex items-center gap-2">
            <span className="font-medium text-white">Next:</span>
            <span>{nextLessonTitle}</span>
            {nextModuleTitle && (
              <span className="text-neutral-400 text-[12px]">({nextModuleTitle})</span>
            )}
          </p>
        ) : null}

        {/* Mini progress bar on dark card */}
        <div className="w-full max-w-md pt-2 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-neutral-300">
            <span>Course progress</span>
            <span className={isCompleted ? "font-semibold text-green-400" : "font-semibold text-primary-300"}>
              {percentage}% complete
            </span>
          </div>
          <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
            <div
              className={
                isCompleted
                  ? "h-full bg-green-500 rounded-full transition-all duration-500"
                  : "h-full bg-gradient-to-r from-primary-400 to-[#F97316] rounded-full transition-all duration-500"
              }
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="z-10 w-full md:w-auto shrink-0">
        {isCompleted ? (
          <Link
            href={`/courses/${course.slug}`}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg font-medium text-[14px] text-white bg-green-600 hover:bg-green-500 border border-green-500 shadow-[0_4px_14px_rgba(34,197,94,0.35)] transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Review Course</span>
          </Link>
        ) : (
          <Link
            href={nextLessonSlug ? `/lessons/${nextLessonSlug}` : `/courses/${course.slug}`}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg font-medium text-[14px] text-white bg-gradient-to-b from-[#E76D42] to-[#D9572B] border border-[#D45428] shadow-[0_4px_14px_rgba(225,98,55,0.4)] hover:from-[#DF6236] hover:to-[#CE4E22] transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" strokeWidth={0} />
            <span>Resume Lesson</span>
          </Link>
        )}
      </div>
    </div>
  );
}
