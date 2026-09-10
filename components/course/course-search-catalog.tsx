"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, BookOpen, ArrowRight } from "lucide-react";
import { CourseCard } from "@/components/cards/course-card";
import { formatDurationHoursMinutes } from "@/lib/format";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils";

export interface CourseCatalogItem {
  _id: string;
  title: string;
  slug: string;
  summary?: string | null;
  coverImage?: {
    asset?: {
      _id?: string;
      url?: string;
    };
    alt?: string | null;
  } | null;
  level?: string | null;
  price?: number | null;
  popular?: boolean | null;
  studentCount?: number | null;
  moduleCount?: number | null;
  lessonCount?: number | null;
  totalDuration?: number | null;
}

interface CourseSearchCatalogProps {
  courses: CourseCatalogItem[];
}

/** Next.js logo icon */
function NextjsIcon() {
  return (
    <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center shadow-sm shrink-0">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10z"
          fill="#000"
        />
        <path
          d="M16.5 17.5L8.5 7.5H7v9h1.5V10.2l7 8.8h1z"
          fill="#fff"
        />
        <rect x="15" y="7.5" width="1.5" height="5.5" fill="#fff" />
      </svg>
    </div>
  );
}

/** Docker logo icon */
function DockerIcon() {
  return (
    <div className="w-12 h-10 flex items-center justify-start shrink-0">
      <svg width="46" height="32" viewBox="0 0 46 32" fill="none">
        <rect x="14" y="2" width="3.8" height="3.2" rx="0.5" fill="#2496ED" stroke="#0F172A" strokeWidth="0.8" />
        <rect x="18.5" y="2" width="3.8" height="3.2" rx="0.5" fill="#2496ED" stroke="#0F172A" strokeWidth="0.8" />
        <rect x="9.5" y="6" width="3.8" height="3.2" rx="0.5" fill="#2496ED" stroke="#0F172A" strokeWidth="0.8" />
        <rect x="14" y="6" width="3.8" height="3.2" rx="0.5" fill="#2496ED" stroke="#0F172A" strokeWidth="0.8" />
        <rect x="18.5" y="6" width="3.8" height="3.2" rx="0.5" fill="#2496ED" stroke="#0F172A" strokeWidth="0.8" />
        <rect x="23" y="6" width="3.8" height="3.2" rx="0.5" fill="#2496ED" stroke="#0F172A" strokeWidth="0.8" />
        <rect x="5" y="10" width="3.8" height="3.2" rx="0.5" fill="#2496ED" stroke="#0F172A" strokeWidth="0.8" />
        <rect x="9.5" y="10" width="3.8" height="3.2" rx="0.5" fill="#2496ED" stroke="#0F172A" strokeWidth="0.8" />
        <rect x="14" y="10" width="3.8" height="3.2" rx="0.5" fill="#2496ED" stroke="#0F172A" strokeWidth="0.8" />
        <rect x="18.5" y="10" width="3.8" height="3.2" rx="0.5" fill="#2496ED" stroke="#0F172A" strokeWidth="0.8" />
        <rect x="23" y="10" width="3.8" height="3.2" rx="0.5" fill="#2496ED" stroke="#0F172A" strokeWidth="0.8" />
        <path
          d="M2 15C2 14.5 2.5 14 3.5 14C5 14 6 15 7.5 15C9 15 28 15 31 16.5C34 18 36.5 21 36.5 24C36.5 26.5 34 29 27 29C17 29 7 28 4.5 23.5C3.2 21.2 2.5 18 2 15Z"
          fill="#2496ED"
          stroke="#0F172A"
          strokeWidth="1"
        />
        <path
          d="M31 16.5C35 15 39 12 42 8C42 12 40 16 43 18C40 19 36 19 33.5 18"
          fill="#2496ED"
          stroke="#0F172A"
          strokeWidth="1"
        />
        <circle cx="9" cy="20" r="1" fill="#fff" />
      </svg>
    </div>
  );
}

/** TypeScript logo icon */
function TypeScriptIcon() {
  return (
    <div className="w-10 h-10 rounded-lg bg-[#3178C6] flex items-center justify-center shadow-sm shrink-0">
      <span className="text-white font-bold text-base tracking-tight font-sans">TS</span>
    </div>
  );
}

