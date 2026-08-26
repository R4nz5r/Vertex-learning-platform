import { BarChart2, BookOpen, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  logoChar: string;
  logoBg?: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  modules: number;
  className?: string;
}

export function CourseCard({
  logoChar,
  logoBg = "#0F172A",
  title,
  description,
  level,
  duration,
  modules,
  className,
}: CourseCardProps) {
  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center text-white font-bold text-base shrink-0"
          style={{ backgroundColor: logoBg }}
        >
          {logoChar}
        </div>
        <p className="text-body font-semibold text-neutral-900 leading-tight">{title}</p>
      </div>

      {/* Description */}
      <p className="text-small text-neutral-500 leading-relaxed">{description}</p>

      {/* Meta */}
      <div className="flex items-center gap-3 text-[11px] text-neutral-500 border-t border-neutral-100 pt-3 flex-wrap">
        <span className="flex items-center gap-1">
          <BarChart2 className="w-3 h-3" aria-hidden="true" />
          {level}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" aria-hidden="true" />
          {duration}
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3" aria-hidden="true" />
          {modules} modules
        </span>
      </div>
    </Card>
  );
}
