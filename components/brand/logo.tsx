import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ size = 24, className, showWordmark = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Orange triangle mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <polygon
          points="12,3 22,21 2,21"
          fill="#F97316"
          rx="2"
        />
      </svg>
      {showWordmark && (
        <span
          className="font-semibold text-neutral-900"
          style={{ fontSize: size * 0.75, fontFamily: "var(--font-sans)" }}
        >
          Vertex
        </span>
      )}
    </div>
  );
}
