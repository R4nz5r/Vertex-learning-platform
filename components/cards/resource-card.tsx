import { ExternalLink, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  title: string;
  description: string;
  fileType: string;
  fileSize: string;
  href?: string;
  className?: string;
}

export function ResourceCard({
  title,
  description,
  fileType,
  fileSize,
  href = "#",
  className,
}: ResourceCardProps) {
  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-start justify-between">
        <FileText className="w-5 h-5 text-neutral-500" aria-hidden="true" />
        <a
          href={href}
          className="text-neutral-400 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm"
          aria-label={`Open ${title}`}
        >
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
      <p className="text-body font-semibold text-neutral-900 leading-tight">{title}</p>
      <p className="text-small text-neutral-500 leading-relaxed">{description}</p>
      <p className="text-[11px] text-neutral-400 border-t border-neutral-100 pt-3">
        {fileType} · {fileSize}
      </p>
    </Card>
  );
}
