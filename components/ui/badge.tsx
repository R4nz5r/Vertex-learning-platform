import { cn } from "@/lib/utils";

type BadgeVariant = "video" | "lesson" | "popular";

interface BadgeProps {
  variant: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  video:   "bg-primary-100 text-primary-500 border border-transparent",
  lesson:  "bg-emerald-50 text-emerald-600 border border-transparent",
  popular: "bg-transparent text-primary-500 border border-primary-500",
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
