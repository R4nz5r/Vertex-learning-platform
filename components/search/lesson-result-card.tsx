"use client";

import React from "react";
import Link from "next/link";
import { Check, ExternalLink, ChevronRight, FileText } from "lucide-react";
import { CourseTechIcon } from "./course-icons";
import type { SearchResult } from "@/lib/search/types";
import posthog from "posthog-js";

interface LessonResultCardProps {
  result: SearchResult;
  query?: string;
  rank?: number;
}

export function LessonResultCard({ result, query = "", rank = 1 }: LessonResultCardProps) {
  // Extract key points or provide informative bullets
  const keyPoints =
    result.keyPoints && result.keyPoints.length > 0
      ? result.keyPoints.slice(0, 3)
      : [
          "Core concepts & patterns",
          "Practical implementation steps",
          "Production best practices",
        ];

  const handleResultClick = () => {
    posthog.capture("search_result_clicked", {
      query_length: query.length,
      result_type: "lesson",
      lesson_title: result.lessonTitle || result.moduleTitle,
      lesson_slug: result.lessonSlug,
      course_title: result.courseTitle,
      course_slug: result.courseSlug,
      module_title: result.moduleTitle,
      rank: rank ?? result.rank ?? 1,
    });
  };

  return (
    <div className="group bg-white rounded-2xl border border-[#EBE4DC] p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-neutral-300 transition-all duration-150 flex flex-col md:flex-row gap-4 sm:gap-5 items-stretch">
      {/* ── Left Key Points Column ── */}
      <Link
        href={result.href}
        onClick={handleResultClick}
        className="w-full md:w-[260px] min-h-[155px] flex-shrink-0 bg-[#F9F8F6] rounded-xl p-4 flex flex-col justify-between border border-[#EFECE6] group/points focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <div className="flex items-start gap-2.5">
          <div className="shrink-0 mt-0.5 text-neutral-400">
            <FileText className="w-4 h-4" />
          </div>

          <ul className="space-y-1.5 text-[12px] text-neutral-600 font-normal leading-tight list-none p-0 m-0">
            {keyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-neutral-400 font-bold">•</span>
                <span className="line-clamp-1">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom dark checkmark indicator */}
        <div className="self-end mt-2">
          <div className="w-5 h-5 rounded-full bg-[#1E293B] text-white flex items-center justify-center shadow-xs">
            <Check className="w-3 h-3 stroke-[2.5]" />
          </div>
        </div>
      </Link>

      {/* ── Right Content Column ── */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Top Row: Course Icon + Title + LESSON Badge */}
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <CourseTechIcon
                courseTitle={result.courseTitle}
                courseSlug={result.courseSlug}
                coverImage={result.courseCoverImage}
                size={16}
              />
              <span className="text-[12px] font-medium text-neutral-600 truncate">
                {result.courseTitle}
              </span>
            </div>

            <span className="shrink-0 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase border border-[#C7D2FE] text-[#4F46E5] bg-[#EEF2FF]">
              LESSON
            </span>
          </div>

          {/* Title */}
          <Link
            href={result.href}
            onClick={handleResultClick}
            className="block text-[17px] font-bold text-neutral-900 leading-snug hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:underline"
          >
            {result.lessonTitle || result.moduleTitle}
          </Link>

          {/* Description / Summary */}
          <p className="text-[13px] text-neutral-500 leading-relaxed line-clamp-2 mt-1">
            {result.summary || result.reason || "Explore comprehensive implementation steps and production workflows."}
          </p>
        </div>

        {/* Bottom Metadata Row */}
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between gap-3 text-[12px] text-neutral-500">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-medium text-neutral-500">Module {result.moduleIndex}</span>
          </div>

          <Link
            href={result.href}
            onClick={handleResultClick}
            className="shrink-0 inline-flex items-center gap-1 text-[12px] font-semibold text-primary-500 hover:text-primary-600 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm"
          >
            <span>View lesson</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
