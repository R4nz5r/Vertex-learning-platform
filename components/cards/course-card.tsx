import React from "react";
import { BarChart2, Clock, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CourseCardProps {
  icon?: React.ReactNode;
  logoChar?: string;
  logoBg?: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  modules: number;
  href?: string;
  className?: string;
}

export function CourseCard({
  icon,
  logoChar,
  logoBg = "#0F172A",
  title,
  description,
  level,
  duration,
  modules,
  href,
  className,
}: CourseCardProps) {
  const content = (
    <Card
      className={cn(
        "flex flex-col justify-between p-6 h-full bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200",
        className,
      )}
    >
      <div>
        {/* Icon / Logo */}
        <div className="mb-5">
          {icon ? (
            <div className="flex items-center">{icon}</div>
          ) : (
            <div
              className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center text-white font-bold text-base shrink-0"
              style={{ backgroundColor: logoBg }}
            >
              {logoChar}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-[19px] font-bold text-neutral-900 leading-snug mb-2.5">
          {title}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-neutral-500 leading-relaxed mb-6 min-h-[38px]">
          {description}
        </p>
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-100/80 pt-4 mt-auto whitespace-nowrap">
        <span className="inline-flex items-center gap-1">
          <BarChart2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" aria-hidden="true" />
          <span>{level}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" aria-hidden="true" />
          <span>{duration}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" aria-hidden="true" />
          <span>{modules} modules</span>
        </span>
      </div>
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-[var(--radius-lg)]">
        {content}
      </a>
    );
  }

  return content;
}

