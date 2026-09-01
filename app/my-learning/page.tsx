import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight, Lock } from "lucide-react";
import { Navbar } from "@/components/nav/navbar";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import { CourseCard } from "@/components/cards/course-card";
import { MyLearningDashboard, type DashboardCourse } from "@/components/dashboard/my-learning-dashboard";
import { getMyLearningCourses } from "@/sanity/lib/fetchers";
import { formatDurationHoursMinutes } from "@/lib/format";
import { urlFor } from "@/sanity/lib/image";

export const metadata: Metadata = {
  title: "My Learning | Vertex",
  description: "Track your course progress, resume lessons, and manage your learning journey on Vertex.",
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

interface RawLesson {
  _id: string;
  title: string;
  slug: string;
  duration?: number | null;
  freePreview?: boolean | null;
}

interface RawModule {
  _key: string;
  title: string;
  summary?: string | null;
  lessons?: RawLesson[] | null;
}

interface RawCourse {
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
  modules?: RawModule[] | null;
}

function resolveCourseIcon(course: { coverImage?: RawCourse["coverImage"]; title?: string; slug?: string }) {
  if (course.coverImage?.asset?.url) {
    return (
      <div className="w-10 h-10 rounded-lg overflow-hidden relative shadow-sm border border-neutral-200/60 shrink-0">
        <Image
          src={urlFor(course.coverImage).width(80).height(80).url()}
          alt={course.coverImage.alt || course.title || "Course thumbnail"}
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

/** Stepped decorative bottom bars matching Vertex branding */
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
    <div className="w-full relative h-40 sm:h-48 lg:h-56 mt-16 overflow-hidden pointer-events-none select-none">
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

export default async function MyLearningPage() {
  const { userId } = await auth();
  const rawCourses: RawCourse[] = (await getMyLearningCourses()) || [];

  const dashboardCourses: DashboardCourse[] = rawCourses.map((course) => ({
    _id: course._id,
    title: course.title,
    slug: course.slug,
    summary: course.summary,
    level: course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : "Intermediate",
    duration: formatDurationHoursMinutes(course.totalDuration || 0),
    moduleCount: course.moduleCount || 0,
    lessonCount: course.lessonCount || 0,
    totalDuration: course.totalDuration,
    modules: course.modules,
    icon: resolveCourseIcon(course),
  }));

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
            { label: "My Learning", href: "/my-learning", active: true },
          ]}
          showActions={true}
          className="border-b border-[#EBE4DC] px-4 sm:px-8 lg:px-12 bg-[#FAF7F2]"
        />

        {/* ── Main Dashboard Content ── */}
        <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-12 flex flex-col">
          {/* ── Breadcrumbs ── */}
          <div className="mb-6 sm:mb-8">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "My Learning" },
              ]}
            />
          </div>

          {/* ── Page Header ── */}
          <div className="mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-[6px] bg-[#FFF6F0] border border-[#FCDCC9] shadow-[0_1px_2px_rgba(225,98,55,0.05)] mb-3">
              <span className="text-[10.5px] font-semibold tracking-[0.14em] text-[#C24F1A] uppercase">
                LEARNER DASHBOARD
              </span>
            </div>
            <h1 className="font-display text-[28px] sm:text-[36px] lg:text-[42px] font-bold text-neutral-900 tracking-tight leading-[1.15] mb-3">
              My Learning
            </h1>
            <p className="text-[15px] sm:text-[16px] text-neutral-500 max-w-[620px] leading-relaxed">
              Track your course progress, resume video lessons at the exact second, and continue your engineering mastery.
            </p>
          </div>

          {/* ── Signed-Out Guest Banner ── */}
          {!userId ? (
            <div className="space-y-12">
              <div className="p-8 sm:p-10 rounded-2xl bg-white border border-[#EBE4DC] shadow-[var(--shadow-sm)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary-50 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-3 max-w-xl z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 text-[12px] font-medium">
                    <Lock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Guest View</span>
                  </div>
                  <h2 className="font-display text-[22px] sm:text-[26px] font-bold text-neutral-900 leading-snug">
                    Sign in to save and resume your learning progress
                  </h2>
                  <p className="text-[14px] text-neutral-500 leading-relaxed">
                    Create an account or sign in to track completed lessons, save your timestamp playback position, and pick up where you left off across any device.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full sm:w-auto">
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg font-medium text-[14px] text-neutral-800 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 transition-all cursor-pointer"
                    >
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      type="button"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg font-medium text-[14px] text-white bg-gradient-to-b from-[#E76D42] to-[#D9572B] border border-[#D45428] shadow-[0_3px_10px_rgba(225,98,55,0.3)] hover:from-[#DF6236] hover:to-[#CE4E22] transition-all cursor-pointer"
                    >
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </SignUpButton>
                </div>
              </div>

              {/* ── Catalog Preview for Guests ── */}
              <section aria-labelledby="catalog-preview-heading">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 id="catalog-preview-heading" className="font-display text-[22px] sm:text-[26px] font-bold text-neutral-900 tracking-tight">
                      Explore Available Courses
                    </h2>
                    <p className="text-[13px] text-neutral-500">
                      Browse courses to start learning immediately.
                    </p>
                  </div>
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-1.5 text-[14px] font-medium text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    <span>View all courses</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {dashboardCourses.map((course) => (
                    <CourseCard
                      key={course._id || course.slug}
                      icon={course.icon}
                      logoChar={!course.icon ? (course.title || "C").charAt(0) : undefined}
                      title={course.title}
                      description={course.summary || ""}
                      level={course.level || "Intermediate"}
                      duration={course.duration || ""}
                      modules={course.moduleCount || 0}
                      href={`/courses/${course.slug}`}
                    />
                  ))}
                </div>
              </section>
            </div>
          ) : (
            /* ── Signed-In User Dynamic Learning Dashboard ── */
            <MyLearningDashboard
              allCourses={dashboardCourses}
            />
          )}
        </main>

        {/* ── Bottom Stepped Gradient Graphic ── */}
        <BottomSteppedGraphic />
      </div>
    </div>
  );
}
