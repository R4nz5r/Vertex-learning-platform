import React from "react";
import { ArrowRight, Star } from "lucide-react";
import { Navbar } from "@/components/nav/navbar";
import { CourseCard } from "@/components/cards/course-card";
import { SearchInput } from "@/components/ui/search-input";

export const metadata = {
  title: "Vertex — Search your learning in plain English",
  description:
    "Vertex understands what you want to learn and finds the exact lessons across all your courses.",
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
        {/* Containers */}
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
        
        {/* Whale body */}
        <path
          d="M2 15C2 14.5 2.5 14 3.5 14C5 14 6 15 7.5 15C9 15 28 15 31 16.5C34 18 36.5 21 36.5 24C36.5 26.5 34 29 27 29C17 29 7 28 4.5 23.5C3.2 21.2 2.5 18 2 15Z"
          fill="#2496ED"
          stroke="#0F172A"
          strokeWidth="1"
        />
        {/* Whale tail */}
        <path
          d="M31 16.5C35 15 39 12 42 8C42 12 40 16 43 18C40 19 36 19 33.5 18"
          fill="#2496ED"
          stroke="#0F172A"
          strokeWidth="1"
        />
        {/* Whale Eye */}
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

/** Decorative bottom stepped gradient bars graphic matching vertex-home.png */
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
    <div className="w-full relative h-48 sm:h-56 lg:h-64 mt-4 overflow-hidden pointer-events-none select-none">
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

      {/* Main crisp pillars with luminous peach-coral gradient and seamless continuous shape */}
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

export default function HomePage() {
  return (
    <div
      className="min-h-screen w-full bg-[#FBF8F5] selection:bg-primary-100 selection:text-primary-700"
      style={{
        backgroundImage: `repeating-linear-gradient(45deg, rgba(235, 226, 218, 0.5) 0, rgba(235, 226, 218, 0.5) 1px, transparent 0, transparent 12px)`,
        backgroundAttachment: "fixed",
      }}
    >
      {/* ── Center Framed Website Container (1440px) ── */}
      <div className="max-w-[1440px] w-full mx-auto min-h-screen bg-white border-x border-[#EBE4DC] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.02)]">
        
        {/* ── Top Navigation Bar ── */}
        <Navbar
          links={[
            { label: "Courses", href: "#" },
            { label: "My Learning", href: "#" },
          ]}
          showActions={true}
          className="border-b border-[#EBE4DC] px-8 sm:px-12 bg-white"
        />

        {/* ── Hero Section (Inside Container) ── */}
        <section className="w-full px-8 sm:px-16 lg:px-24 pt-14 sm:pt-20 pb-14 flex flex-col items-center">
          
          {/* ── Intelligent Learning Badge ── */}
          <div className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-[8px] bg-[#FFF6F0] border border-[#FCDCC9] shadow-[0_1px_2px_rgba(225,98,55,0.05)] mb-6">
            <span className="text-[10.5px] font-semibold tracking-[0.16em] text-[#C24F1A] uppercase">
              INTELLIGENT LEARNING
            </span>
          </div>

          {/* ── Hero Heading ── */}
          <h1 className="font-display text-[44px] sm:text-[56px] lg:text-[64px] font-bold text-neutral-900 text-center tracking-tight leading-[1.12] mb-5 max-w-[760px]">
            Search your learning
            <br />
            in plain English.
          </h1>

          {/* ── Subtitle ── */}
          <p className="text-body-lg text-neutral-500 text-center max-w-[560px] leading-relaxed mb-9">
            Vertex understands what you want to learn and
            <br className="hidden sm:inline" /> finds the exact lessons across all your courses.
          </p>

          {/* ── Explore Courses CTA Button ── */}
          <div className="mb-9">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-[8px] font-medium text-[14px] text-white bg-gradient-to-b from-[#E76D42] to-[#D9572B] border border-[#D45428] shadow-[0_4px_14px_rgba(225,98,55,0.38)] hover:from-[#DF6236] hover:to-[#CE4E22] hover:shadow-[0_6px_18px_rgba(225,98,55,0.48)] active:translate-y-px transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 cursor-pointer"
            >
              <span>Explore Courses</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
            </button>
          </div>

          {/* ── Search Bar ── */}
          <div className="w-full max-w-[680px]">
            <SearchInput
              placeholder="Ask anything about your learning..."
              sizeVariant="lg"
              showShortcut={true}
            />
          </div>

        </section>

        {/* ── Full-Width Section Divider Line ── */}
        <hr className="w-full border-0 border-t border-[#EBE4DC] my-0" />

        {/* ── Main Content Container ── */}
        <main className="flex-1 w-full max-w-[1240px] mx-auto px-8 sm:px-12 pt-12 pb-8 flex flex-col items-center">
          
          {/* ── All Courses Section ── */}
          <section className="w-full mb-16" aria-labelledby="all-courses-heading">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 id="all-courses-heading" className="font-display text-[24px] sm:text-[28px] font-bold text-neutral-900 tracking-tight">
                All Courses
              </h2>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#F97316] hover:text-[#EA580C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm"
              >
                <span>View all courses</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
              </a>
            </div>

            {/* Courses 3-Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Card 1: Next.js for Production */}
              <CourseCard
                icon={<NextjsIcon />}
                title="Next.js for Production"
                description="Build scalable, high-performance web applications with Next.js."
                level="Intermediate"
                duration="18h 24m"
                modules={12}
              />

              {/* Card 2: Docker Essentials */}
              <CourseCard
                icon={<DockerIcon />}
                title="Docker Essentials"
                description="Containerize applications and streamline your development workflow."
                level="Beginner"
                duration="10h 12m"
                modules={8}
              />

              {/* Card 3: TypeScript Deep Dive */}
              <CourseCard
                icon={<TypeScriptIcon />}
                title="TypeScript Deep Dive"
                description="Go beyond the basics and write safer, more expressive code."
                level="Intermediate"
                duration="14h 36m"
                modules={10}
              />
            </div>
          </section>

          {/* ── Mid-page Weekly Star Banner ── */}
          <div className="w-full flex items-center justify-center my-6">
            <div className="flex-1 h-px bg-neutral-200/70" />
            <div className="flex items-center gap-2.5 px-5 text-[13px] text-neutral-700 font-normal">
              <Star className="w-4 h-4 text-[#F97316]" strokeWidth={1.75} aria-hidden="true" />
              <span>New courses and lessons added every week.</span>
            </div>
            <div className="flex-1 h-px bg-neutral-200/70" />
          </div>

        </main>

        {/* ── Bottom Decorative Stepped Bars Graphic ── */}
        <BottomSteppedGraphic />
      </div>
    </div>
  );
}


