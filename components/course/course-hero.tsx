import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart2,
  Clock,
  Layers,
  Users,
  ArrowRight,
  Bookmark,
} from "lucide-react";
import { formatDurationHoursMinutes, formatStudentCount } from "@/lib/format";
import { urlFor } from "@/sanity/lib/image";

interface CourseCoverImage {
  asset?: {
    _id?: string;
    url?: string;
    metadata?: {
      lqip?: string;
      dimensions?: {
        width?: number;
        height?: number;
      };
    };
  };
  alt?: string | null;
}

interface CourseHeroProps {
  title: string;
  summary?: string | null;
  coverImage?: CourseCoverImage | null;
  level?: string | null;
  popular?: boolean | null;
  studentCount?: number | null;
  totalSeconds: number;
  moduleCount: number;
  firstLessonSlug?: string | null;
}

/**
 * Fallback stylish branded icon when Sanity image isn't loaded.
 * Renders a Next.js logo with gradient styling as a placeholder.
 */
function NextjsFallbackCover() {
  return (
    <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/40 via-transparent to-black/60 pointer-events-none" />
      <svg
        viewBox="0 0 180 180"
        className="w-4/5 h-4/5 text-white filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        fill="none"
      >
        <circle cx="90" cy="90" r="86" fill="#000" stroke="#262626" strokeWidth="2" />
        <path
          d="M123.5 131.5L63.5 56.5H52.5V124H63.5V76.8L112.5 131.5H123.5Z"
          fill="url(#paint0_linear)"
        />
        <rect x="112.5" y="56.5" width="11" height="41.5" fill="url(#paint1_linear)" />
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="88"
            y1="56.5"
            x2="108"
            y2="131.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="0.6" stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient
            id="paint1_linear"
            x1="118"
            y1="56.5"
            x2="118"
            y2="98"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Displays the course header section with cover image, title, metadata, and action buttons.
 * Shows course popularity badge, level, duration, module count, and student count.
 */
export function CourseHero({
  title,
  summary,
  coverImage,
  level,
  popular,
  studentCount,
  totalSeconds,
  moduleCount,
  firstLessonSlug,
}: CourseHeroProps) {
  const formattedDuration = formatDurationHoursMinutes(totalSeconds);
  const formattedStudents = formatStudentCount(studentCount || 0);
  const continueHref = firstLessonSlug ? `/lessons/${firstLessonSlug}` : "#";

  // Build Sanity image URL if available
  const imageUrl = coverImage?.asset?.url
    ? urlFor(coverImage).width(800).height(800).fit("crop").url()
    : null;

  return (
    <section className="w-full flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12 mb-12 lg:mb-14">
      {/* ── Left: Course Cover Thumbnail ── */}
      <div className="w-full max-w-[240px] sm:max-w-[270px] aspect-square rounded-2xl bg-black border border-neutral-800 shadow-[0_12px_36px_rgba(0,0,0,0.18)] overflow-hidden shrink-0 flex items-center justify-center relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={coverImage?.alt || title}
            fill
            sizes="(max-width: 768px) 240px, 270px"
            className="object-cover"
            priority
          />
        ) : (
          <NextjsFallbackCover />
        )}
      </div>

      {/* ── Right: Course Details & Actions ── */}
      <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left min-w-0">
        {/* Popular Badge */}
        {popular && (
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-[6px] bg-[#FFF6F0] border border-[#FCDCC9] shadow-[0_1px_2px_rgba(225,98,55,0.05)] mb-3">
            <span className="text-[10px] font-bold tracking-[0.14em] text-[#C24F1A] uppercase">
              POPULAR
            </span>
          </div>
        )}

        {/* Course Title */}
        <h1 className="font-display text-[32px] sm:text-[40px] lg:text-[46px] font-bold text-neutral-900 tracking-tight leading-[1.12] mb-3.5">
          {title}
        </h1>

        {/* Course Marketing Summary */}
        {summary && (
          <p className="text-[15px] sm:text-[16px] text-neutral-600 leading-relaxed mb-6 max-w-[620px]">
            {summary}
          </p>
        )}

        {/* Metadata Chips Row */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2.5 text-[13px] text-neutral-600 mb-8">
          {/* Level */}
          {level && (
            <div className="flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-neutral-400 shrink-0" strokeWidth={1.75} />
              <span className="capitalize">{level}</span>
            </div>
          )}

          {/* Total Duration */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-neutral-400 shrink-0" strokeWidth={1.75} />
            <span>{formattedDuration}</span>
          </div>

          {/* Module Count */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-neutral-400 shrink-0" strokeWidth={1.75} />
            <span>{moduleCount} modules</span>
          </div>

          {/* Student Count */}
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-neutral-400 shrink-0" strokeWidth={1.75} />
            <span>{formattedStudents} students</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          {/* Primary CTA */}
          <Link
            href={continueHref}
            className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-[8px] font-medium text-[14px] text-white bg-gradient-to-b from-[#E76D42] to-[#D9572B] border border-[#D45428] shadow-[0_4px_14px_rgba(225,98,55,0.38)] hover:from-[#DF6236] hover:to-[#CE4E22] hover:shadow-[0_6px_18px_rgba(225,98,55,0.48)] active:translate-y-px transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 cursor-pointer"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
          </Link>

          {/* Bookmark Button */}
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 h-[44px] px-5 rounded-[8px] font-medium text-[14px] text-neutral-700 bg-white border border-[#EBE4DC] hover:bg-neutral-50 hover:border-neutral-300 shadow-sm active:translate-y-px transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 cursor-pointer"
          >
            <Bookmark className="w-4 h-4 text-neutral-500" strokeWidth={1.75} aria-hidden="true" />
            <span>Bookmark</span>
          </button>
        </div>
      </div>
    </section>
  );
}
