import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface BottomProgressBarProps {
  progressPercentage?: number;
  firstLessonSlug?: string | null;
}

/**
 * Displays a progress bar showing course completion percentage with a "Continue Learning" button.
 * Links to the first lesson or next lesson to continue the learning journey.
 */
export function BottomProgressBar({
  progressPercentage = 0,
  firstLessonSlug,
}: BottomProgressBarProps) {
  const continueHref = firstLessonSlug ? `/lessons/${firstLessonSlug}` : "#";
  const clampedProgress = Math.min(100, Math.max(0, progressPercentage));

  return (
    <div className="w-full rounded-2xl bg-white border border-[#EBE4DC] p-5 sm:p-6 mb-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* ── Left: Progress Label & Indicator ── */}
      <div className="flex-1 w-full flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
        <div className="shrink-0">
          <p className="text-[12px] text-neutral-500 font-medium">
            Your Progress
          </p>
          <p className="text-[15px] font-semibold text-neutral-900">
            {clampedProgress}% <span className="font-normal text-neutral-500">complete</span>
          </p>
        </div>

        {/* Progress bar track */}
        <div className="flex-1 w-full max-w-[340px]">
          <div
            className="w-full h-2.5 bg-[#EFECE8] rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={clampedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-gradient-to-r from-[#E76D42] to-[#D9572B] rounded-full transition-all duration-500"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Right: Action Button ── */}
      <div className="shrink-0 w-full sm:w-auto">
        <Link
          href={continueHref}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-[8px] font-medium text-[14px] text-white bg-gradient-to-b from-[#E76D42] to-[#D9572B] border border-[#D45428] shadow-[0_4px_14px_rgba(225,98,55,0.38)] hover:from-[#DF6236] hover:to-[#CE4E22] hover:shadow-[0_6px_18px_rgba(225,98,55,0.48)] active:translate-y-px transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 cursor-pointer"
        >
          <span>Continue Learning</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
