import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({ label, options = [], placeholder, className, ...props }: SelectProps) {
  return (
    <div className={cn("relative", className)}>
      {label && (
        <label className="sr-only">{label}</label>
      )}
      <select
        aria-label={label ?? "Select"}
        className={cn(
          "w-full h-11 pl-4 pr-10 text-body text-neutral-700 appearance-none",
          "bg-white border border-neutral-200 rounded-[var(--radius-md)]",
          "outline-none transition-colors duration-150",
          "focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20",
          "cursor-pointer",
        )}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
