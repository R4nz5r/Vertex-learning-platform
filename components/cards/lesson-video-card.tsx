import { Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LessonVideoCardProps {
  title: string;
  description: string;
  lessonLabel: string;
  duration: string;
  watchFrom: string;
  className?: string;
}

export function LessonVideoCard({
  title,
  description,
  lessonLabel,
  duration,
  watchFrom,
  className,
}: LessonVideoCardProps) {
  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <Badge variant="video" />
      <p className="text-body font-semibold text-neutral-900 leading-tight">{title}</p>
      <p className="text-small text-neutral-500 leading-relaxed">{description}</p>
      <div className="flex items-center justify-between border-t border-neutral-100 pt-3 text-[11px] text-neutral-500">
        <span>{lessonLabel} · {duration}</span>
        <button className="flex items-center gap-1 text-primary-500 font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 rounded-sm">
          <Play className="w-3.5 h-3.5 fill-primary-500" aria-hidden="true" strokeWidth={0} />
          Watch from {watchFrom}
        </button>
      </div>
    </Card>
  );
}
