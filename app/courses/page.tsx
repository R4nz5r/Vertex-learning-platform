import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Navbar } from "@/components/nav/navbar";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import { CourseCard } from "@/components/cards/course-card";
import { getCourses } from "@/sanity/lib/fetchers";
import { formatDurationHoursMinutes } from "@/lib/format";
import { urlFor } from "@/sanity/lib/image";
import { CatalogAnalytics } from "@/components/analytics/catalog-analytics";

export const metadata: Metadata = {
  title: "All Courses | Vertex",
  description:
    "Explore our complete library of production-grade engineering and AI courses.",
};

/** Next.js logo icon */
function NextjsIcon() {
  return (
    <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center shadow-sm">
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
    <div className="w-12 h-10 flex items-center justify-start">
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
    <div className="w-10 h-10 rounded-lg bg-[#3178C6] flex items-center justify-center shadow-sm">
      <span className="text-white font-bold text-base tracking-tight font-sans">TS</span>
    </div>
  );
}

interface CourseCatalogItem {
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

function resolveCourseIcon(course: CourseCatalogItem) {
  if (course.coverImage?.asset?.url) {
    return (
      <div className="w-10 h-10 rounded-lg overflow-hidden relative shadow-sm border border-neutral-200/60 shrink-0">
        <Image
          src={urlFor(course.coverImage).width(80).height(80).url()}
          alt={course.coverImage.alt || course.title}
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
    <div className="w-full relative h-40 sm:h-48 lg:h-56 mt-12 overflow-hidden pointer-events-none select-none">
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

export default async function AllCoursesPage() {
  const courses: CourseCatalogItem[] = (await getCourses()) || [];

  return (
    <div
      className="min-h-screen w-full bg-[#FAF7F2] selection:bg-primary-100 selection:text-primary-700"
      style={{
        backgroundImage: `repeating-linear-gradient(45deg, rgba(230, 220, 210, 0.45) 0, rgba(230, 220, 210, 0.45) 1px, transparent 0, transparent 12px)`,
        backgroundAttachment: "fixed",
      }}
    >
      <CatalogAnalytics totalCourses={courses.length} />
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

        {/* ── Main Catalog Content ── */}
        <main className="flex-1 w-full max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-12 pt-8 pb-12 flex flex-col">
          {/* ── Breadcrumbs ── */}
          <div className="mb-8">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "All Courses" },
              ]}
            />
          </div>

          {/* ── Page Header ── */}
          <div className="mb-10 sm:mb-12">
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-[6px] bg-[#FFF6F0] border border-[#FCDCC9] shadow-[0_1px_2px_rgba(225,98,55,0.05)] mb-3">
              <span className="text-[10.5px] font-semibold tracking-[0.14em] text-[#C24F1A] uppercase">
                COURSE CATALOG
              </span>
            </div>
            <h1 className="font-display text-[32px] sm:text-[42px] font-bold text-neutral-900 tracking-tight leading-[1.15] mb-3">
              All Courses
            </h1>
            <p className="text-[15px] sm:text-[16px] text-neutral-500 max-w-[620px] leading-relaxed">
              Explore {courses.length} comprehensive courses taught by industry practitioners. Find the exact lesson you need or master a complete path.
            </p>
          </div>

          {/* ── Courses Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {courses.map((course) => {
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
        </main>

        {/* ── Bottom Stepped Gradient Graphic ── */}
        <BottomSteppedGraphic />
      </div>
    </div>
  );
}
