"use client";

import React, { useState } from "react";
import {
  Bookmark,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Lightbulb,
  Signal,
  Users,
} from "lucide-react";

function GithubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import { LessonVideoPlayer } from "./lesson-video-player";
import { PortableTextRenderer } from "./portable-text-renderer";
import { formatDurationHoursMinutes, formatStudentCount } from "@/lib/format";
import { useCourseProgress, toggleLessonCompleted } from "@/lib/progress";
import { useLessonBookmark } from "@/lib/bookmarks";
import { useCourseStudentCount } from "@/lib/enrollment";
import posthog from "posthog-js";

export interface LessonResource {
  _key?: string;
  type?: string;
  title: string;
  description?: string;
  url: string;
}

interface LessonContentProps {
  lesson: {
    _id: string;
    title: string;
    slug: string;
    videoUrl?: string | null;
    duration?: number;
    freePreview?: boolean;
    studentCount?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notes?: any;
    keyPoints?: string[];
    proTip?: string | null;
    resources?: LessonResource[];
    thumbnailUrl?: string | null;
  };
  course: {
    _id: string;
    title: string;
    slug: string;
    level?: string;
    studentCount?: number;
  };
  moduleTitle: string;
  lessonNumberLabel: string; // e.g. "LESSON 5.1"
  startSeconds?: number;
  totalCourseLessons?: number;
}