function resolveCourseIcon(course: CourseCatalogItem) {
  const imageUrl = course.coverImage?.asset?.url
    ? urlFor(course.coverImage).width(80).height(80).url()
    : course.slug
    ? `https://picsum.photos/seed/vertex-course-${course.slug}/80/80`
    : null;

  if (imageUrl) {
    return (
      <div className="w-10 h-10 rounded-lg overflow-hidden relative shadow-sm border border-neutral-200/60 shrink-0">
        <Image
          src={imageUrl}
          alt={course.coverImage?.alt || course.title}
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const title = (course.title || "").toLowerCase();
  const slug = (course.slug || "").toLowerCase();

  if (title.includes("next.js") || slug.includes("nextjs")) {
    return <NextjsIcon />;
  }
  if (title.includes("docker") || slug.includes("docker") || title.includes("devops")) {
    return <DockerIcon />;
  }
  if (title.includes("typescript") || slug.includes("typescript")) {
    return <TypeScriptIcon />;
  }
  return null;
}

const LEVEL_OPTIONS = [
  { label: "All Levels", value: "all" },
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
] as const;

type LevelFilter = (typeof LEVEL_OPTIONS)[number]["value"];

export function CourseSearchCatalog({ courses }: CourseSearchCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>("all");

  // Filtered courses based on query and selected level
  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return courses.filter((course) => {
      // Level filter
      if (selectedLevel !== "all") {
        const courseLevel = (course.level || "").toLowerCase();
        if (courseLevel !== selectedLevel) {
          return false;
        }
      }

      // Query filter
      if (!query) {
        return true;
      }

      const titleMatch = (course.title || "").toLowerCase().includes(query);
      const summaryMatch = (course.summary || "").toLowerCase().includes(query);
      const slugMatch = (course.slug || "").toLowerCase().includes(query);
      const levelMatch = (course.level || "").toLowerCase().includes(query);

      return titleMatch || summaryMatch || slugMatch || levelMatch;
    });
  }, [courses, searchQuery, selectedLevel]);

  const handleClear = () => {
    setSearchQuery("");
    setSelectedLevel("all");
  };

  const isFiltered = searchQuery.trim().length > 0 || selectedLevel !== "all";

  return (
    <div className="w-full flex flex-col">
      {/* ── Search Bar & Filter Controls ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-xl">
          <label htmlFor="course-search-input" className="sr-only">
            Search courses
          </label>
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="course-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by title, topic, or keyword..."
            className="w-full h-11 pl-10 pr-10 text-[14.5px] text-neutral-800 placeholder:text-neutral-400 bg-white border border-[#E5DFD7] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] outline-none transition-all duration-150 focus:border-[#FB923C] focus:ring-2 focus:ring-[#FB923C]/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Level Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {LEVEL_OPTIONS.map((opt) => {
            const isActive = selectedLevel === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedLevel(opt.value)}
                className={cn(
                  "px-3 py-1.5 text-[12.5px] font-medium rounded-lg whitespace-nowrap transition-all duration-150 border",
                  isActive
                    ? "bg-[#C24F1A] text-white border-[#C24F1A] shadow-sm"
                    : "bg-white text-neutral-600 border-[#E5DFD7] hover:border-neutral-400 hover:text-neutral-900"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Status / Count Indicator ── */}
      <div className="flex items-center justify-between mb-6 text-[13.5px] text-neutral-500">
        <div>
          {isFiltered ? (
            <span>
              Showing <strong className="text-neutral-800 font-semibold">{filteredCourses.length}</strong> of{" "}
              {courses.length} courses
            </span>
          ) : (
            <span>
              <strong className="text-neutral-800 font-semibold">{courses.length}</strong> courses available
            </span>
          )}
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[13px] text-[#C24F1A] hover:underline font-medium cursor-pointer"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* ── Courses Grid or Empty State ── */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredCourses.map((course) => {
            const formattedDuration = formatDurationHoursMinutes(course.totalDuration || 0);
            const customIcon = resolveCourseIcon(course);
            const formattedLevel = course.level
              ? course.level.charAt(0).toUpperCase() + course.level.slice(1)
              : "Intermediate";

            return (
              <CourseCard
                key={course._id || course.slug}
                icon={customIcon}
                logoChar={!customIcon ? (course.title || "C").charAt(0) : undefined}
                title={course.title}
                description={course.summary || ""}
                level={formattedLevel}
                duration={formattedDuration}
                modules={course.moduleCount || 0}
                href={`/courses/${course.slug}`}
              />
            );
          })}
        </div>
      ) : (
        <div className="w-full bg-white border border-[#EBE4DC] rounded-2xl p-10 sm:p-14 flex flex-col items-center justify-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] my-4">
          <div className="w-12 h-12 rounded-full bg-[#FFF4ED] border border-[#FCDCC9] flex items-center justify-center text-[#C24F1A] mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-display text-[20px] font-bold text-neutral-900 mb-2">
            No courses found
          </h3>
          <p className="text-[14.5px] text-neutral-500 max-w-md mb-6 leading-relaxed">
            We couldn’t find any courses matching &ldquo;
            <span className="font-medium text-neutral-700">{searchQuery}</span>
            &rdquo;{selectedLevel !== "all" ? ` with level "${selectedLevel}"` : ""}. Try adjusting your keywords or clearing filters.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-[13.5px] font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
            >
              Clear filters
            </button>

            {searchQuery.trim() && (
              <Link
                href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[13.5px] font-semibold text-white bg-[#C24F1A] hover:bg-[#a94314] rounded-xl transition-colors shadow-sm"
              >
                <span>Search video transcripts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
