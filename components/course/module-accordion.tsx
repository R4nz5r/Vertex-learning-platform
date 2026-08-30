"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, PlayCircle } from "lucide-react";
import { formatDurationHoursMinutes, formatDurationMinutesSeconds } from "@/lib/format";

export interface AccordionLesson {
  _id: string;
  title: string;
  slug: string;
  duration?: number;
  freePreview?: boolean;
}

export interface AccordionModule {
  _key: string;
  title: string;
  summary?: string;
  lessons?: AccordionLesson[];
}

interface ModuleAccordionProps {
  modules: AccordionModule[];
  initialVisibleCount?: number;
}

export function ModuleAccordion({
  modules,
  initialVisibleCount = 6,
}: ModuleAccordionProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    // Keep first module open by default
    return new Set(modules.length > 0 ? [modules[0]._key || "0"] : []);
  });
  const [showAll, setShowAll] = useState(false);

  const toggleModule = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const hasMore = modules.length > initialVisibleCount;
  const visibleModules = showAll || !hasMore
    ? modules
    : modules.slice(0, initialVisibleCount);

  return (
    <div className="w-full flex flex-col gap-3">
      {visibleModules.map((moduleItem, modIdx) => {
        const modKey = moduleItem._key || String(modIdx);
        const isExpanded = expandedKeys.has(modKey);
        const moduleNumber = modIdx + 1;

        // Calculate module duration from its lessons
        const moduleSeconds = (moduleItem.lessons || []).reduce(
          (acc, l) => acc + (l.duration || 0),
          0
        );
        const formattedModuleDuration = formatDurationHoursMinutes(moduleSeconds);

        return (
          <div
            key={modKey}
            className="w-full rounded-xl border border-[#EBE4DC] bg-white transition-all overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            {/* ── Module Header Button ── */}
            <button
              type="button"
              onClick={() => toggleModule(modKey)}
              aria-expanded={isExpanded}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-neutral-50/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset cursor-pointer"
            >
              <div className="flex items-center gap-4 sm:gap-5 min-w-0 pr-4">
                {/* Module Number Circle */}
                <div className="w-8 h-8 rounded-full border border-neutral-200 bg-neutral-50/50 flex items-center justify-center shrink-0">
                  <span className="text-[13px] font-semibold text-neutral-800">
                    {moduleNumber}
                  </span>
                </div>

                {/* Module Title & Summary */}
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-neutral-900 leading-snug">
                    {moduleItem.title}
                  </h3>
                  {moduleItem.summary && (
                    <p className="text-[13px] text-neutral-500 line-clamp-1 mt-0.5">
                      {moduleItem.summary}
                    </p>
                  )}
                </div>
              </div>

              {/* Module Duration & Chevron */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[13px] text-neutral-500 font-medium hidden sm:inline">
                  {formattedModuleDuration}
                </span>
                <span className="text-neutral-400">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5" aria-hidden="true" />
                  )}
                </span>
              </div>
            </button>

            {/* ── Expanded Lessons List ── */}
            {isExpanded && moduleItem.lessons && moduleItem.lessons.length > 0 && (
              <div className="border-t border-[#F2ECE4] bg-[#FAFAF9] px-4 sm:px-6 py-2 divide-y divide-neutral-200/50">
                {moduleItem.lessons.map((lesson, lessonIdx) => {
                  const lessonNumber = `${moduleNumber}.${lessonIdx + 1}`;
                  const lessonDuration = formatDurationMinutesSeconds(lesson.duration || 0);

                  return (
                    <div
                      key={lesson._id || lesson.slug || lessonIdx}
                      className="py-3 flex items-center justify-between gap-4 text-neutral-700 hover:text-neutral-900 transition-colors group"
                    >
                      <Link
                        href={`/lessons/${lesson.slug}`}
                        className="flex items-center gap-3 min-w-0 flex-1 group-hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm"
                      >
                        <PlayCircle className="w-4 h-4 text-neutral-400 group-hover:text-primary-500 shrink-0 transition-colors" />
                        <span className="text-[12.5px] font-medium text-neutral-400 shrink-0">
                          {lessonNumber}
                        </span>
                        <span className="text-[14px] font-medium text-neutral-800 group-hover:text-primary-600 truncate transition-colors">
                          {lesson.title}
                        </span>
                      </Link>

                      <div className="flex items-center gap-3 shrink-0">
                        {lesson.freePreview && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Free preview
                          </span>
                        )}
                        <span className="text-[12.5px] text-neutral-400 font-normal">
                          {lessonDuration}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Show All Modules Button ── */}
      {hasMore && (
        <div className="w-full flex justify-center mt-2">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#EBE4DC] bg-white text-[13.5px] font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
          >
            <span>{showAll ? "Show fewer modules" : `Show all ${modules.length} modules`}</span>
            {showAll ? (
              <ChevronUp className="w-4 h-4 text-neutral-500" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-500" aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
