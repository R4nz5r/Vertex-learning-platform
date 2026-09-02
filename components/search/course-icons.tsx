import React from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

interface CourseIconProps {
  courseTitle?: string;
  courseSlug?: string;
  coverImage?: Parameters<typeof urlFor>[0] | null;
  className?: string;
  size?: number;
}

export function CourseTechIcon({
  courseTitle = "",
  courseSlug = "",
  coverImage,
  className = "w-4 h-4 rounded-[4px]",
  size = 16,
}: CourseIconProps) {
  const title = (courseTitle || "").toLowerCase();
  const slug = (courseSlug || "").toLowerCase();

  // Next.js: Black box with white N
  if (title.includes("next.js") || slug.includes("nextjs")) {
    return (
      <span
        className={`inline-flex items-center justify-center bg-black text-white font-bold text-[10px] select-none shrink-0 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <span className="leading-none text-[9px] font-sans">N</span>
      </span>
    );
  }

  // React: Cyan atomic icon
  if (title.includes("react") || slug.includes("react")) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="text-[#00D8FF]">
          <ellipse cx="12" cy="12" rx="4" ry="11" stroke="currentColor" strokeWidth="2" />
          <ellipse cx="12" cy="12" rx="4" ry="11" transform="rotate(60 12 12)" stroke="currentColor" strokeWidth="2" />
          <ellipse cx="12" cy="12" rx="4" ry="11" transform="rotate(120 12 12)" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      </span>
    );
  }

  // Node.js: Green hexagon with JS
  if (title.includes("node") || slug.includes("node")) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L21 7.2V16.8L12 22L3 16.8V7.2L12 2Z"
            stroke="#22C55E"
            strokeWidth="2"
            fill="#F0FDF4"
          />
          <text x="7.5" y="15" fill="#15803D" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
            JS
          </text>
        </svg>
      </span>
    );
  }

  // JavaScript: Yellow square with JS
  if (title.includes("javascript") || slug.includes("javascript") || /\bjs\b/.test(title) || /\bjs\b/.test(slug)) {
    return (
      <span
        className={`inline-flex items-center justify-center bg-[#F7DF1E] text-black font-bold select-none shrink-0 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <span className="leading-none text-[8.5px] font-sans font-bold">JS</span>
      </span>
    );
  }

  // TypeScript: Blue square with TS
  if (title.includes("typescript") || slug.includes("typescript") || /\bts\b/.test(title) || /\bts\b/.test(slug)) {
    return (
      <span
        className={`inline-flex items-center justify-center bg-[#3178C6] text-white font-bold select-none shrink-0 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <span className="leading-none text-[8.5px] font-sans font-bold">TS</span>
      </span>
    );
  }

  // Docker: Whale icon
  if (title.includes("docker") || slug.includes("docker") || title.includes("devops")) {
    return (
      <span
        className={`inline-flex items-center justify-center bg-[#2496ED] text-white select-none shrink-0 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 10V8H11V10H13ZM10 10V8H8V10H10ZM7 10V8H5V10H7ZM13 7V5H11V7H13ZM10 7V5H8V7H10ZM16 10V8H14V10H16ZM19 10V8H17V10H19ZM22.5 10.5C21.8 9.9 20.8 9.7 19.8 9.9C19.7 7.7 18 6 15.8 6H4V13C4 16.3 6.7 19 10 19H14C18.4 19 22 15.4 22 11C22 10.8 22 10.7 22 10.5H22.5Z" />
        </svg>
      </span>
    );
  }

  // Cover image fallback
  let imgUrl: string | null = null;
  if (coverImage) {
    try {
      imgUrl = urlFor(coverImage).width(64).height(64).url();
    } catch {
      imgUrl = null;
    }
  }

  if (imgUrl) {
    return (
      <span
        className={`inline-flex items-center justify-center overflow-hidden shrink-0 border border-neutral-200 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={imgUrl}
          alt=""
          width={size}
          height={size}
          className="w-full h-full object-cover"
        />
      </span>
    );
  }

  // Default fallback
  return (
    <span
      className={`inline-flex items-center justify-center bg-neutral-800 text-white font-bold text-[9px] shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      V
    </span>
  );
}
