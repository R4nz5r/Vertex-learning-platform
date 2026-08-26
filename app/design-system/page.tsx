/**
 * Vertex Design System — /design-system showcase
 * Layout mirrors the reference sheet: sections sit side-by-side in
 * 2-col, 3-col and 4-col grids, matching the horizontal arrangement
 * shown in design/vertex-designsystem.png.
 */
import {
  Bell, Search, Play, FileText, Bookmark, BarChart2, Clock,
  User, ChevronRight, Eye, Grid2x2, CircleUserRound, Target,
} from "lucide-react";

import { Logo }              from "@/components/brand/logo";
import { Button }            from "@/components/ui/button";
import { Badge }             from "@/components/ui/badge";
import { StatusIndicator }   from "@/components/ui/status-indicator";
import { ProgressBar }       from "@/components/ui/progress-bar";
import { SearchInput }       from "@/components/ui/search-input";
import { Select }            from "@/components/ui/select";
import { CourseCard }        from "@/components/cards/course-card";
import { LessonVideoCard }   from "@/components/cards/lesson-video-card";
import { LessonCard }        from "@/components/cards/lesson-card";
import { ResourceCard }      from "@/components/cards/resource-card";
import { Navbar }            from "@/components/nav/navbar";
import { Breadcrumbs }       from "@/components/nav/breadcrumbs";
import { Pagination }        from "@/components/nav/pagination";

export const metadata = {
  title: "Design System | Vertex",
  description: "Vertex design tokens, components, and guidelines.",
};

/* ── helpers ─────────────────────────────────────────────────────────── */

function SectionLabel({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">{num}</span>
      <span className="text-[11px] font-semibold tracking-widest text-neutral-700 uppercase">{title}</span>
    </div>
  );
}

function Divider() {
  return <div className="border-b border-neutral-100 my-10" />;
}

