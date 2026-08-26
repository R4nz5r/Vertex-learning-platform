import { cn } from "@/lib/utils";

type BadgeVariant = "video" | "lesson" | "popular";

interface BadgeProps {
  variant: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  video:   "bg-primary-100 text-primary-500",
  lesson:  "bg-indigo-100 text-indigo-700",
  popular: "bg-primary-100 text-primary-500 font-semibold",
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
        "inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wider uppercase",
        "rounded-[var(--radius-xs)]",
        variantClasses[variant],
        className,
      )}
    >
      {labels[variant]}
    </span>
  );
}
