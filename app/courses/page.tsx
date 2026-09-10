import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/nav/navbar";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import { getCourses } from "@/sanity/lib/fetchers";
import { CatalogAnalytics } from "@/components/analytics/catalog-analytics";
import {
  CourseSearchCatalog,
  type CourseCatalogItem,
} from "@/components/course/course-search-catalog";

export const metadata: Metadata = {
  title: "All Courses | Vertex",
  description:
    "Explore our complete library of production-grade engineering and AI courses.",
};

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
            { label: "Design System", href: "/design-system" },
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
          <div className="mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-[6px] bg-[#FFF6F0] border border-[#FCDCC9] shadow-[0_1px_2px_rgba(225,98,55,0.05)] mb-3">
              <span className="text-[10.5px] font-semibold tracking-[0.14em] text-[#C24F1A] uppercase">
                COURSE CATALOG
              </span>
            </div>
            <h1 className="font-display text-[32px] sm:text-[42px] font-bold text-neutral-900 tracking-tight leading-[1.15] mb-3">
              All Courses
            </h1>
            <p className="text-[15px] sm:text-[16px] text-neutral-500 max-w-[620px] leading-relaxed">
              Explore our comprehensive courses taught by industry practitioners. Find the exact lesson you need or master a complete path.
            </p>
          </div>

          {/* ── Interactive Course Search, Filters & Grid ── */}
          <CourseSearchCatalog courses={courses} />
        </main>

        {/* ── Bottom Stepped Gradient Graphic ── */}
        <BottomSteppedGraphic />
      </div>
    </div>
  );
}
