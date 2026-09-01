import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/nav/navbar";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import { CourseHero } from "@/components/course/course-hero";
import { LearningOutcomes } from "@/components/course/learning-outcomes";
import { ModuleAccordion } from "@/components/course/module-accordion";
import { BottomProgressBar } from "@/components/course/bottom-progress-bar";
import { getCourseBySlug, getCourses } from "@/sanity/lib/fetchers";
import { formatDurationHoursMinutes } from "@/lib/format";
import { getPostHogClient } from "@/lib/posthog-server";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/** Decorative bottom stepped gradient bars graphic matching Vertex branding */
function BottomSteppedGraphic() {
  const leftBars = [
    { height: "42%", left: "0%", width: "7.6%" },
    { height: "60%", left: "7.6%", width: "7.6%" },
    { height: "78%", left: "15.2%", width: "7.6%" },
    { height: "96%", left: "22.8%", width: "7.6%" },
    { height: "66%", left: "30.4%", width: "11.2%" },
    { height: "46%", left: "41.6%", width: "6.4%" },
  ];

  const rightBars = [
    { height: "44%", left: "54.8%", width: "7.2%" },
    { height: "58%", left: "62.0%", width: "7.2%" },
    { height: "76%", left: "69.2%", width: "7.2%" },
    { height: "96%", left: "76.4%", width: "7.2%" },
    { height: "42%", left: "83.6%", width: "5.4%" },
    { height: "64%", left: "89.0%", width: "5.0%" },
    { height: "82%", left: "94.0%", width: "6.0%" },
  ];

  const allBars = [...leftBars, ...rightBars];

  return (
    <div className="w-full relative h-40 sm:h-48 lg:h-56 mt-6 overflow-hidden pointer-events-none select-none">
      {/* Soft feathered top bloom layer */}
      <div className="absolute inset-0">
        {allBars.map((bar, idx) => (
          <div
            key={`glow-${idx}`}
            className="absolute bottom-0"
            style={{
              left: bar.left,
              width: bar.width,
              height: bar.height,
              background: `linear-gradient(180deg, rgba(255, 220, 200, 0) 0%, rgba(255, 185, 155, 0.45) 22%, rgba(255, 160, 125, 0.7) 60%, rgba(255, 142, 102, 0.9) 100%)`,
              filter: "blur(6px)",
            }}
          />
        ))}
      </div>

      {/* Main crisp pillars with luminous peach-coral gradient */}
      <div className="absolute inset-0">
        {allBars.map((bar, idx) => (
          <div
            key={`bar-${idx}`}
            className="absolute bottom-0"
            style={{
              left: bar.left,
              width: bar.width,
              height: bar.height,
              background: `linear-gradient(180deg, rgba(255, 240, 230, 0) 0%, rgba(255, 195, 165, 0.35) 18%, rgba(255, 170, 135, 0.6) 48%, rgba(255, 148, 110, 0.8) 78%, rgba(255, 135, 95, 0.92) 100%)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const courses = await getCourses();
    return (courses || []).map((c: { slug?: string }) => ({
      slug: c.slug || "",
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return {
      title: "Course Not Found | Vertex",
    };
  }

  return {
    title: `${course.title} | Vertex`,
    description:
      course.summary ||
      `Learn ${course.title} on Vertex with intelligent search and interactive lessons.`,
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const modules = course.modules || [];
  const moduleCount = modules.length;

  // Calculate total course duration and lesson count across all lessons
  let totalSeconds = 0;
  let totalLessonsCount = 0;
  let firstLessonSlug: string | null = null;

  for (const mod of modules) {
    if (Array.isArray(mod.lessons)) {
      for (const lesson of mod.lessons) {
        totalLessonsCount++;
        if (lesson?.duration) {
          totalSeconds += lesson.duration;
        }
        if (!firstLessonSlug && lesson?.slug) {
          firstLessonSlug = lesson.slug;
        }
      }
    }
  }

  const formattedTotalDuration = formatDurationHoursMinutes(totalSeconds);

  // Server-side event: track course views for authenticated users
  const { userId } = await auth();
  if (userId) {
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId,
      event: "course_viewed",
      properties: {
        course_title: course.title,
        course_slug: slug,
        course_level: course.level ?? undefined,
        module_count: moduleCount,
        total_duration_seconds: totalSeconds,
      },
    });
    await posthog.flush();
  }

  return (
    <div
      className="min-h-screen w-full bg-[#FAF7F2] selection:bg-primary-100 selection:text-primary-700"
      style={{
        backgroundImage: `repeating-linear-gradient(45deg, rgba(230, 220, 210, 0.45) 0, rgba(230, 220, 210, 0.45) 1px, transparent 0, transparent 12px)`,
        backgroundAttachment: "fixed",
      }}
    >
      {/* ── Center Framed Website Container (1440px) ── */}
      <div className="max-w-[1440px] w-full mx-auto min-h-screen bg-[#FAF7F2] border-x border-[#EBE4DC] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.02)]">
        {/* ── Top Navigation Bar ── */}
        <Navbar
          links={[
            { label: "Courses", href: "/courses" },
            { label: "My Learning", href: "/my-learning" },
          ]}
          showActions={true}
          className="border-b border-[#EBE4DC] px-8 sm:px-12 bg-[#FAF7F2]"
        />

        {/* ── Main Content Area ── */}
        <main className="flex-1 w-full max-w-[1180px] mx-auto px-6 sm:px-10 lg:px-12 pt-8 pb-12 flex flex-col">
          {/* ── Breadcrumbs ── */}
          <div className="mb-8">
            <Breadcrumbs
              items={[
                { label: "All Courses", href: "/courses" },
                { label: course.title },
              ]}
            />
          </div>

          {/* ── Course Hero Section ── */}
          <CourseHero
            title={course.title}
            courseSlug={slug}
            summary={course.summary}
            coverImage={course.coverImage}
            level={course.level}
            popular={course.popular}
            studentCount={course.studentCount}
            totalSeconds={totalSeconds}
            moduleCount={moduleCount}
            firstLessonSlug={firstLessonSlug}
          />

          {/* ── "What you'll learn" Grid ── */}
          <LearningOutcomes outcomes={course.learningOutcomes} />

          {/* ── "Course Content" Section ── */}
          <section className="w-full mb-12" aria-labelledby="course-content-heading">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2
                id="course-content-heading"
                className="font-display text-[22px] sm:text-[26px] font-bold text-neutral-900 tracking-tight"
              >
                Course Content
              </h2>
              <span className="text-[13.5px] text-neutral-500 font-medium">
                {moduleCount} modules • {formattedTotalDuration}
              </span>
            </div>

            {/* Modules Accordion */}
            <ModuleAccordion modules={modules} />
          </section>

          {/* ── Bottom Progress Bar ── */}
          <BottomProgressBar
            courseSlug={slug}
            totalLessonsCount={totalLessonsCount}
            firstLessonSlug={firstLessonSlug}
          />
        </main>

        {/* ── Bottom Stepped Gradient Bars Graphic ── */}
        <BottomSteppedGraphic />
      </div>
    </div>
  );
}