export function LessonContent({
  lesson,
  course,
  moduleTitle,
  lessonNumberLabel,
  startSeconds,
  totalCourseLessons,
}: LessonContentProps) {
  const [activeTab, setActiveTab] = useState<"content" | "notes">("content");
  const { isBookmarked: bookmarked, toggle: handleBookmarkToggle } = useLessonBookmark(
    course.slug,
    lesson.slug,
    lesson.title
  );

  const { studentCount: liveStudents } = useCourseStudentCount(course.slug);
  const progress = useCourseProgress(course.slug);
  const isCompleted = progress.isCourseCompleted || progress.completedLessons.includes(lesson.slug);

  const formattedDuration = formatDurationHoursMinutes(lesson.duration || 0);
  const formattedStudentCount = formatStudentCount(liveStudents);
  const level = course.level || "Intermediate";

  const handleCompleteToggle = () => {
    toggleLessonCompleted(course.slug, lesson.slug, totalCourseLessons);
  };

  const getResourceIcon = (type?: string, title?: string) => {
    const lowerType = (type || "").toLowerCase();
    const lowerTitle = (title || "").toLowerCase();

    if (
      lowerType.includes("github") ||
      lowerType.includes("repo") ||
      lowerTitle.includes("repository") ||
      lowerTitle.includes("github")
    ) {
      return <GithubIcon className="w-5 h-5 text-neutral-800" />;
    }
    if (
      lowerType.includes("doc") ||
      lowerType.includes("guide") ||
      lowerTitle.includes("documentation") ||
      lowerTitle.includes("guide")
    ) {
      return <FileText className="w-5 h-5 text-primary-600" />;
    }
    return <Globe className="w-5 h-5 text-neutral-600" />;
  };

  return (
    <div className="w-full flex flex-col">
      {/* ── Breadcrumbs ── */}
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "All Courses", href: "/courses" },
            { label: course.title, href: `/courses/${course.slug}` },
            { label: moduleTitle },
            { label: lesson.title },
          ]}
        />
      </div>

      {/* ── Lesson Header ── */}
      <div className="mb-6">
        {/* Lesson Badge */}
        <div className="mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11.5px] font-bold tracking-wider text-primary-700 bg-[#FFF1EA] border border-[#FFE2D4] uppercase">
            {lessonNumberLabel}
          </span>
        </div>

        {/* Title & Actions Button */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-[40px] font-bold text-neutral-900 tracking-tight leading-[1.15]">
            {lesson.title}
          </h1>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCompleteToggle}
              aria-label={isCompleted ? "Mark lesson as incomplete" : "Mark lesson as complete"}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[13px] font-semibold transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                isCompleted
                  ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100/70"
                  : "bg-white border-[#EBE4DC] text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300"
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 ${isCompleted ? "text-green-600 fill-green-100" : "text-neutral-400"}`}
              />
              <span>{isCompleted ? "Completed" : "Mark Complete"}</span>
            </button>

            <button
              type="button"
              onClick={handleBookmarkToggle}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark lesson"}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                bookmarked
                  ? "bg-primary-50 border-primary-300 text-primary-600"
                  : "bg-white border-[#EBE4DC] text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
              }`}
            >
              <Bookmark
                className={`w-5 h-5 ${bookmarked ? "fill-current" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Short Summary Description */}
        <p className="text-[15.5px] text-neutral-600 max-w-3xl leading-relaxed mb-4">
          Learn how Next.js handles data fetching and caching in both Server and
          Client Components.
        </p>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-5 text-[13.5px] text-neutral-600 font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span>{formattedDuration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Signal className="w-4 h-4 text-neutral-400" />
            <span>{level}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-neutral-400" />
            <span>
              {formattedStudentCount} {liveStudents === 1 ? "student" : "students"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Video Player Embed ── */}
      <div className="mb-8">
        <LessonVideoPlayer
          videoUrl={lesson.videoUrl}
          lessonTitle={lesson.title}
          lessonSlug={lesson.slug}
          duration={lesson.duration}
          startSeconds={startSeconds}
          courseTitle={course.title}
          courseSlug={course.slug}
          totalCourseLessons={totalCourseLessons}
          thumbnailUrl={lesson.thumbnailUrl}
        />
      </div>

      {/* ── Content / Notes Tabs ── */}
      <div className="border-b border-[#EBE4DC] mb-8">
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`pb-3 text-[15px] font-semibold transition-all relative cursor-pointer focus-visible:outline-none ${
              activeTab === "content"
                ? "text-primary-600"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <span>Lesson Content</span>
            {activeTab === "content" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`pb-3 text-[15px] font-semibold transition-all relative cursor-pointer focus-visible:outline-none ${
              activeTab === "notes"
                ? "text-primary-600"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <span>Notes</span>
            {activeTab === "notes" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* ── Tab Content: Lesson Content ── */}
      {activeTab === "content" && (
        <div className="space-y-8">
          {/* ── Overview Section ── */}
          <section aria-labelledby="overview-heading">
            <h2
              id="overview-heading"
              className="font-display text-2xl font-bold text-neutral-900 mb-3"
            >
              Overview
            </h2>
            {lesson.notes ? (
              <PortableTextRenderer value={lesson.notes} />
            ) : (
              <p className="text-[15px] sm:text-[15.5px] text-neutral-700 leading-relaxed">
                In this lesson, you&apos;ll learn how Next.js handles data fetching and
                caching in both Server and Client Components. We&apos;ll explore
                different caching strategies and revalidation techniques to
                build fast and scalable applications.
              </p>
            )}
          </section>

          {/* ── In this lesson you will learn checklist ── */}
          {lesson.keyPoints && lesson.keyPoints.length > 0 && (
            <section
              aria-labelledby="key-points-heading"
              className="pt-2 border-t border-[#F2ECE4]"
            >
              <h3
                id="key-points-heading"
                className="text-[15.5px] font-bold text-neutral-900 mb-4"
              >
                In this lesson you will:
              </h3>
              <div className="space-y-3">
                {lesson.keyPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                    <span className="text-[14.5px] text-neutral-700 leading-relaxed">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Pro Tip Callout Box ── */}
          {lesson.proTip && (
            <div className="rounded-xl border border-[#FFE2D4] bg-[#FFF8F4] p-5 sm:p-6 flex items-start gap-4 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-[#FFEADB] flex items-center justify-center text-primary-600 shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[14.5px] font-bold text-neutral-900 mb-1">
                  Pro Tip
                </h4>
                <p className="text-[14px] text-neutral-700 leading-relaxed">
                  {lesson.proTip}
                </p>
              </div>
            </div>
          )}

          {/* ── Resources Section ── */}
          {lesson.resources && lesson.resources.length > 0 && (
            <section
              aria-labelledby="resources-heading"
              className="pt-4 border-t border-[#F2ECE4]"
            >
              <h3
                id="resources-heading"
                className="text-[16px] font-bold text-neutral-900 mb-4"
              >
                Resources
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lesson.resources.map((resource, idx) => (
                  <a
                    key={resource._key || idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      posthog.capture("lesson_resource_clicked", {
                        resource_title: resource.title,
                        resource_url: resource.url,
                        lesson_title: lesson.title,
                      })
                    }
                    className="p-4 rounded-xl border border-[#EBE4DC] bg-white hover:border-neutral-300 hover:shadow-sm transition-all flex flex-col justify-between group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#F8F4EE] border border-[#EBE4DC] flex items-center justify-center shrink-0">
                        {getResourceIcon(resource.type, resource.title)}
                      </div>
                      <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 transition-colors shrink-0 mt-1" />
                    </div>

                    <div>
                      <h4 className="text-[14px] font-bold text-neutral-900 group-hover:text-primary-600 transition-colors leading-snug mb-1">
                        {resource.title}
                      </h4>
                      {resource.description && (
                        <p className="text-[12.5px] text-neutral-500 line-clamp-2 leading-relaxed">
                          {resource.description}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── Tab Content: Notes (Presentational) ── */}
      {activeTab === "notes" && (
        <div className="p-6 rounded-xl border border-[#EBE4DC] bg-white text-neutral-700">
          {lesson.notes ? (
            <PortableTextRenderer value={lesson.notes} />
          ) : (
            <p className="text-sm text-neutral-500 italic">
              No additional notes for this lesson.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