function Swatch({ label, hex }: { label: string; hex: string }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[72px]">
      <div className="w-full h-14 rounded-[var(--radius-md)] border border-neutral-200" style={{ backgroundColor: hex }} />
      <p className="text-[11px] font-medium text-neutral-700">{label}</p>
      <p className="text-[10px] text-neutral-400">{hex}</p>
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────────── */

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Sticky nav */}
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-6 py-14 space-y-0">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ROW 1: Title block (left) + 01 Colors (right)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 items-start">
          {/* Title block */}
          <div>
            <Logo size={32} className="mb-5" />
            <h1 className="text-display-1 text-neutral-900 mb-4">Design System</h1>
            <p className="text-body-lg text-neutral-500 mb-6 max-w-[240px]">
              A unified design language for Vertex learning platform. Clean, modern and focused on
              clarity, consistency and intuitive learning experiences.
            </p>
            <p className="text-small text-neutral-400 tracking-widest uppercase">Version 1.0 · May 2025</p>
          </div>

          {/* 01 Colors */}
          <div>
            <SectionLabel num="01" title="Colors" />
            <div className="space-y-6">
              <div>
                <p className="text-small font-semibold text-neutral-700 mb-3">Primary</p>
                <div className="flex flex-wrap gap-3">
                  <Swatch label="Primary 500" hex="#F97316" />
                  <Swatch label="Primary 400" hex="#FB923C" />
                  <Swatch label="Primary 300" hex="#FDBA74" />
                  <Swatch label="Primary 200" hex="#FED7AA" />
                  <Swatch label="Primary 100" hex="#FFEEE5" />
                </div>
              </div>
              <div>
                <p className="text-small font-semibold text-neutral-700 mb-3">Neutral</p>
                <div className="flex flex-wrap gap-3">
                  <Swatch label="Neutral 900" hex="#0F172A" />
                  <Swatch label="Neutral 700" hex="#334155" />
                  <Swatch label="Neutral 500" hex="#64748B" />
                  <Swatch label="Neutral 300" hex="#CBD5E1" />
                  <Swatch label="Neutral 200" hex="#E2E8F0" />
                  <Swatch label="Neutral 100" hex="#F1F5F9" />
                  <Swatch label="Neutral 50"  hex="#FAFAFC" />
                  <Swatch label="White"        hex="#FFFFFF" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ROW 2: 02 Typography (left) + 03 Type Scale (right)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 items-start">
          {/* 02 Typography specimens */}
          <div>
            <SectionLabel num="02" title="Typography" />
            <div className="space-y-8">
              <div>
                <p className="font-display text-[64px] font-bold leading-none text-neutral-900 mb-1" aria-label="Playfair Display">Ag</p>
                <p className="text-heading-3 text-neutral-900 mb-0.5">Playfair Display</p>
                <p className="text-small text-neutral-500">Elegant · Readable · Timeless</p>
              </div>
              <div>
                <p className="font-sans text-[64px] font-bold leading-none text-neutral-900 mb-1" aria-label="Inter">Ag</p>
                <p className="text-heading-3 text-neutral-900 mb-0.5">Inter</p>
                <p className="text-small text-neutral-500">Clean · Modern · Highly legible</p>
              </div>
            </div>
          </div>

          {/* 03 Type scale table */}
          <div>
            <SectionLabel num="03" title="Type Scale" />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100">
                    {["Style", "Font", "Size / Line Height", "Weight", "Use"].map((h) => (
                      <th key={h} className="pb-2 pr-6 text-[11px] font-semibold text-neutral-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { style: "Display 1",  cls: "text-display-1",  font: "Playfair Display", size: "48 / 56", weight: "Bold",     use: "Page titles" },
                    { style: "Display 2",  cls: "text-display-2",  font: "Playfair Display", size: "36 / 44", weight: "Bold",     use: "Section titles" },
                    { style: "Heading 1",  cls: "text-heading-1",  font: "Inter",            size: "28 / 36", weight: "Semi Bold", use: "Card titles" },
                    { style: "Heading 2",  cls: "text-heading-2",  font: "Inter",            size: "22 / 30", weight: "Semi Bold", use: "Sub section" },
                    { style: "Heading 3",  cls: "text-heading-3",  font: "Inter",            size: "18 / 26", weight: "Medium",   use: "Small titles" },
                    { style: "Body Large", cls: "text-body-lg",    font: "Inter",            size: "16 / 24", weight: "Regular",  use: "Body copy" },
                    { style: "Body",       cls: "text-body",       font: "Inter",            size: "14 / 20", weight: "Regular",  use: "Supporting text" },
                    { style: "Small",      cls: "text-small",      font: "Inter",            size: "12 / 16", weight: "Regular",  use: "Captions, meta" },
                  ].map(({ style, cls, font, size, weight, use }) => (
                    <tr key={style} className="border-b border-neutral-50">
                      <td className="py-2 pr-6">
                        <span className={cls + " text-neutral-900"}>{style}</span>
                      </td>
                      <td className="py-2 pr-6 text-small text-neutral-500 whitespace-nowrap">{font}</td>
                      <td className="py-2 pr-6 text-small text-neutral-500 whitespace-nowrap">{size}</td>
                      <td className="py-2 pr-6 text-small text-neutral-500 whitespace-nowrap">{weight}</td>
                      <td className="py-2 text-small text-neutral-400 whitespace-nowrap">{use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Divider />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ROW 3: 04 Spacing (left) + 05 Radius & Shadows (right)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* 04 Spacing */}
          <div>
            <SectionLabel num="04" title="Spacing System" />
            <p className="text-small text-neutral-500 mb-6">Base unit: 4px</p>
            <div className="flex flex-wrap items-end gap-5">
              {[
                { px: 4,  rem: "0.25rem" },
                { px: 8,  rem: "0.5rem" },
                { px: 12, rem: "0.75rem" },
                { px: 16, rem: "1rem" },
                { px: 24, rem: "1.5rem" },
                { px: 32, rem: "2rem" },
                { px: 40, rem: "2.5rem" },
                { px: 48, rem: "3rem" },
                { px: 64, rem: "4rem" },
              ].map(({ px, rem }) => (
                <div key={px} className="flex flex-col items-center gap-1.5">
                  <div
                    className="bg-primary-100 rounded-[var(--radius-xs)]"
                    style={{ width: px, height: px }}
                  />
                  <span className="text-[11px] font-semibold text-neutral-700">{px}</span>
                  <span className="text-[10px] text-neutral-400">({rem})</span>
                </div>
              ))}
            </div>
          </div>

          {/* 05 Radius & Shadows */}
          <div>
            <SectionLabel num="05" title="Radius & Shadows" />
            <div className="space-y-8">
              {/* Radius */}
              <div>
                <p className="text-small font-semibold text-neutral-700 mb-4">Radius</p>
                <div className="flex flex-wrap gap-4">
                  {[
                    { label: "4px\n(xs)",   r: "4px",    w: 52 },
                    { label: "8px\n(sm)",   r: "8px",    w: 60 },
                    { label: "12px\n(md)",  r: "12px",   w: 68 },
                    { label: "16px\n(lg)",  r: "16px",   w: 76 },
                    { label: "24px\n(xl)",  r: "24px",   w: 84 },
                    { label: "Full\n(circle)", r: "9999px", w: 52 },
                  ].map(({ label, r, w }) => (
                    <div key={label} className="flex flex-col items-center gap-2">
                      <div
                        className="h-11 bg-neutral-100 border border-neutral-200"
                        style={{ width: w, borderRadius: r }}
                      />
                      <span className="text-[10px] text-neutral-500 text-center whitespace-pre-line">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shadows */}
              <div>
                <p className="text-small font-semibold text-neutral-700 mb-4">Shadows</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Sm", shadow: "0 1px 2px 0 rgba(15,23,42,0.05)",    css: "0 1px 2px 0\nrgba(15, 23, 42, 0.05)" },
                    { label: "Md", shadow: "0 4px 12px -2px rgba(15,23,42,0.08)", css: "0 4px 12px -2px\nrgba(15, 23, 42, 0.08)" },
                    { label: "Lg", shadow: "0 12px 24px -4px rgba(15,23,42,0.10)",css: "0 12px 24px -4px\nrgba(15, 23, 42, 0.10)" },
                    { label: "Xl", shadow: "0 20px 40px -8px rgba(15,23,42,0.12)",css: "0 20px 40px -8px\nrgba(15, 23, 42, 0.12)" },
                  ].map(({ label, shadow, css }) => (
                    <div key={label} className="flex flex-col gap-2">
                      <div
                        className="h-12 bg-white rounded-[var(--radius-md)] border border-neutral-100 flex items-center justify-center"
                        style={{ boxShadow: shadow }}
                      >
                        <span className="text-small font-semibold text-neutral-700">{label}</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 whitespace-pre-line">{css}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ROW 4: 06 Icons | 07 Buttons | 08 Inputs  (3 cols)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_220px] gap-10 items-start">

          {/* 06 Icons */}
          <div>
            <SectionLabel num="06" title="Icons" />
            {[
              { label: "Outline Style", fill: false },
              { label: "Filed Style",   fill: true },
            ].map(({ label, fill }) => (
              <div key={label} className="mb-5">
                <p className="text-small text-neutral-500 mb-3">{label}</p>
                <div className="flex flex-wrap gap-4 text-neutral-700">
                  {[Bell, Search, Play, FileText, Bookmark, BarChart2, Clock, User, ChevronRight].map((Icon, i) => (
                    <Icon
                      key={i}
                      size={24}
                      aria-hidden="true"
                      strokeWidth={fill ? 0 : 1.5}
                      fill={fill ? "currentColor" : "none"}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-4">
              <p className="text-small font-semibold text-neutral-700 mb-2">Icon Specs</p>
              {["24×24px grid", "2px stroke width (outline)", "Rounded line caps", "Consistent optical balance"].map((s) => (
                <p key={s} className="text-[11px] text-neutral-500">· {s}</p>
              ))}
            </div>
          </div>

          {/* 07 Buttons */}
          <div>
            <SectionLabel num="07" title="Buttons" />
            <div className="overflow-x-auto">
              <table className="text-left border-collapse w-full">
                <thead>
                  <tr>
                    <th className="pb-3 pr-6 text-[11px] font-semibold text-neutral-500 w-20">State</th>
                    {["Primary", "Secondary", "Tertiary", "Text"].map((h) => (
                      <th key={h} className="pb-3 pr-6 text-[11px] font-semibold text-neutral-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {/* Default */}
                  <tr>
                    <td className="py-2.5 pr-6 text-small text-neutral-500">Default</td>
                    <td className="py-2.5 pr-6"><Button variant="primary">Get Started</Button></td>
                    <td className="py-2.5 pr-6"><Button variant="secondary">Explore Courses</Button></td>
                    <td className="py-2.5 pr-6">
                      <Button variant="tertiary" className="gap-1.5">
                        View Lesson <ChevronRight size={14} aria-hidden />
                      </Button>
                    </td>
                    <td className="py-2.5">
                      <Button variant="text" className="gap-1.5">
                        Watch Video <Play size={14} className="fill-primary-500" strokeWidth={0} aria-hidden />
                      </Button>
                    </td>
                  </tr>
                  {/* Hover (simulated) */}
                  <tr>
                    <td className="py-2.5 pr-6 text-small text-neutral-500">Hover</td>
                    <td className="py-2.5 pr-6"><Button variant="primary" className="bg-primary-600">Get Started</Button></td>
                    <td className="py-2.5 pr-6"><Button variant="secondary" className="bg-primary-100">Explore Courses</Button></td>
                    <td className="py-2.5 pr-6">
                      <Button variant="tertiary" className="bg-neutral-50 gap-1.5">
                        View Lesson <ChevronRight size={14} aria-hidden />
                      </Button>
                    </td>
                    <td className="py-2.5">
                      <Button variant="text" className="underline gap-1.5">
                        Watch Video <Play size={14} className="fill-primary-500" strokeWidth={0} aria-hidden />
                      </Button>
                    </td>
                  </tr>
                  {/* Disabled */}
                  <tr>
                    <td className="py-2.5 pr-6 text-small text-neutral-500">Disabled</td>
                    <td className="py-2.5 pr-6"><Button variant="primary" disabled>Get Started</Button></td>
                    <td className="py-2.5 pr-6"><Button variant="secondary" disabled>Explore Courses</Button></td>
                    <td className="py-2.5 pr-6">
                      <Button variant="tertiary" disabled className="gap-1.5">
                        View Lesson <ChevronRight size={14} aria-hidden />
                      </Button>
                    </td>
                    <td className="py-2.5">
                      <Button variant="text" disabled className="gap-1.5">
                        Watch Video <Play size={14} aria-hidden />
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-5 pt-4 border-t border-neutral-100">
              <p className="text-small font-semibold text-neutral-700 mb-1.5">Button Specs</p>
              {["Height: 44px (default)", "Padding: 0 16px (lg), 0 12px (md)", "Radius: 12px", "Font: Inter Medium (14–16px)"].map((s) => (
                <p key={s} className="text-[11px] text-neutral-500">· {s}</p>
              ))}
            </div>
          </div>

          {/* 08 Inputs */}
          <div>
            <SectionLabel num="08" title="Inputs" />
            <div className="space-y-4">
              <div>
                <p className="text-small text-neutral-500 mb-2">Search / Text Input</p>
                <SearchInput />
              </div>
              <div>
                <p className="text-small text-neutral-500 mb-2">Select</p>
                <Select
                  label="Sort order"
                  options={[{ value: "relevant", label: "Most Relevant" }]}
                  defaultValue="relevant"
                />
              </div>
              <div className="pt-4 border-t border-neutral-100">
                <p className="text-small font-semibold text-neutral-700 mb-1.5">Field Specs</p>
                {["Height: 44px", "Radius: 12px", "Border: 1px solid #E2E8F0", "Padding: 0 16px", "Focus: Border color #FB923C"].map((s) => (
                  <p key={s} className="text-[11px] text-neutral-500">· {s}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ROW 5: 09 Badges | 10 Status | 11 Progress Bar  (3 cols)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          {/* 09 Badges */}
          <div>
            <SectionLabel num="09" title="Badges / Tags" />
            <div className="grid grid-cols-3 gap-4">
              {(["video", "lesson", "popular"] as const).map((v) => (
                <div key={v} className="flex flex-col gap-2">
                  <p className="text-small text-neutral-500 capitalize">{v}</p>
                  <Badge variant={v} />
                </div>
              ))}
            </div>
          </div>

          {/* 10 Status */}
          <div>
            <SectionLabel num="10" title="Status / Indicators" />
            <div className="flex flex-wrap gap-x-6 gap-y-4">
              {(["in-progress", "completed", "now-playing", "locked"] as const).map((v) => (
                <StatusIndicator key={v} variant={v} />
              ))}
            </div>
          </div>

          {/* 11 Progress Bar */}
          <div>
            <SectionLabel num="11" title="Progress Bar" />
            <ProgressBar value={35} label="35% complete" className="max-w-xs" />
          </div>
        </div>

        <Divider />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ROW 6: 12 Cards  (4 cols)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div>
          <SectionLabel num="12" title="Cards" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-3">Course Card</p>
              <CourseCard
                logoChar="N"
                title="Next.js for Production"
                description="Build scalable, high-performance web applications with Next.js."
                level="Intermediate"
                duration="18h 24m"
                modules={12}
              />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-3">Lesson Card (Video)</p>
              <LessonVideoCard
                title="Data Fetching in Server Components"
                description="Learn how to fetch data on the server using async/await and Next.js best practices."
                lessonLabel="Lesson 5.1"
                duration="12:45"
                watchFrom="12:45"
              />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-3">Lesson Card (Lesson)</p>
              <LessonCard
                title="Data Fetching & Caching"
                description="Explore different data fetching methods in Next.js and learn to cache and revalidate data for optimal performance."
                moduleLabel="Module 5"
              />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-3">Resource Card</p>
              <ResourceCard
                title="Caching and Revalidation Guide"
                description="Deep dive into Next.js caching strategies."
                fileType="PDF"
                fileSize="1.2 MB"
              />
            </div>
          </div>
        </div>

        <Divider />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ROW 7: 13 Navigation  (3 cols: Navbar | Breadcrumbs | Pagination)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div>
          <SectionLabel num="13" title="Navigation" />
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_auto] gap-10 items-start">
            {/* Navbar specimen */}
            <div>
              <div className="border border-neutral-200 rounded-[var(--radius-md)] overflow-hidden">
                <Navbar />
              </div>
            </div>

            {/* Breadcrumbs */}
            <div>
              <p className="text-small text-neutral-500 mb-3">Breadcrumbs</p>
              <Breadcrumbs
                items={[
                  { label: "All Courses",            href: "#" },
                  { label: "Next.js for Production", href: "#" },
                  { label: "Data Fetching and Caching" },
                ]}
              />
            </div>

            {/* Pagination */}
            <div>
              <p className="text-small text-neutral-500 mb-3">Pagination</p>
              <Pagination current={1} total={8} />
            </div>
          </div>
        </div>

        <Divider />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ROW 8: 14 Principles  (4 cols)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div>
          <SectionLabel num="14" title="Principles" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { Icon: Eye,           title: "Clarity First",  desc: "Every element should communicate clearly." },
              { Icon: Grid2x2,       title: "Consistency",    desc: "Use components and patterns consistently across the platform." },
              { Icon: Target,        title: "Focus & Calm",   desc: "Remove noise and help learners focus on what matters." },
              { Icon: CircleUserRound, title: "Accessible",   desc: "Design with accessibility and inclusivity in mind." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-3">
                <Icon className="w-7 h-7 text-neutral-700" aria-hidden="true" />
                <p className="text-body font-semibold text-neutral-900">{title}</p>
                <p className="text-small text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 mt-10">
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex items-center justify-between">
          <Logo size={18} />
          <p className="text-small text-neutral-400">v1.0 · May 2025</p>
        </div>
      </footer>
    </div>
  );
}
