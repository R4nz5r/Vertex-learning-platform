import { CheckCircle, Circle, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusVariant = "in-progress" | "completed" | "now-playing" | "locked";

interface StatusIndicatorProps {
  variant: StatusVariant;
  className?: string;
}

const config: Record<StatusVariant, { label: string; icon: React.ReactNode }> = {
  "in-progress": {
    label: "In Progress",
    icon: (
      <span className="relative inline-flex w-5 h-5" aria-hidden="true">
        {/* Track ring */}
        <Circle className="w-5 h-5 text-neutral-200 absolute" strokeWidth={2} />
        {/* Progress arc via clip — approximate with a partial border using CSS */}
        <svg width="20" height="20" viewBox="0 0 20 20" className="absolute" fill="none">
          <circle
            cx="10" cy="10" r="8"
            stroke="#F97316"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="20 31"
            transform="rotate(-90 10 10)"
          />
        </svg>
      </span>
    ),
  },
  "completed": {
    label: "Completed",
    icon: <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={2} aria-hidden="true" />,
  },
  "now-playing": {
    label: "Now Playing",
    icon: (
      <span className="relative inline-flex w-5 h-5 items-center justify-center" aria-hidden="true">
        <span className="absolute inset-0 rounded-full bg-primary-500" />
        <Play className="relative w-2.5 h-2.5 text-white fill-white" strokeWidth={0} />
      </span>
    ),
  },
  "locked": {
    label: "Locked",
    icon: <Lock className="w-5 h-5 text-neutral-300" strokeWidth={2} aria-hidden="true" />,
  },
};

export function StatusIndicator({ variant, className }: StatusIndicatorProps) {
  const { label, icon } = config[variant];
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {icon}
      <span className="text-body text-neutral-700">{label}</span>
    </div>
  );
}
