import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/nav/navbar";
import { LessonSidebar } from "@/components/lesson/lesson-sidebar";
import { LessonContent } from "@/components/lesson/lesson-content";
import { LessonNavigation, type NavLesson } from "@/components/lesson/lesson-navigation";
import { getAllLessons, getLessonBySlug } from "@/sanity/lib/fetchers";
import { urlFor } from "@/sanity/lib/image";
import { getPostHogClient } from "@/lib/posthog-server";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    start?: string;
    t?: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const lessons = await getAllLessons();
    return (lessons || []).map((l: { slug?: string }) => ({
      slug: l.slug || "",
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);

  if (!lesson) {
    return {
      title: "Lesson Not Found | Vertex",
    };
  }

  const courseTitle = lesson.course?.title ? ` - ${lesson.course.title}` : "";
  return {
    title: `${lesson.title}${courseTitle} | Vertex`,
    description:
      `Watch ${lesson.title} on Vertex. Interactive learning with intelligent video search.`,
  };
}

export default async function LessonDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const lesson = await getLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  // Parse start timestamp if present in query params (e.g. ?start=120 or ?t=120)
  const startSeconds = sParams?.start
    ? parseFloat(sParams.start)
    : sParams?.t
    ? parseFloat(sParams.t)
    : 0;

  const course = lesson.course || {
    _id: "course-default",
    title: "Course",
    slug: "course",
    modules: [],
  };

  // Derive module order, lesson label (e.g. "LESSON 5.1"), prev/next navigation
  const modules = course.modules || [];
  let currentModuleIndex = 0;
  let currentLessonIndexInModule = 0;
  let moduleTitle = "Course Module";

  const flatLessons: NavLesson[] = [];
  let currentFlatIndex = -1;

  for (let mIdx = 0; mIdx < modules.length; mIdx++) {
    const mod = modules[mIdx];
    const modLessons = mod.lessons || [];

    for (let lIdx = 0; lIdx < modLessons.length; lIdx++) {
      const l = modLessons[lIdx];
      const navItem: NavLesson = {
        title: l.title,
        slug: l.slug,
        duration: l.duration,
      };
      flatLessons.push(navItem);

      if (l.slug === slug || l._id === lesson._id) {
        currentModuleIndex = mIdx;
        currentLessonIndexInModule = lIdx;
        moduleTitle = mod.title || `Module ${mIdx + 1}`;
        currentFlatIndex = flatLessons.length - 1;
      }
    }
  }

  const lessonNumberLabel = `LESSON ${currentModuleIndex + 1}.${currentLessonIndexInModule + 1}`;
  const prevLesson = currentFlatIndex > 0 ? flatLessons[currentFlatIndex - 1] : null;
  const nextLesson =
    currentFlatIndex >= 0 && currentFlatIndex < flatLessons.length - 1
      ? flatLessons[currentFlatIndex + 1]
      : null;

  // Thumbnail and Course Cover URL resolution
  let thumbnailUrl: string | null = null;
  if (lesson.thumbnail?.asset) {
    try {
      thumbnailUrl = urlFor(lesson.thumbnail).width(1280).height(720).url();
    } catch {
      thumbnailUrl = null;
    }
  }

  let courseCoverUrl: string | null = null;
  if (course.coverImage?.asset) {
    try {
      courseCoverUrl = urlFor(course.coverImage).width(160).height(160).url();
    } catch {
      courseCoverUrl = null;
    }
  }

  // Server-side analytics event capture
  const { userId } = await auth();
  if (userId) {
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId,
      event: "lesson_viewed",
      properties: {
        lesson_title: lesson.title,
        lesson_slug: slug,
        course_title: course.title,
        course_slug: course.slug,
        module_index: currentModuleIndex + 1,
        lesson_label: lessonNumberLabel,
        has_video: Boolean(lesson.videoUrl),
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

        {/* ── Main Two-Column Layout ── */}
        <div className="flex-1 flex flex-col lg:flex-row w-full">
          {/* ── Left Sidebar (Curriculum / Module Navigation) ── */}
          <LessonSidebar
            course={{
              _id: course._id,
              title: course.title,
              slug: course.slug,
              modules: course.modules,
              coverImageUrl: courseCoverUrl,
            }}
            currentLessonSlug={slug}
            currentModuleIndex={currentModuleIndex}
          />

          {/* ── Right Content Area ── */}
          <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-12 flex flex-col bg-white">
            <LessonContent
              lesson={{
                _id: lesson._id,
                title: lesson.title,
                slug: lesson.slug,
                videoUrl: lesson.videoUrl,
                duration: lesson.duration,
                freePreview: lesson.freePreview,
                studentCount: lesson.studentCount,
                notes: lesson.notes,
                keyPoints: lesson.keyPoints,
                proTip: lesson.proTip,
                resources: lesson.resources,
                thumbnailUrl,
              }}
              course={{
                _id: course._id,
                title: course.title,
                slug: course.slug,
                level: course.level,
                studentCount: course.studentCount,
              }}
              moduleTitle={moduleTitle}
              lessonNumberLabel={lessonNumberLabel}
              startSeconds={startSeconds}
              totalCourseLessons={flatLessons.length}
            />

            {/* ── Bottom Previous / Next Lesson Navigation Bar ── */}
            <LessonNavigation
              prevLesson={prevLesson}
              nextLesson={nextLesson}
              currentLessonTitle={lesson.title}
              currentLessonSlug={slug}
              courseSlug={course.slug}
              allLessonSlugs={flatLessons.map((l) => l.slug)}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
