import React, { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchHeaderProps {
  query: string;
  count?: number;
  courseCount?: number;
  loading?: boolean;
  onQueryChange: (q: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear?: () => void;
}

export function SearchHeader({
  query,
  count,
  courseCount,
  loading = false,
  onQueryChange,
  onSubmit,
  onClear,
}: SearchHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global ⌘K / Ctrl+K shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const displayQuery = query || "learning";

  return (
    <div className="flex flex-col items-center text-center pt-8 pb-6 px-4">
      {/* ── SEARCH RESULTS Pill Badge ── */}
      <div className="inline-flex items-center text-[10.5px] font-bold tracking-widest text-[#E05326] bg-[#FDF0EB] px-3 py-1 rounded-full uppercase mb-3.5 border border-[#FCDCCE]/50">
        SEARCH RESULTS
      </div>

      {/* ── Main Serif Heading ── */}
      <h1 className="font-serif text-[32px] sm:text-[42px] md:text-[48px] text-neutral-900 leading-tight font-normal tracking-tight max-w-2xl">
        Results for{" "}
        <span className="text-[#FF5500]">“{displayQuery}”</span>
      </h1>

      {/* ── Subtitle ── */}
      <p className="text-[13px] sm:text-[14px] text-neutral-500 mt-2 font-normal">
        {loading
          ? "Searching across our course catalog..."
          : typeof count === "number" && typeof courseCount === "number"
            ? `Found ${count} result${count === 1 ? "" : "s"} across ${courseCount} course${courseCount === 1 ? "" : "s"}`
            : "Explore grounded video moments and lesson topics."}
      </p>

      {/* ── Large Search Input Bar ── */}
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[640px] mt-6 relative flex items-center"
      >
        <label htmlFor="search-input-field" className="sr-only">
          Search course catalog
        </label>

        <Search
          className="absolute left-4 w-4 h-4 text-neutral-400 pointer-events-none"
          aria-hidden="true"
        />

        <input
          id="search-input-field"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search anything..."
          className="w-full h-12 pl-11 pr-20 bg-white border border-[#E5E0DA] rounded-full text-[14px] text-neutral-800 placeholder:text-neutral-400 shadow-[0_2px_8px_rgba(0,0,0,0.03)] outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              if (onClear) {
                onClear();
              } else {
                onQueryChange("");
              }
            }}
            className="absolute right-14 p-1 text-neutral-400 hover:text-neutral-600 rounded-full cursor-pointer focus-visible:outline-none"
            aria-label="Clear query"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <kbd className="absolute right-3.5 inline-flex items-center gap-0.5 text-neutral-400 border border-neutral-200 font-sans text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-50 select-none pointer-events-none">
          ⌘ K
        </kbd>
      </form>
    </div>
  );
}
