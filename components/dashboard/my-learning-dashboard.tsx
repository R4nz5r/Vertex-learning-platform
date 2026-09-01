"use client";

import React, { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  GraduationCap,
  Sparkles,
  Trophy,
} from "lucide-react";
import { CourseCard } from "@/components/cards/course-card";
import { MyLearningCard, type MyLearningModule } from "@/components/cards/my-learning-card";
import { MyLearningResumeBanner } from "@/components/cards/my-learning-resume-banner";
import { formatDurationHoursMinutes } from "@/lib/format";
import { getStoredProgress, PROGRESS_EVENT_NAME } from "@/lib/progress";
import { useCourseBookmarks } from "@/lib/bookmarks";

export interface DashboardLesson {
  _id: string;
  title: string;
  slug: string;
  duration?: number | null;
}

export interface DashboardModule {
  _key: string;
  title: string;
  summary?: string | null;
  lessons?: DashboardLesson[] | null;
}

export interface DashboardCourse {
  _id: string;
  title: string;
  slug: string;
  summary?: string | null;
  level?: string | null;
  duration?: string | null;
  moduleCount?: number | null;
  lessonCount?: number | null;
  totalDuration?: number | null;
  modules?: DashboardModule[] | null;
  icon?: React.ReactNode;
}

interface MyLearningDashboardProps {
  allCourses?: DashboardCourse[];
  inProgressCourses?: DashboardCourse[];
  recommendedCourses?: DashboardCourse[];
  defaultPrecedingLessonsMap?: Record<string, string[]>;
}

type FilterType = "all" | "in-progress" | "completed" | "bookmarked";

