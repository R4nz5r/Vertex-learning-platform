import React from "react";
import {
  Bell,
  Search,
  Play,
  FileText,
  Bookmark,
  Clock,
  User,
  ChevronRight,
  ChevronDown,
  Eye,
  Grid2x2,
  CircleUserRound,
  Target,
  ExternalLink,
  Layers,
  Lock,
  CheckCircle2,
  CircleDot,
  Signal,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/nav/navbar";

export const metadata = {
  title: "Design System | Vertex",
  description: "Vertex design tokens, components, and guidelines.",
};

/* ── Helpers ──────────────────────────────────────────────────────── */

/** Numbered section label matching reference: Orange number + uppercase title */
function SectionLabel({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
      <span className="text-[11px] font-bold text-[#FF5A1F] tracking-wider">{num}</span>
      <span className="text-[11px] font-bold tracking-[0.14em] text-[#0F172A] uppercase">{title}</span>
    </div>
  );
}

/** Swatch item for color display */
function Swatch({
  label,
  hex,
  bordered = false,
}: {
  label: string;
  hex: string;
  bordered?: boolean;
}) {
  return (
    <div className="flex flex-col flex-1 min-w-[70px] sm:min-w-[80px] max-w-[104px]">
      <div
        className={`h-12 sm:h-14 w-full rounded-[8px] transition-transform hover:scale-[1.03] duration-150 ${
          bordered ? "border border-neutral-200" : ""
        }`}
        style={{ backgroundColor: hex }}
      />
      <p className="text-[11px] sm:text-[11.5px] font-medium text-neutral-800 mt-2 leading-tight">{label}</p>
      <p className="text-[9.5px] sm:text-[10px] text-neutral-400 font-mono mt-0.5">{hex}</p>
    </div>
  );
}

/* ── Page Component (Mobile-First) ─────────────────────────────────── */

export default function DesignSystemPage() {
  return (
    <div
      className="min-h-screen w-full bg-[#FAF7F2] overflow-x-hidden selection:bg-primary-100 selection:text-primary-700"
      style={{
        backgroundImage: `repeating-linear-gradient(45deg, rgba(230, 220, 210, 0.45) 0, rgba(230, 220, 210, 0.45) 1px, transparent 0, transparent 12px)`,
        backgroundAttachment: "fixed",
      }}
    >
      {/* ── Center Framed Website Container (1440px) ── */}
      <div className="max-w-[1440px] w-full mx-auto min-h-screen bg-[#FAF7F2] border-x border-[#EBE4DC] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.02)] overflow-x-hidden">
        {/* ── Top Navigation Bar ── */}
        <Navbar
          links={[
            { label: "Courses", href: "/courses" },
            { label: "My Learning", href: "/my-learning" },
            { label: "Design System", href: "/design-system", active: true },
          ]}
          showActions={true}
          className="border-b border-[#EBE4DC] px-4 sm:px-8 lg:px-12 bg-[#FAF7F2]"
        />

        {/* ── Main Showcase Canvas ── */}
        <main className="flex-1 w-full max-w-[1340px] mx-auto px-3 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-10 space-y-4 sm:space-y-6">

          {/* ════════════════════════════════════════════════════════════
              ROW 1 | Header Brand Card + 01 COLORS
          ════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-[14px] sm:rounded-[16px] border border-[#EBE4DC] p-5 sm:p-8 lg:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 lg:gap-12 items-start">
              
              {/* Left Column: Brand Hero */}
              <div className="flex flex-col justify-between h-full">
                <div>
                  <Logo size={28} className="mb-5 sm:mb-6" />
                  <h1 className="font-display text-[32px] sm:text-[40px] lg:text-[44px] font-bold text-neutral-900 mb-3 sm:mb-4 leading-[1.1] tracking-tight">
                    Design System
                  </h1>
                  <p className="text-[13.5px] sm:text-[14px] text-neutral-500 leading-relaxed max-w-[280px]">
                    A unified design language for Vertex learning platform. Clean, modern and focused on clarity, consistency and intuitive learning experiences.
                  </p>
                </div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-neutral-400 uppercase mt-6 lg:mt-16">
                  VERSION 1.0 · MAY 2025
                </p>
              </div>

              {/* Right Column: 01 COLORS */}
              <div className="border-t border-[#EBE4DC] pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
                <SectionLabel num="01" title="COLORS" />

                {/* Primary Colors */}
                <div className="mb-6 sm:mb-8">
                  <p className="text-[12px] font-semibold text-neutral-800 mb-3">Primary</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 sm:gap-3.5">
                    <Swatch label="Primary 500" hex="#F97316" />
                    <Swatch label="Primary 400" hex="#FB923C" />
                    <Swatch label="Primary 300" hex="#FDBA74" />
                    <Swatch label="Primary 200" hex="#FED7AA" />
                    <Swatch label="Primary 100" hex="#FFEEE5" />
                  </div>
                </div>

                {/* Neutral Colors */}
                <div>
                  <p className="text-[12px] font-semibold text-neutral-800 mb-3">Neutral</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3.5">
                    <Swatch label="Neutral 900" hex="#0F172A" />
                    <Swatch label="Neutral 700" hex="#334155" />
                    <Swatch label="Neutral 500" hex="#64748B" />
                    <Swatch label="Neutral 300" hex="#CBD5E1" />
                    <Swatch label="Neutral 200" hex="#E2E8F0" />
                    <Swatch label="Neutral 100" hex="#F1F5F9" />
                    <Swatch label="Neutral 50" hex="#FAFAFC" bordered />
                    <Swatch label="White" hex="#FFFFFF" bordered />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              ROW 2 | 02 TYPOGRAPHY & 03 TYPE SCALE
          ════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 sm:gap-6 items-stretch">
            
            {/* Left Card: 02 TYPOGRAPHY */}
            <div className="bg-white rounded-[14px] sm:rounded-[16px] border border-[#EBE4DC] p-5 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div>
                <SectionLabel num="02" title="TYPOGRAPHY" />
                <div className="space-y-6 sm:space-y-8">
                  <div className="flex items-start gap-4 sm:gap-5">
                    <span className="font-display text-[48px] sm:text-[64px] font-bold text-neutral-900 leading-none select-none shrink-0">
                      Ag
                    </span>
                    <div className="pt-1">
                      <p className="font-display text-[18px] sm:text-[20px] font-bold text-neutral-900 leading-tight">
                        Playfair Display
                      </p>
                      <p className="text-[11.5px] sm:text-[12px] text-neutral-500 mt-1">
                        Elegant <span className="text-[#FF5A1F] mx-0.5">·</span> Readable <span className="text-[#FF5A1F] mx-0.5">·</span> Timeless
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 sm:gap-5">
                    <span className="font-sans text-[48px] sm:text-[64px] font-bold text-neutral-900 leading-none select-none shrink-0">
                      Ag
                    </span>
                    <div className="pt-1">
                      <p className="font-sans text-[18px] sm:text-[20px] font-bold text-neutral-900 leading-tight">
                        Inter
                      </p>
                      <p className="text-[11.5px] sm:text-[12px] text-neutral-500 mt-1">
                        Clean <span className="text-[#FF5A1F] mx-0.5">·</span> Modern <span className="text-[#FF5A1F] mx-0.5">·</span> Highly legible
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: 03 TYPE SCALE */}
            <div className="bg-white rounded-[14px] sm:rounded-[16px] border border-[#EBE4DC] p-5 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <SectionLabel num="03" title="TYPE SCALE" />
              <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                <table className="w-full text-left border-collapse min-w-[480px]">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="pb-3 pr-3 text-[11px] font-medium text-neutral-400">Style</th>
                      <th className="pb-3 pr-3 text-[11px] font-medium text-neutral-400">Font</th>
                      <th className="pb-3 pr-3 text-[11px] font-medium text-neutral-400">Size / Line Height</th>
                      <th className="pb-3 pr-3 text-[11px] font-medium text-neutral-400">Weight</th>
                      <th className="pb-3 text-[11px] font-medium text-neutral-400">Use</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {[
                      { style: "Display 1", font: "Playfair Display", size: "48 / 56", weight: "Bold", use: "Page titles", isSerif: true },
                      { style: "Display 2", font: "Playfair Display", size: "36 / 44", weight: "Bold", use: "Section titles", isSerif: true },
                      { style: "Heading 1", font: "Inter", size: "28 / 36", weight: "Semi Bold", use: "Card titles" },
                      { style: "Heading 2", font: "Inter", size: "22 / 30", weight: "Semi Bold", use: "Sub section" },
                      { style: "Heading 3", font: "Inter", size: "18 / 26", weight: "Medium", use: "Small titles" },
                      { style: "Body Large", font: "Inter", size: "16 / 24", weight: "Regular", use: "Body copy" },
                      { style: "Body", font: "Inter", size: "14 / 20", weight: "Regular", use: "Supporting text" },
                      { style: "Small", font: "Inter", size: "12 / 16", weight: "Regular", use: "Captions, meta" },
                    ].map((row) => (
                      <tr key={row.style} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2.5 pr-3 whitespace-nowrap">
                          <span className={`text-[13px] sm:text-[14px] text-neutral-900 font-semibold ${row.isSerif ? "font-display" : "font-sans"}`}>
                            {row.style}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-[12px] text-neutral-500 whitespace-nowrap">{row.font}</td>
                        <td className="py-2.5 pr-3 text-[12px] text-neutral-500 whitespace-nowrap font-mono">{row.size}</td>
                        <td className="py-2.5 pr-3 text-[12px] text-neutral-500 whitespace-nowrap">{row.weight}</td>
                        <td className="py-2.5 text-[12px] text-neutral-400 whitespace-nowrap">{row.use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* ════════════════════════════════════════════════════════════
              ROW 3 | 04 SPACING SYSTEM & 05 RADIUS & SHADOWS
          ════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            
            {/* Left Card: 04 SPACING SYSTEM */}
            <div className="bg-white rounded-[14px] sm:rounded-[16px] border border-[#EBE4DC] p-5 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between overflow-hidden">
              <div>
                <SectionLabel num="04" title="SPACING SYSTEM" />
                <p className="text-[13px] text-neutral-500 mb-6 sm:mb-8">Base unit: 4px</p>

                {/* Vertical Bar Scale Chart with mobile overflow protection */}
                <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 pb-2">
                  <div className="flex items-end justify-between gap-1 sm:gap-2.5 pt-4 pb-1 min-w-[340px] sm:min-w-0">
                    {[
                      { px: 4, rem: "0.25rem", height: 14, width: 14 },
                      { px: 8, rem: "0.5rem", height: 22, width: 18 },
                      { px: 12, rem: "0.75rem", height: 32, width: 22 },
                      { px: 16, rem: "1rem", height: 44, width: 28 },
                      { px: 24, rem: "1.5rem", height: 58, width: 34 },
                      { px: 32, rem: "2rem", height: 72, width: 40 },
                      { px: 40, rem: "2.5rem", height: 86, width: 46 },
                      { px: 48, rem: "3rem", height: 100, width: 52 },
                      { px: 64, rem: "4rem", height: 116, width: 58 },
                    ].map((bar) => (
                      <div key={bar.px} className="flex flex-col items-center gap-1 flex-1">
                        <div
                          className="bg-[#FDDBC9] hover:bg-[#FDBA74] rounded-[4px] transition-colors duration-150 cursor-pointer"
                          style={{ height: `${bar.height}px`, width: "100%", maxWidth: `${bar.width}px` }}
                        />
                        <span className="text-[10.5px] sm:text-[11px] font-bold text-neutral-800 mt-1.5">{bar.px}</span>
                        <span className="text-[8.5px] sm:text-[9.5px] text-neutral-400">({bar.rem})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: 05 RADIUS & SHADOWS */}
            <div className="bg-white rounded-[14px] sm:rounded-[16px] border border-[#EBE4DC] p-5 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <SectionLabel num="05" title="RADIUS & SHADOWS" />

              {/* Radius Scale */}
              <div className="mb-6 sm:mb-8">
                <p className="text-[12px] font-semibold text-neutral-800 mb-3">Radius</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
                  {[
                    { label: "4px\n(xs)", r: "4px" },
                    { label: "8px\n(sm)", r: "8px" },
                    { label: "12px\n(md)", r: "12px" },
                    { label: "16px\n(lg)", r: "16px" },
                    { label: "24px\n(xl)", r: "24px" },
                    { label: "Full\n(circle)", r: "9999px" },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-1.5">
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-50 border border-neutral-200 hover:border-primary-400 transition-colors"
                        style={{ borderRadius: item.r }}
                      />
                      <span className="text-[9px] sm:text-[9.5px] text-neutral-500 text-center whitespace-pre-line leading-tight">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shadow Scale */}
              <div>
                <p className="text-[12px] font-semibold text-neutral-800 mb-3">Shadows</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Sm", css: "0 1px 2px 0\nrgba(15, 23, 42, 0.05)", shadow: "0 1px 2px 0 rgba(15, 23, 42, 0.05)" },
                    { label: "Md", css: "0 4px 12px -2px\nrgba(15, 23, 42, 0.08)", shadow: "0 4px 12px -2px rgba(15, 23, 42, 0.08)" },
                    { label: "Lg", css: "0 12px 24px -4px\nrgba(15, 23, 42, 0.10)", shadow: "0 12px 24px -4px rgba(15, 23, 42, 0.10)" },
                    { label: "Xl", css: "0 20px 40px -8px\nrgba(15, 23, 42, 0.12)", shadow: "0 20px 40px -8px rgba(15, 23, 42, 0.12)" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-white p-2.5 sm:p-3 rounded-[12px] border border-neutral-100 flex flex-col justify-between min-h-[72px] sm:min-h-[78px] hover:translate-y-[-2px] transition-transform duration-150"
                      style={{ boxShadow: s.shadow }}
                    >
                      <span className="text-[12px] sm:text-[12.5px] font-bold text-neutral-800">{s.label}</span>
                      <span className="text-[8px] sm:text-[8.5px] text-neutral-400 font-mono whitespace-pre-line leading-tight">
                        {s.css}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* ════════════════════════════════════════════════════════════
              ROW 4 | 06 ICONS, 07 BUTTONS, 08 INPUTS
          ════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.8fr_1.3fr] gap-4 sm:gap-6 items-start">
            
            {/* 06 ICONS */}
            <div className="bg-white rounded-[14px] sm:rounded-[16px] border border-[#EBE4DC] p-5 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between">
              <div>
                <SectionLabel num="06" title="ICONS" />

                {/* Outline Style */}
                <div className="mb-5 sm:mb-6">
                  <p className="text-[12px] font-medium text-neutral-500 mb-3">Outline Style</p>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 text-neutral-700">
                    <Bell size={18} strokeWidth={1.75} className="hover:text-primary-600 transition-colors" />
                    <Search size={18} strokeWidth={1.75} className="hover:text-primary-600 transition-colors" />
                    <Play size={18} strokeWidth={1.75} className="hover:text-primary-600 transition-colors" />
                    <FileText size={18} strokeWidth={1.75} className="hover:text-primary-600 transition-colors" />
                    <Bookmark size={18} strokeWidth={1.75} className="hover:text-primary-600 transition-colors" />
                    <Signal size={18} strokeWidth={1.75} className="hover:text-primary-600 transition-colors" />
                    <Clock size={18} strokeWidth={1.75} className="hover:text-primary-600 transition-colors" />
                    <User size={18} strokeWidth={1.75} className="hover:text-primary-600 transition-colors" />
                    <ChevronRight size={18} strokeWidth={1.75} className="hover:text-primary-600 transition-colors" />
                  </div>
                </div>

                {/* Filled Style */}
                <div className="mb-5 sm:mb-6">
                  <p className="text-[12px] font-medium text-neutral-500 mb-3">Filled Style</p>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 text-neutral-800">
                    <Bell size={18} className="fill-neutral-900 hover:fill-primary-600 transition-colors" strokeWidth={0} />
                    <Search size={18} className="fill-neutral-900 hover:fill-primary-600 transition-colors" strokeWidth={0} />
                    <Play size={18} className="fill-neutral-900 hover:fill-primary-600 transition-colors" strokeWidth={0} />
                    <FileText size={18} className="fill-neutral-900 hover:fill-primary-600 transition-colors" strokeWidth={0} />
                    <Bookmark size={18} className="fill-neutral-900 hover:fill-primary-600 transition-colors" strokeWidth={0} />
                    <Signal size={18} className="fill-neutral-900 hover:fill-primary-600 transition-colors" strokeWidth={0} />
                    <Clock size={18} className="fill-neutral-900 hover:fill-primary-600 transition-colors" strokeWidth={0} />
                    <User size={18} className="fill-neutral-900 hover:fill-primary-600 transition-colors" strokeWidth={0} />
                    <ChevronRight size={18} strokeWidth={2.5} className="hover:text-primary-600 transition-colors" />
                  </div>
                </div>
              </div>

              {/* Icon Specs */}
              <div className="pt-4 border-t border-neutral-100">
                <p className="text-[12px] font-semibold text-neutral-800 mb-2">Icon Specs</p>
                <ul className="space-y-1 text-[11px] text-neutral-500 leading-relaxed">
                  <li>• 24x24px grid</li>
                  <li>• 2px stroke width (outline)</li>
                  <li>• Rounded line caps</li>
                  <li>• Consistent optical balance</li>
                </ul>
              </div>
            </div>

            {/* 07 BUTTONS */}
            <div className="bg-white rounded-[14px] sm:rounded-[16px] border border-[#EBE4DC] p-5 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <SectionLabel num="07" title="BUTTONS" />

              <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                <table className="w-full text-left border-collapse min-w-[460px]">
                  <thead>
                    <tr>
                      <th className="pb-3 pr-3 text-[11px] font-medium text-neutral-400 w-16" />
                      <th className="pb-3 pr-3 text-[11px] font-medium text-neutral-400">Primary</th>
                      <th className="pb-3 pr-3 text-[11px] font-medium text-neutral-400">Secondary</th>
                      <th className="pb-3 pr-3 text-[11px] font-medium text-neutral-400">Tertiary</th>
                      <th className="pb-3 text-[11px] font-medium text-neutral-400">Text</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {/* Default State (Static baseline, no hover changes) */}
                    <tr>
                      <td className="py-3 pr-3 text-[11.5px] font-medium text-neutral-500 whitespace-nowrap">Default</td>
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          className="h-[38px] px-3.5 rounded-[8px] font-medium text-[13px] text-white bg-gradient-to-b from-[#E76D42] to-[#D9572B] border border-[#D45428] shadow-[0_2px_8px_rgba(225,98,55,0.25)] select-none pointer-events-none"
                        >
                          Get Started
                        </button>
                      </td>
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          className="h-[38px] px-3.5 rounded-[8px] font-medium text-[13px] text-[#C24F1A] bg-white border border-[#FCDCC9] shadow-[0_1px_2px_rgba(0,0,0,0.02)] select-none pointer-events-none"
                        >
                          Explore Courses
                        </button>
                      </td>
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          className="h-[38px] px-3.5 rounded-[8px] font-medium text-[13px] text-neutral-700 bg-white border border-neutral-200 shadow-sm inline-flex items-center gap-1.5 select-none pointer-events-none"
                        >
                          <span>View Lesson</span>
                          <ExternalLink size={12} strokeWidth={2} />
                        </button>
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          className="h-[38px] px-2 font-medium text-[13px] text-[#C24F1A] inline-flex items-center gap-1.5 select-none pointer-events-none"
                        >
                          <span>Watch Video</span>
                          <Play size={12} className="fill-current" strokeWidth={0} />
                        </button>
                      </td>
                    </tr>

                    {/* Hover State (Demonstration of active hover states) */}
                    <tr>
                      <td className="py-3 pr-3 text-[11.5px] font-medium text-neutral-500 whitespace-nowrap">Hover</td>
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          className="h-[38px] px-3.5 rounded-[8px] font-medium text-[13px] text-white bg-[#B9380E] border border-[#A5300B] shadow-[0_4px_14px_rgba(185,56,14,0.38)] hover:bg-[#9B2F0B] active:translate-y-px transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        >
                          Get Started
                        </button>
                      </td>
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          className="h-[38px] px-3.5 rounded-[8px] font-medium text-[13px] text-[#A7320C] bg-[#FFF6F0] border border-[#F97316] hover:bg-[#FFEAE0] hover:border-[#EA580C] active:translate-y-px transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        >
                          Explore Courses
                        </button>
                      </td>
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          className="h-[38px] px-3.5 rounded-[8px] font-medium text-[13px] text-neutral-900 bg-neutral-100 border border-neutral-300 hover:bg-neutral-200 inline-flex items-center gap-1.5 active:translate-y-px transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        >
                          <span>View Lesson</span>
                          <ExternalLink size={12} strokeWidth={2} />
                        </button>
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          className="h-[38px] px-2 font-medium text-[13px] text-[#9A2C0A] underline inline-flex items-center gap-1.5 hover:text-[#7C2307] active:translate-y-px transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        >
                          <span>Watch Video</span>
                          <Play size={12} className="fill-current" strokeWidth={0} />
                        </button>
                      </td>
                    </tr>

                    {/* Disabled State */}
                    <tr>
                      <td className="py-3 pr-3 text-[11.5px] font-medium text-neutral-500 whitespace-nowrap">Disabled</td>
                      <td className="py-3 pr-3">
                        <button disabled className="h-[38px] px-3.5 rounded-[8px] font-medium text-[13px] text-white/80 bg-[#FFD4C2] border border-transparent cursor-not-allowed">
                          Get Started
                        </button>
                      </td>
                      <td className="py-3 pr-3">
                        <button disabled className="h-[38px] px-3.5 rounded-[8px] font-medium text-[13px] text-[#FDBA74] bg-white border border-[#FED7AA] cursor-not-allowed">
                          Explore Courses
                        </button>
                      </td>
                      <td className="py-3 pr-3">
                        <button disabled className="h-[38px] px-3.5 rounded-[8px] font-medium text-[13px] text-neutral-300 bg-neutral-50 border border-neutral-200 inline-flex items-center gap-1.5 cursor-not-allowed">
                          <span>View Lesson</span>
                          <ExternalLink size={12} strokeWidth={1.5} />
                        </button>
                      </td>
                      <td className="py-3">
                        <button disabled className="h-[38px] px-2 font-medium text-[13px] text-neutral-300 inline-flex items-center gap-1.5 cursor-not-allowed">
                          <span>Watch Video</span>
                          <Play size={12} className="fill-neutral-300" strokeWidth={0} />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Button Specs */}
              <div className="pt-4 mt-2 border-t border-neutral-100">
                <p className="text-[12px] font-semibold text-neutral-800 mb-2">Button Specs</p>
                <ul className="space-y-1 text-[11px] text-neutral-500 leading-relaxed">
                  <li>• Height: 44px (default)</li>
                  <li>• Padding: 0 16px (lg), 0 12px (md)</li>
                  <li>• Radius: 12px</li>
                  <li>• Font: Inter Medium (14–16px)</li>
                </ul>
              </div>
            </div>

            {/* 08 INPUTS */}
            <div className="bg-white rounded-[14px] sm:rounded-[16px] border border-[#EBE4DC] p-5 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between">
              <div>
                <SectionLabel num="08" title="INPUTS" />

                {/* Search Input */}
                <div className="mb-5">
                  <p className="text-[12px] font-medium text-neutral-500 mb-2">Search / Text Input</p>
                  <div className="relative flex items-center h-[42px] px-3.5 rounded-[10px] border border-[#E2E8F0] bg-white shadow-xs focus-within:border-[#F97316] focus-within:ring-1 focus-within:ring-[#F97316] transition-all">
                    <Search className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
                    <span className="text-[13px] text-neutral-400 flex-1 select-none">Search anything...</span>
                    <span className="text-[10.5px] font-semibold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                      ⌘ K
                    </span>
                  </div>
                </div>

                {/* Select Dropdown */}
                <div className="mb-6">
                  <p className="text-[12px] font-medium text-neutral-500 mb-2">Select</p>
                  <div className="flex items-center justify-between h-[42px] px-3.5 rounded-[10px] border border-[#E2E8F0] bg-white shadow-xs cursor-pointer hover:border-neutral-300 transition-colors">
                    <span className="text-[13px] text-neutral-800">Most Relevant</span>
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  </div>
                </div>
              </div>

              {/* Field Specs */}
              <div className="pt-4 border-t border-neutral-100">
                <p className="text-[12px] font-semibold text-neutral-800 mb-2">Field Specs</p>
                <ul className="space-y-1 text-[11px] text-neutral-500 leading-relaxed">
                  <li>• Height: 44px</li>
                  <li>• Radius: 12px</li>
                  <li>• Border: 1px solid #E2E8F0</li>
                  <li>• Padding: 0 16px</li>
                  <li>• Focus: Border color #FB923C</li>
                </ul>
              </div>
            </div>

          </div>

          {/* ════════════════════════════════════════════════════════════
              ROW 5 | 09 BADGES, 10 STATUS, 11 PROGRESS BAR
          ════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-[14px] sm:rounded-[16px] border border-[#EBE4DC] p-5 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
              
              {/* 09 BADGES / TAGS */}
              <div>
                <SectionLabel num="09" title="BADGES / TAGS" />
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[11px] text-neutral-500 mb-2">Video</p>
                    <Badge variant="video" className="hover:opacity-90 transition-opacity cursor-pointer" />
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-500 mb-2">Lesson</p>
                    <Badge variant="lesson" className="hover:opacity-90 transition-opacity cursor-pointer" />
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-500 mb-2">Popular</p>
                    <Badge variant="popular" className="hover:opacity-90 transition-opacity cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* 10 STATUS / INDICATORS */}
              <div className="border-t border-[#EBE4DC] pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-8">
                <SectionLabel num="10" title="STATUS / INDICATORS" />
                <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-3">
                  <div className="inline-flex items-center gap-1.5 text-[12px] sm:text-[12.5px] font-medium text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer">
                    <CircleDot className="w-4 h-4 text-[#F97316]" />
                    <span>In Progress</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[12px] sm:text-[12.5px] font-medium text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Completed</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[12px] sm:text-[12.5px] font-medium text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer">
                    <div className="w-4 h-4 rounded-full bg-[#EA580C] flex items-center justify-center">
                      <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
                    </div>
                    <span>Now Playing</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[12px] sm:text-[12.5px] font-medium text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer">
                    <Lock className="w-4 h-4 text-neutral-400" />
                    <span>Locked</span>
                  </div>
                </div>
              </div>

              {/* 11 PROGRESS BAR */}
              <div className="border-t border-[#EBE4DC] pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-8">
                <SectionLabel num="11" title="PROGRESS BAR" />
                <div className="flex items-center gap-3 sm:gap-4 mt-2">
                  <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#F97316] to-[#EA580C] rounded-full transition-all duration-300"
                      style={{ width: "35%" }}
                    />
                  </div>
                  <span className="text-[11.5px] sm:text-[12px] font-medium text-neutral-700 whitespace-nowrap">
                    35% complete
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              ROW 6 | 12 CARDS
          ════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-[14px] sm:rounded-[16px] border border-[#EBE4DC] p-5 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <SectionLabel num="12" title="CARDS" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch">
              
              {/* Card 1: Course Card */}
              <div className="flex flex-col h-full">
                <p className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                  Course Card
                </p>
                <div className="bg-white rounded-[14px] border border-[#EBE4DC] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-[#FCDCC9] transition-all duration-200 flex flex-col justify-between flex-1 min-h-[220px]">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-[14px] shrink-0">
                        N
                      </div>
                      <h3 className="text-[14px] sm:text-[14.5px] font-bold text-neutral-900 leading-snug">
                        Next.js for Production
                      </h3>
                    </div>
                    <p className="text-[12px] text-neutral-500 leading-relaxed">
                      Build scalable, high-performance web applications with Next.js.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-3.5 border-t border-neutral-100 mt-4 gap-2">
                    <span className="inline-flex items-center gap-1 shrink-0"><Signal size={12} className="text-neutral-400" /> Intermediate</span>
                    <span className="inline-flex items-center gap-1 shrink-0"><Clock size={12} className="text-neutral-400" /> 18h 24m</span>
                    <span className="inline-flex items-center gap-1 shrink-0"><Layers size={12} className="text-neutral-400" /> 12 modules</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Lesson Card (Video) */}
              <div className="flex flex-col h-full">
                <p className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                  Lesson Card (Video)
                </p>
                <div className="bg-white rounded-[14px] border border-[#EBE4DC] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-[#FCDCC9] transition-all duration-200 flex flex-col justify-between flex-1 min-h-[220px]">
                  <div>
                    <div className="mb-2.5">
                      <Badge variant="video" />
                    </div>
                    <h3 className="text-[14px] font-bold text-neutral-900 leading-snug mb-1.5">
                      Data Fetching in Server Components
                    </h3>
                    <p className="text-[12px] text-neutral-500 leading-relaxed">
                      Learn how to fetch data on the server using async/await and Next.js best practices.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-3.5 border-t border-neutral-100 mt-4 gap-2">
                    <span className="text-neutral-500 shrink-0">Lesson 5.1 · 12:45</span>
                    <span className="inline-flex items-center gap-1 text-[#EA580C] font-semibold hover:underline cursor-pointer shrink-0">
                      <Play size={11} className="fill-[#EA580C]" strokeWidth={0} /> Watch from 12:45
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Lesson Card (Lesson) */}
              <div className="flex flex-col h-full">
                <p className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                  Lesson Card (Lesson)
                </p>
                <div className="bg-white rounded-[14px] border border-[#EBE4DC] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-[#FCDCC9] transition-all duration-200 flex flex-col justify-between flex-1 min-h-[220px]">
                  <div>
                    <div className="mb-2.5">
                      <Badge variant="lesson" />
                    </div>
                    <h3 className="text-[14px] font-bold text-neutral-900 leading-snug mb-1.5">
                      Data Fetching & Caching
                    </h3>
                    <p className="text-[12px] text-neutral-500 leading-relaxed">
                      Explore different data fetching methods in Next.js and how to cache and revalidate data for optimal performance.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-3.5 border-t border-neutral-100 mt-4 gap-2">
                    <span className="text-neutral-500 shrink-0">Module 5</span>
                    <span className="inline-flex items-center gap-1 text-[#EA580C] font-semibold hover:underline cursor-pointer shrink-0">
                      View lesson <ExternalLink size={11} strokeWidth={2} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 4: Resource Card */}
              <div className="flex flex-col h-full">
                <p className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                  Resource Card
                </p>
                <div className="bg-white rounded-[14px] border border-[#EBE4DC] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-[#FCDCC9] transition-all duration-200 flex flex-col justify-between flex-1 min-h-[220px]">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 mb-3">
                      <FileText size={16} strokeWidth={1.75} />
                    </div>
                    <h3 className="text-[14px] font-bold text-neutral-900 leading-snug mb-1.5">
                      Caching and Revalidation Guide
                    </h3>
                    <p className="text-[12px] text-neutral-500 leading-relaxed">
                      Deep dive into Next.js caching strategies.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-3.5 border-t border-neutral-100 mt-4 gap-2">
                    <span className="text-neutral-500 shrink-0">PDF · 1.2 MB</span>
                    <ExternalLink size={13} className="text-[#EA580C] hover:scale-110 transition-transform cursor-pointer shrink-0" strokeWidth={2} />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              ROW 7 | 13 NAVIGATION
          ════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-[14px] sm:rounded-[16px] border border-[#EBE4DC] p-5 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <SectionLabel num="13" title="NAVIGATION" />
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1.5fr_1fr] gap-6 lg:gap-8 items-center">
              
              {/* Mini Navbar Mockup */}
              <div className="flex items-center gap-4 sm:gap-6 h-11 px-4 border border-[#EBE4DC] rounded-[10px] bg-[#FAF7F2]">
                <Logo size={18} />
                <div className="flex items-center gap-3 sm:gap-4 text-[12.5px] sm:text-[13px]">
                  <span className="font-semibold text-[#F97316]">Courses</span>
                  <span className="font-medium text-neutral-700">My Learning</span>
                </div>
              </div>

              {/* Breadcrumbs Mockup */}
              <div>
                <p className="text-[11px] font-medium text-neutral-400 mb-1.5">Breadcrumbs</p>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[12.5px] text-neutral-500 flex-wrap">
                  <span className="text-neutral-700 hover:text-neutral-900 cursor-pointer">All Courses</span>
                  <ChevronRight size={13} className="text-neutral-400" />
                  <span className="text-neutral-700 hover:text-neutral-900 cursor-pointer">Next.js for Production</span>
                  <ChevronRight size={13} className="text-neutral-400" />
                  <span className="text-neutral-400">Data Fetching & Caching</span>
                </div>
              </div>

              {/* Pagination Mockup */}
              <div>
                <p className="text-[11px] font-medium text-neutral-400 mb-1.5">Pagination</p>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[13px]">
                  <button className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors">
                    ‹
                  </button>
                  <button className="w-7 h-7 rounded-[6px] border border-[#F97316] bg-white text-[#EA580C] font-semibold flex items-center justify-center shadow-xs">
                    1
                  </button>
                  <button className="w-7 h-7 rounded-[6px] text-neutral-600 hover:bg-neutral-100 flex items-center justify-center transition-colors">
                    2
                  </button>
                  <button className="w-7 h-7 rounded-[6px] text-neutral-600 hover:bg-neutral-100 flex items-center justify-center transition-colors">
                    3
                  </button>
                  <span className="text-neutral-400 px-0.5">…</span>
                  <button className="w-7 h-7 rounded-[6px] text-neutral-600 hover:bg-neutral-100 flex items-center justify-center transition-colors">
                    8
                  </button>
                  <button className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors">
                    ›
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              ROW 8 | 14 PRINCIPLES
          ════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-[14px] sm:rounded-[16px] border border-[#EBE4DC] p-5 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <SectionLabel num="14" title="PRINCIPLES" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              
              <div className="flex items-start gap-3.5 p-2 rounded-lg hover:bg-neutral-50/70 transition-colors">
                <div className="w-10 h-10 rounded-full bg-neutral-100/90 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5 text-neutral-700" strokeWidth={1.75} />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-neutral-900 leading-snug">Clarity First</h4>
                  <p className="text-[12px] text-neutral-500 leading-relaxed mt-1">
                    Every element should communicate clearly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-2 rounded-lg hover:bg-neutral-50/70 transition-colors">
                <div className="w-10 h-10 rounded-full bg-neutral-100/90 flex items-center justify-center shrink-0">
                  <Grid2x2 className="w-5 h-5 text-neutral-700" strokeWidth={1.75} />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-neutral-900 leading-snug">Consistency</h4>
                  <p className="text-[12px] text-neutral-500 leading-relaxed mt-1">
                    Use components and patterns consistently across the platform.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-2 rounded-lg hover:bg-neutral-50/70 transition-colors">
                <div className="w-10 h-10 rounded-full bg-neutral-100/90 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5 text-neutral-700" strokeWidth={1.75} />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-neutral-900 leading-snug">Focus & Calm</h4>
                  <p className="text-[12px] text-neutral-500 leading-relaxed mt-1">
                    Remove noise and help learners focus on what matters.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-2 rounded-lg hover:bg-neutral-50/70 transition-colors">
                <div className="w-10 h-10 rounded-full bg-neutral-100/90 flex items-center justify-center shrink-0">
                  <CircleUserRound className="w-5 h-5 text-neutral-700" strokeWidth={1.75} />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-neutral-900 leading-snug">Accessible</h4>
                  <p className="text-[12px] text-neutral-500 leading-relaxed mt-1">
                    Design with accessibility and inclusivity in mind.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
