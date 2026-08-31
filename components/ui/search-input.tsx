"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import posthog from "posthog-js";

import { useRouter } from "next/navigation";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  inputClassName?: string;
  sizeVariant?: "md" | "lg";
  showShortcut?: boolean;
  onSearch?: (query: string) => void;
}

export function SearchInput({
  className,
  inputClassName,
  sizeVariant = "md",
  showShortcut = true,
  placeholder = "Search anything...",
  onSearch,
  onKeyDown,
  ...props
}: SearchInputProps) {
  const router = useRouter();
  const isLg = sizeVariant === "lg";

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <label className="sr-only" htmlFor="search-input">Search</label>
      <Search
        className={cn(
          "absolute pointer-events-none text-neutral-400",
          isLg ? "left-4 w-5 h-5" : "left-4 w-4 h-4 text-neutral-500",
        )}
        aria-hidden="true"
      />
      <input
        id="search-input"
        type="search"
        placeholder={placeholder}
        className={cn(
          "w-full bg-white border border-neutral-200 outline-none transition-colors duration-150",
          "focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20",
          isLg
            ? "h-[52px] pl-12 pr-16 text-[15px] text-neutral-700 placeholder:text-neutral-400 rounded-[12px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
            : "h-11 pl-10 pr-16 text-body text-neutral-700 placeholder:text-neutral-400 rounded-[var(--radius-md)]",
          inputClassName,
        )}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const query = (e.target as HTMLInputElement).value.trim();
            if (query) {
              posthog.capture("search_submitted", {
                query: query,
                query_length: query.length,
              });
              if (onSearch) {
                onSearch(query);
              } else {
                router.push(`/search?q=${encodeURIComponent(query)}`);
              }
            }
          }
          if (onKeyDown) {
            onKeyDown(e);
          }
        }}
        {...props}
      />
      {showShortcut && (
        <kbd
          className={cn(
            "absolute inline-flex items-center gap-0.5 text-neutral-400 border border-neutral-200 font-sans select-none pointer-events-none",
            isLg
              ? "right-3.5 px-2 py-1 text-[11px] font-medium rounded-[6px] bg-neutral-50/60"
              : "right-3 px-1.5 py-0.5 text-[10px] rounded",
          )}
        >
          ⌘ K
        </kbd>
      )}
    </div>
  );
}

