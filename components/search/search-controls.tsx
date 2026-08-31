"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { SearchSort } from "@/lib/search/types";

interface SearchControlsProps {
  count: number;
  sort: SearchSort;
  onSortChange: (sort: SearchSort) => void;
}

const SORT_OPTIONS: Array<{ value: SearchSort; label: string }> = [
  { value: "relevance", label: "Most Relevant" },
  { value: "newest", label: "Newest" },
  { value: "duration", label: "Duration" },
];

export function SearchControls({ count, sort, onSortChange }: SearchControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLabel =
    SORT_OPTIONS.find((opt) => opt.value === sort)?.label || "Most Relevant";

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: SearchSort) => {
    onSortChange(val);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-between py-3 mb-4 border-b border-transparent">
      {/* ── Count Label ── */}
      <div className="text-[14px] font-semibold text-neutral-900">
        {count} result{count === 1 ? "" : "s"}
      </div>

      {/* ── Custom Styled Sort Dropdown ── */}
      <div ref={dropdownRef} className="relative inline-flex items-center text-left">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="inline-flex items-center justify-between gap-2 bg-white border border-[#E5E0DA] text-neutral-800 text-[13px] font-medium pl-3.5 pr-3 py-1.5 rounded-xl shadow-xs cursor-pointer outline-none hover:border-neutral-300 hover:bg-neutral-50/50 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/20 transition-all"
        >
          <span>{currentLabel}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-150 ${
              isOpen ? "rotate-180 text-primary-500" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        {/* ── Popover Menu ── */}
        {isOpen && (
          <div
            role="listbox"
            className="absolute right-0 top-full mt-1.5 w-40 bg-white border border-[#EBE4DC] rounded-xl shadow-lg shadow-black/5 py-1 z-30 animate-in fade-in-50 zoom-in-95 duration-100"
          >
            {SORT_OPTIONS.map((opt) => {
              const isSelected = opt.value === sort;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-[13px] font-medium text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "text-primary-600 bg-primary-50/60 font-semibold"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-primary-500 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
