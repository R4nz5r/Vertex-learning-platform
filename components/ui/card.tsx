import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-neutral-200 rounded-[var(--radius-lg)] p-5",
        "shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