export function MyLearningDashboard({
  allCourses,
  inProgressCourses: propInProgress,
  recommendedCourses: propRecommended,
  defaultPrecedingLessonsMap = {},
}: MyLearningDashboardProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const bookmarkedSlugs = useCourseBookmarks();

  // Subscribe to progress storage changes for reactive dashboard updates
  const progressVersion = useSyncExternalStore(
    (callback: () => void) => {
      if (typeof window === "undefined") return () => {};
      window.addEventListener(PROGRESS_EVENT_NAME, callback);
      window.addEventListener("storage", callback);
      return () => {
        window.removeEventListener(PROGRESS_EVENT_NAME, callback);
        window.removeEventListener("storage", callback);
      };
    },
    () => {
      if (typeof window === "undefined") return "0";
      return Object.keys(localStorage).map((k) => `${k}:${localStorage.getItem(k)}`).join("|");
    },
    () => "0"
  );

  const allAvailableCourses = useMemo(() => {
    if (allCourses && allCourses.length > 0) {
      return allCourses;
    }
    const map = new Map<string, DashboardCourse>();
    (propInProgress || []).forEach((c) => map.set(c.slug, c));
    (propRecommended || []).forEach((c) => {
      if (!map.has(c.slug)) map.set(c.slug, c);
    });
    return Array.from(map.values());
  }, [allCourses, propInProgress, propRecommended]);

  const bookmarkedCourses = useMemo(() => {
    return allAvailableCourses.filter((c) => bookmarkedSlugs.includes(c.slug));
  }, [allAvailableCourses, bookmarkedSlugs]);

  const progressMap = useMemo(() => {
    // progressVersion dependency triggers recomputation when storage updates
    void progressVersion;

    const map = new Map<string, { isCompleted: boolean; isInProgress: boolean; completedLessonsCount: number; totalLessons: number }>();

    allAvailableCourses.forEach((c) => {
      const allL = (c.modules || []).flatMap((m) => m.lessons || []).filter((l) => Boolean(l?.slug));
      const total = allL.length > 0 ? allL.length : (c.lessonCount || 1);
      const prog = getStoredProgress(c.slug, defaultPrecedingLessonsMap[c.slug] || []);
      const set = new Set(prog.completedLessons);
      const isComp = prog.isCourseCompleted || (allL.length > 0 && allL.every((l) => set.has(l.slug))) || (allL.length === 0 && set.size >= total);
      const inProg = !isComp && (set.size > 0 || Boolean(prog.lastWatchedSlug));
      const count = isComp ? total : Math.min(total, set.size);

      map.set(c.slug, { isCompleted: isComp, isInProgress: inProg, completedLessonsCount: count, totalLessons: total });
    });

    return map;
  }, [allAvailableCourses, defaultPrecedingLessonsMap, progressVersion]);

  // Derive enrolled / active courses from actual learner progress
  const { activeCourses, recommendedCoursesList } = useMemo(() => {
    const active: DashboardCourse[] = [];
    const recommended: DashboardCourse[] = [];

    allAvailableCourses.forEach((c) => {
      const data = progressMap.get(c.slug);
      if (data && (data.isCompleted || data.isInProgress)) {
        active.push(c);
      } else {
        recommended.push(c);
      }
    });

    // If no progress has been recorded yet, present initial courses as active
    if (active.length === 0 && allAvailableCourses.length > 0) {
      const initial = propInProgress && propInProgress.length > 0 ? propInProgress : allAvailableCourses.slice(0, 2);
      const initialSlugs = new Set(initial.map((c) => c.slug));
      return {
        activeCourses: initial,
        recommendedCoursesList: allAvailableCourses.filter((c) => !initialSlugs.has(c.slug)),
      };
    }

    return {
      activeCourses: active,
      recommendedCoursesList: propRecommended && propRecommended.length > 0 ? propRecommended : recommended,
    };
  }, [allAvailableCourses, progressMap, propInProgress, propRecommended]);

  // Aggregate stats across all active courses
  const { completedCoursesCount, inProgressCoursesCount, totalCompletedLessons } = useMemo(() => {
    let completedCourses = 0;
    let inProgress = 0;
    let completedLessons = 0;

    activeCourses.forEach((c) => {
      const data = progressMap.get(c.slug);
      if (data) {
        if (data.isCompleted) {
          completedCourses += 1;
        } else {
          inProgress += 1;
        }
        completedLessons += data.completedLessonsCount;
      }
    });

    return {
      completedCoursesCount: completedCourses,
      inProgressCoursesCount: inProgress,
      totalCompletedLessons: completedLessons,
    };
  }, [activeCourses, progressMap]);

  // Filtered course items
  const filteredCourses = useMemo(() => {
    if (filter === "all") return activeCourses;
    if (filter === "bookmarked") return bookmarkedCourses;
    return activeCourses.filter((c) => {
      const data = progressMap.get(c.slug);
      if (filter === "completed") return data?.isCompleted;
      if (filter === "in-progress") return !data?.isCompleted;
      return true;
    });
  }, [activeCourses, filter, progressMap, bookmarkedCourses]);

  const primaryCourse = activeCourses[0] || allAvailableCourses[0];
  const primaryDefaults = primaryCourse ? defaultPrecedingLessonsMap[primaryCourse.slug] || [] : [];

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* ── 4-Card Stats Summary Grid (Mobile-First 2x2 & Desktop 1x4) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {/* Stat 1: Courses In Progress */}
        <div className="p-3 sm:p-4 lg:p-5 h-[76px] sm:h-[86px] rounded-xl bg-white border border-neutral-200/80 shadow-[var(--shadow-sm)] flex items-center gap-2.5 sm:gap-3.5 overflow-hidden">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-primary-500 shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <p className="text-[9.5px] sm:text-[10.5px] lg:text-[11px] font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap truncate">
              In Progress
            </p>
            <p className="text-[16px] sm:text-[19px] lg:text-[21px] font-sans font-bold text-neutral-900 tracking-tight leading-tight whitespace-nowrap">
              {inProgressCoursesCount} {inProgressCoursesCount === 1 ? "Course" : "Courses"}
            </p>
          </div>
        </div>

        {/* Stat 2: Completed Courses */}
        <div className="p-3 sm:p-4 lg:p-5 h-[76px] sm:h-[86px] rounded-xl bg-white border border-neutral-200/80 shadow-[var(--shadow-sm)] flex items-center gap-2.5 sm:gap-3.5 overflow-hidden">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <p className="text-[9.5px] sm:text-[10.5px] lg:text-[11px] font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap truncate">
              Completed Courses
            </p>
            <p className="text-[16px] sm:text-[19px] lg:text-[21px] font-sans font-bold text-neutral-900 tracking-tight leading-tight whitespace-nowrap">
              {completedCoursesCount} {completedCoursesCount === 1 ? "Course" : "Courses"}
            </p>
          </div>
        </div>

        {/* Stat 3: Completed Lessons */}
        <div className="p-3 sm:p-4 lg:p-5 h-[76px] sm:h-[86px] rounded-xl bg-white border border-neutral-200/80 shadow-[var(--shadow-sm)] flex items-center gap-2.5 sm:gap-3.5 overflow-hidden">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center text-green-600 shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <p className="text-[9.5px] sm:text-[10.5px] lg:text-[11px] font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap truncate">
              Completed Lessons
            </p>
            <p className="text-[16px] sm:text-[19px] lg:text-[21px] font-sans font-bold text-neutral-900 tracking-tight leading-tight whitespace-nowrap">
              {totalCompletedLessons} Lessons
            </p>
          </div>
        </div>

        {/* Stat 4: Learning Time */}
        <div className="p-3 sm:p-4 lg:p-5 h-[76px] sm:h-[86px] rounded-xl bg-white border border-neutral-200/80 shadow-[var(--shadow-sm)] flex items-center gap-2.5 sm:gap-3.5 overflow-hidden">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <p className="text-[9.5px] sm:text-[10.5px] lg:text-[11px] font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap truncate">
              Time Learned
            </p>
            <p className="text-[16px] sm:text-[19px] lg:text-[21px] font-sans font-bold text-neutral-900 tracking-tight leading-tight whitespace-nowrap">
              2h 45m
            </p>
          </div>
        </div>
      </div>

      {/* ── Resume Learning Hero Highlight Banner ── */}
      {primaryCourse && (
        <MyLearningResumeBanner
          course={primaryCourse}
          defaultPrecedingLessons={primaryDefaults}
        />
      )}

      {/* ── Enrolled Courses Section with Interactive Filter Tabs ── */}
      <section aria-labelledby="enrolled-courses-heading">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-primary-500" />
            <h2 id="enrolled-courses-heading" className="font-display text-[20px] sm:text-[24px] lg:text-[26px] font-bold text-neutral-900 tracking-tight">
              My Courses
            </h2>
          </div>

          {/* Filter Option Tabs */}
          <div className="w-full sm:w-auto flex items-center p-1 rounded-xl bg-white border border-neutral-200/90 shadow-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`flex-1 sm:flex-initial text-center whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-medium transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-[#FFF6F0] text-[#C24F1A] font-semibold shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              All ({activeCourses.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("in-progress")}
              className={`flex-1 sm:flex-initial text-center whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-medium transition-all cursor-pointer ${
                filter === "in-progress"
                  ? "bg-[#FFF6F0] text-[#C24F1A] font-semibold shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              In Progress ({inProgressCoursesCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("completed")}
              className={`flex-1 sm:flex-initial text-center whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-medium transition-all cursor-pointer ${
                filter === "completed"
                  ? "bg-emerald-50 text-emerald-700 font-semibold shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Completed ({completedCoursesCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("bookmarked")}
              className={`flex-1 sm:flex-initial text-center whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-medium transition-all cursor-pointer ${
                filter === "bookmarked"
                  ? "bg-[#FFF6F0] text-[#C24F1A] font-semibold shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Bookmarked ({bookmarkedCourses.length})
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {filteredCourses.map((course) => {
              const formattedDuration = formatDurationHoursMinutes(course.totalDuration || 0);
              const defaults = defaultPrecedingLessonsMap[course.slug] || [];

              return (
                <MyLearningCard
                  key={course._id || course.slug}
                  courseId={course._id}
                  title={course.title}
                  slug={course.slug}
                  summary={course.summary}
                  level={course.level}
                  duration={formattedDuration}
                  moduleCount={course.moduleCount || 0}
                  lessonCount={course.lessonCount || 0}
                  modules={course.modules as MyLearningModule[]}
                  defaultPrecedingLessons={defaults}
                  icon={course.icon}
                />
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white border border-neutral-200/80 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
              {filter === "bookmarked" ? (
                <Bookmark className="w-6 h-6 text-neutral-400" />
              ) : (
                <Sparkles className="w-6 h-6" />
              )}
            </div>
            <p className="text-[15px] font-semibold text-neutral-800">
              {filter === "completed"
                ? "No completed courses yet."
                : filter === "bookmarked"
                ? "No bookmarked courses yet."
                : "No active courses in this view."}
            </p>
            <p className="text-[13px] text-neutral-500 max-w-sm">
              {filter === "completed"
                ? "Finish all lessons in an active course to see it here!"
                : filter === "bookmarked"
                ? "Click the Bookmark button on any course page to save it for quick access here."
                : "Explore more courses below to start your next learning topic."}
            </p>
          </div>
        )}
      </section>

      {/* ── Recommended / Catalog Discovery Section ── */}
      {recommendedCoursesList.length > 0 && (
        <section aria-labelledby="recommended-courses-heading" className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-neutral-700" />
              <h2 id="recommended-courses-heading" className="font-display text-[20px] sm:text-[24px] lg:text-[26px] font-bold text-neutral-900 tracking-tight">
                More Courses to Explore
              </h2>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-primary-500 hover:text-primary-600 transition-colors"
            >
              <span>All courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {recommendedCoursesList.map((course) => {
              const formattedDuration = formatDurationHoursMinutes(course.totalDuration || 0);

              return (
                <CourseCard
                  key={course._id || course.slug}
                  icon={course.icon}
                  logoChar={!course.icon ? (course.title || "C").charAt(0) : undefined}
                  title={course.title}
                  description={course.summary || ""}
                  level={course.level || "Intermediate"}
                  duration={formattedDuration}
                  modules={course.moduleCount || 0}
                  href={`/courses/${course.slug}`}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
