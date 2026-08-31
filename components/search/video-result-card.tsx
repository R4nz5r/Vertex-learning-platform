"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, FileText, Folder, ChevronRight } from "lucide-react";
import { CourseTechIcon } from "./course-icons";
import { formatTimestamp } from "@/lib/format";
import { urlFor } from "@/sanity/lib/image";
import type { SearchResult } from "@/lib/search/types";
import posthog from "posthog-js";

interface VideoResultCardProps {
  result: SearchResult;
  query?: string;
  rank?: number;
}

/** Graphic placeholder thumbnail for courses when no image asset is available */
function ThumbnailBackground({ result }: { result: SearchResult }) {
  const course = (result.courseTitle || "").toLowerCase();
  const lesson = (result.lessonTitle || "").toLowerCase();

  let imgUrl: string | null = null;
  if (result.thumbnail) {
    try {
      imgUrl = urlFor(result.thumbnail).width(520).height(310).url();
    } catch {
      imgUrl = null;
    }
  }

  if (imgUrl) {
    return (
      <Image
        src={imgUrl}
        alt={result.lessonTitle || "Video preview"}
        width={260}
        height={155}
        className="w-full h-full object-cover"
      />
    );
  }

  // Code-style dark graphic preview
  if (course.includes("react") || lesson.includes("useeffect") || lesson.includes("hook")) {
    return (
      <div className="w-full h-full bg-[#0D1117] p-3 text-[9px] font-mono text-neutral-400 select-none flex flex-col justify-center overflow-hidden">
        <span className="text-[#E06C75]">useEffect<span className="text-white">{"(() => {"}</span></span>
        <span className="pl-2 text-[#61AFEF]">fetchData<span className="text-neutral-500">()</span>;</span>
        <span className="text-white">{"}, []);"}</span>
      </div>
    );
  }

  if (course.includes("node") || lesson.includes("rest api") || lesson.includes("endpoint")) {
    return (
      <div className="w-full h-full bg-[#0E1525] p-3 text-[9px] font-mono text-neutral-400 select-none flex items-center justify-around">
        <div className="border border-blue-400/40 rounded px-1.5 py-1 text-[8px] text-blue-300">Client</div>
        <span className="text-neutral-500">→</span>
        <div className="border border-emerald-400/40 rounded px-1.5 py-1 text-[8px] text-emerald-300">API</div>
        <span className="text-neutral-500">→</span>
        <div className="border border-amber-400/40 rounded px-1.5 py-1 text-[8px] text-amber-300">Database</div>
      </div>
    );
  }

  if (course.includes("next") || lesson.includes("server components") || lesson.includes("data fetching")) {
    return (
      <div className="w-full h-full bg-[#0B0F19] p-3 text-[9px] font-mono text-neutral-400 select-none flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-black border border-neutral-800 flex items-center justify-center mb-1">
          <span className="text-white font-bold text-lg font-sans">N</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#0B0F19] p-3 text-[9px] font-mono text-neutral-400 select-none flex flex-col justify-center">
      <span className="text-[#E5C07B]">const <span className="text-[#61AFEF]">data</span> = <span className="text-[#C678DD]">await</span> fetch(url);</span>
      <span className="text-neutral-500">{`// ${result.lessonTitle || "Lesson video"}`}</span>
    </div>
  );
}

export function VideoResultCard({ result, query = "", rank = 1 }: VideoResultCardProps) {
  // Format timestamp duration: use lesson duration
  const displayTimestamp = formatTimestamp(result.duration ?? 0);
  const watchFromLabel = result.startSeconds ? formatTimestamp(result.startSeconds) : "start";

  const handleResultClick = () => {
    posthog.capture("search_result_clicked", {
      query,
      result_type: "video",
      lesson_title: result.lessonTitle,
      lesson_slug: result.lessonSlug,
      course_title: result.courseTitle,
      course_slug: result.courseSlug,
      module_title: result.moduleTitle,
      start_seconds: result.startSeconds ?? 0,
      rank: rank ?? result.rank ?? 1,
    });
  };

  return (
    <div className="group bg-white rounded-2xl border border-[#EBE4DC] p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-neutral-300 transition-all duration-150 flex flex-col md:flex-row gap-4 sm:gap-5 items-stretch">
      {/* ── Left Thumbnail Column ── */}
      <Link
        href={result.href}
        onClick={handleResultClick}
        className="w-full md:w-[260px] h-[155px] flex-shrink-0 bg-[#0B0F19] rounded-xl overflow-hidden relative flex items-center justify-center cursor-pointer group/thumb focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <ThumbnailBackground result={result} />

        {/* Semi-translucent dark tint */}
        <div className="absolute inset-0 bg-black/25 group-hover/thumb:bg-black/15 transition-colors" />

        {/* Central Play Button */}
        <div className="absolute w-11 h-11 rounded-full bg-white/95 shadow-md flex items-center justify-center text-neutral-900 group-hover/thumb:scale-110 transition-transform">
          <Play className="w-4 h-4 fill-neutral-900 ml-0.5" strokeWidth={0} />
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-xs text-white text-[11px] font-mono font-medium px-2 py-0.5 rounded">
          {displayTimestamp}
        </div>
      </Link>

      {/* ── Right Content Column ── */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Top Row: Course Icon + Title + VIDEO Badge */}
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

            <span className="shrink-0 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase border border-[#FDBA74] text-[#EA580C] bg-[#FFF7ED]">
              VIDEO
            </span>
          </div>

          {/* Title */}
          <Link
            href={result.href}
            onClick={handleResultClick}
            className="block text-[17px] font-bold text-neutral-900 leading-snug hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:underline"
          >
            {result.lessonTitle}
          </Link>

          {/* Description / Match Reason */}
          <p className="text-[13px] text-neutral-500 leading-relaxed line-clamp-2 mt-1">
            {result.reason || result.summary || "Explore how this lesson covers key concepts and hands-on practices."}
          </p>
        </div>

        {/* Bottom Metadata Row */}
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between gap-3 text-[12px] text-neutral-500">
          <div className="flex items-center gap-1.5 truncate">
            <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>{result.label}</span>
            <span className="text-neutral-300">·</span>
            <Folder className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="truncate">{result.moduleTitle}</span>
          </div>

          <Link
            href={result.href}
            onClick={handleResultClick}
            className="shrink-0 inline-flex items-center gap-1 text-[12px] font-semibold text-primary-500 hover:text-primary-600 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm"
          >
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-primary-500 text-primary-500">
              <Play className="w-2 h-2 fill-primary-500 ml-0.5" strokeWidth={0} />
            </span>
            <span>Watch from {watchFromLabel}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
