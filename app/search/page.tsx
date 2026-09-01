import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/nav/navbar";
import { SearchResultsView } from "@/components/search/search-view";
import { SearchListSkeleton } from "@/components/search/search-skeleton";

export const metadata: Metadata = {
  title: "Search Results | Vertex",
  description:
    "Explore intelligent plain-English search results across lessons, courses, and timestamped video moments.",
};

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-neutral-900 selection:bg-primary-500 selection:text-white">
      {/* ── Top Navigation Bar ── */}
      <header>
        <Navbar
          links={[
            { label: "Courses", href: "/courses" },
            { label: "My Learning", href: "/my-learning" },
          ]}
          showActions={true}
        />
      </header>

      {/* ── Main Search View Container ── */}
      <div className="flex-1 w-full">
        <Suspense
          fallback={
            <div className="w-full max-w-[860px] mx-auto px-4 sm:px-6 pt-12 pb-16">
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-5 bg-neutral-200 rounded-full mb-3 animate-pulse" />
                <div className="w-72 h-10 bg-neutral-200 rounded mb-2 animate-pulse" />
                <div className="w-48 h-4 bg-neutral-200 rounded animate-pulse" />
              </div>
              <SearchListSkeleton />
            </div>
          }
        >
          <SearchResultsView />
        </Suspense>
      </div>
    </div>
  );
}
