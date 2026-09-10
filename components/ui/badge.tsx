import { cn } from "@/lib/utils";

type BadgeVariant = "video" | "lesson" | "popular";

interface BadgeProps {
  variant: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  video:   "bg-[#FFF1EB] text-[#FF5A1F] border border-transparent",
  lesson:  "bg-[#EEF2FF] text-[#4F46E5] border border-transparent",
  popular: "bg-[#FFF6F0] text-[#EA580C] border border-[#FCDCC9]",
};

const labels: Record<BadgeVariant, string> = {
  video:   "VIDEO",
  lesson:  "LESSON",
  popular: "POPULAR",
};

export function Badge({ variant, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase",
        "rounded-[var(--radius-xs)]",
        variantClasses[variant],
        className,
      )}
    >
      {labels[variant]}
    </span>
  );
}
