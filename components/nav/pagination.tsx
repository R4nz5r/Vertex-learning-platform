import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  current: number;
  total: number;
  className?: string;
}

function getPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export function Pagination({ current, total, className }: PaginationProps) {
  const pages = getPages(current, total);

  const itemBase =
    "w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-small border transition-colors" +
    " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1";

  return (
    <nav aria-label="Pagination" className={className}>
      <ul className="flex items-center gap-1 list-none">
        {/* Prev */}
        <li>
          <button
            aria-label="Previous page"
            disabled={current === 1}
            className={cn(itemBase, "border-neutral-200 text-neutral-500 hover:border-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed")}
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
        </li>

        {pages.map((page, i) =>
          page === "…" ? (
            <li key={`ellipsis-${i}`}>
              <span className={cn(itemBase, "border-transparent text-neutral-400 cursor-default")}>
                …
              </span>
            </li>
          ) : (
            <li key={page}>
              <button
                aria-label={`Page ${page}`}
                aria-current={page === current ? "page" : undefined}
                className={cn(
                  itemBase,
                  page === current
                    ? "border-primary-500 text-primary-500 font-semibold"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-300",
                )}
              >
                {page}
              </button>
            </li>
          ),
        )}

        {/* Next */}
        <li>
          <button
            aria-label="Next page"
            disabled={current === total}
            className={cn(itemBase, "border-neutral-200 text-neutral-500 hover:border-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed")}
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
