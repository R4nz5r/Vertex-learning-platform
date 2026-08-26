import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  showShortcut?: boolean;
}

export function SearchInput({ className, showShortcut = true, placeholder = "Search anything...", ...props }: SearchInputProps) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <label className="sr-only" htmlFor="search-input">Search</label>
      <Search
        className="absolute left-4 w-4 h-4 text-neutral-500 pointer-events-none"
        aria-hidden="true"
      />
      <input
        id="search-input"
        type="search"
        placeholder={placeholder}
        className={cn(
          "w-full h-11 pl-10 pr-16 text-body text-neutral-700 placeholder:text-neutral-400",
          "bg-white border border-neutral-200 rounded-[var(--radius-md)]",
          "outline-none transition-colors duration-150",
          "focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20",
        )}
        {...props}
      />
      {showShortcut && (
        <kbd className="absolute right-3 inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-neutral-400 border border-neutral-200 rounded font-sans select-none">
          ⌘ K
        </kbd>
      )}
    </div>
  );
}
