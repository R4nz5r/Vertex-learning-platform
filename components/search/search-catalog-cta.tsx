import React from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";

export function SearchCatalogCTA() {
  return (
    <div className="bg-[#FAF8F5] rounded-2xl border border-[#EBE4DC] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
      {/* Left icon + text */}
      <div className="flex items-center gap-3.5 w-full sm:w-auto">
        <div className="w-11 h-11 rounded-full bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
          <Search className="w-5 h-5 stroke-[2.2]" />
        </div>

        <div>
          <h3 className="text-[14px] sm:text-[15px] font-bold text-neutral-900 leading-tight">
            Can&apos;t find what you&apos;re looking for?
          </h3>
          <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-0.5">
            Try different keywords or browse our full course catalog.
          </p>
        </div>
      </div>

      {/* Right button */}
      <Link
        href="/courses"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-[#E2DCD5] font-medium text-[13px] px-4 py-2.5 rounded-xl shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shrink-0"
      >
        <span>Browse all courses</span>
        <ArrowRight className="w-4 h-4 text-primary-500" strokeWidth={2} />
      </Link>
    </div>
  );
}
