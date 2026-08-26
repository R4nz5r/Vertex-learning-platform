import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  title: string;
  description: string;
  moduleLabel: string;
  href?: string;
  className?: string;
}

export function LessonCard({
  title,
  description,
  moduleLabel,
  href = "#",
  className,
}: LessonCardProps) {
  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <Badge variant="lesson" />
      <p className="text-body font-semibold text-neutral-900 leading-tight">{title}</p>
      <p className="text-small text-neutral-500 leading-relaxed">{description}</p>
      <div className="flex items-center justify-between border-t border-neutral-100 pt-3 text-[11px] text-neutral-500">
        <span>{moduleLabel}</span>
        <a
          href={href}
          className="flex items-center gap-1 text-primary-500 font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 rounded-sm"
        >
          View lesson <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>
    </Card>
  );
}
