import React from "react";

export function SearchCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#EBE4DC] p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-4 sm:gap-5 items-stretch animate-pulse">
      {/* Left box */}
      <div className="w-full md:w-[260px] h-[155px] flex-shrink-0 bg-neutral-100 rounded-xl" />

      {/* Right details */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-32 h-3.5 bg-neutral-200 rounded" />
            <div className="w-12 h-4 bg-neutral-100 rounded-full" />
          </div>
          <div className="w-3/4 h-5 bg-neutral-200 rounded" />
          <div className="space-y-1.5">
            <div className="w-full h-3 bg-neutral-100 rounded" />
            <div className="w-4/5 h-3 bg-neutral-100 rounded" />
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between mt-3">
          <div className="w-40 h-3 bg-neutral-100 rounded" />
          <div className="w-24 h-4 bg-neutral-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SearchListSkeleton() {
  return (
    <div className="space-y-4">
      <SearchCardSkeleton />
      <SearchCardSkeleton />
      <SearchCardSkeleton />
    </div>
  );
}
