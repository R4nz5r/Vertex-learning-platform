import React from "react";
import {
  Layers,
  Database,
  Gauge,
  Cloud,
  Code2,
  Shield,
  Brain,
  Workflow,
  Rocket,
  Cpu,
  Globe,
  Sparkles,
} from "lucide-react";

interface LearningOutcomeItem {
  _key?: string;
  icon?: string | null;
  title: string;
  description?: string | null;
}

interface LearningOutcomesProps {
  outcomes?: LearningOutcomeItem[];
}

function resolveOutcomeIcon(iconName?: string | null) {
  const normalized = (iconName || "").toLowerCase().trim();
  switch (normalized) {
    case "layers":
    case "stack":
      return <Layers className="w-8 h-8 text-[#C24F1A]" strokeWidth={1.5} />;
    case "database":
    case "storage":
    case "cylinder":
      return <Database className="w-8 h-8 text-[#C24F1A]" strokeWidth={1.5} />;
    case "gauge":
    case "performance":
    case "speed":
      return <Gauge className="w-8 h-8 text-[#C24F1A]" strokeWidth={1.5} />;
    case "cloud":
    case "deployment":
      return <Cloud className="w-8 h-8 text-[#C24F1A]" strokeWidth={1.5} />;
    case "code":
      return <Code2 className="w-8 h-8 text-[#C24F1A]" strokeWidth={1.5} />;
    case "shield":
    case "security":
      return <Shield className="w-8 h-8 text-[#C24F1A]" strokeWidth={1.5} />;
    case "brain":
    case "ai":
      return <Brain className="w-8 h-8 text-[#C24F1A]" strokeWidth={1.5} />;
    case "workflow":
      return <Workflow className="w-8 h-8 text-[#C24F1A]" strokeWidth={1.5} />;
    case "rocket":
      return <Rocket className="w-8 h-8 text-[#C24F1A]" strokeWidth={1.5} />;
    case "cpu":
      return <Cpu className="w-8 h-8 text-[#C24F1A]" strokeWidth={1.5} />;
    case "globe":
      return <Globe className="w-8 h-8 text-[#C24F1A]" strokeWidth={1.5} />;
    default:
      return <Sparkles className="w-8 h-8 text-[#C24F1A]" strokeWidth={1.5} />;
  }
}

export function LearningOutcomes({ outcomes }: LearningOutcomesProps) {
  if (!outcomes || outcomes.length === 0) return null;

  return (
    <section
      className="w-full rounded-2xl bg-white border border-[#EBE4DC] p-6 sm:p-8 lg:p-10 mb-12 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
      aria-labelledby="what-youll-learn-heading"
    >
      <h2
        id="what-youll-learn-heading"
        className="font-display text-[22px] sm:text-[26px] font-bold text-neutral-900 mb-6 sm:mb-8 tracking-tight"
      >
        What you&apos;ll learn
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {outcomes.map((item, idx) => (
          <div
            key={item._key || idx}
            className="flex items-start gap-4 sm:gap-5 p-5 sm:p-6 rounded-xl border border-[#EBE4DC] bg-white hover:border-[#D6CCC2] transition-colors"
          >
            <div className="shrink-0 flex items-center justify-center pt-0.5">
              {resolveOutcomeIcon(item.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[15px] sm:text-[16px] text-neutral-900 mb-1.5 leading-snug">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-[13.5px] sm:text-[14px] text-neutral-500 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
