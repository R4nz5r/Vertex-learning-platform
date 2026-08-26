/**
 * Vertex Design System — Showcase Page
 * Renders every token and component from the spec (design/vertex-designsystem.png)
 */

/* ─────────────────────────────────────────────────────────── */
/* Inline SVG helpers                                          */
/* ─────────────────────────────────────────────────────────── */

function VertexLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="Vertex">
      <polygon points="12,2 22,20 2,20" fill="#F97316" />
    </svg>
  );
}

function CheckCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="#22C55E" strokeWidth="1.5" />
      <path d="M6 10l3 3 5-5" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinnerCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="#CBD5E1" strokeWidth="2" />
      <path d="M10 2a8 8 0 0 1 8 8" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlayCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill="#F97316" />
      <polygon points="8,7 14,10 8,13" fill="white" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="9" width="12" height="9" rx="2" stroke="#94A3B8" strokeWidth="1.5" />
      <path d="M7 9V7a3 3 0 0 1 6 0v2" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="#64748B" strokeWidth="1.5" />
      <path d="M11 11l3 3" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 6l4 4 4-4" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4l4 4-4 4" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 2H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9" stroke="#64748B" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M8 1h5v5" stroke="#F97316" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 1L7 7" stroke="#F97316" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 3h8l4 4v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="#64748B" strokeWidth="1.5" />
      <path d="M12 3v4h4" stroke="#64748B" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="#64748B" strokeWidth="1.2" />
      <path d="M7 4v3l2 1.5" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="#64748B" strokeWidth="1.2" />
      <path d="M5 5h4M5 8h3" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Section wrapper                                             */
/* ─────────────────────────────────────────────────────────── */

function Section({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-8 pb-3 border-b border-neutral-200">
        <span className="text-[11px] font-semibold tracking-widest text-neutral-500 font-sans">{num}</span>
        <h2 className="text-[13px] font-semibold tracking-widest text-neutral-700 uppercase font-sans">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Swatch                                                      */
/* ─────────────────────────────────────────────────────────── */

function Swatch({ label, hex }: { label: string; hex: string }) {
  return (
    <div className="flex flex-col gap-2 min-w-[80px]">
      <div
        className="w-full h-16 rounded-[var(--radius-md)] border border-neutral-200"
        style={{ backgroundColor: hex }}
      />
      <p className="text-[11px] font-medium text-neutral-700 font-sans">{label}</p>
      <p className="text-[11px] text-neutral-500 font-sans">{hex}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Badge                                                       */
/* ─────────────────────────────────────────────────────────── */

function Badge({ variant }: { variant: "video" | "lesson" | "popular" }) {
  const styles = {
    video:   { bg: "#F97316", label: "VIDEO" },
    lesson:  { bg: "#3B82F6", label: "LESSON" },
    popular: { bg: "#8B5CF6", label: "POPULAR" },
  } as const;
  const { bg, label } = styles[variant];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-white rounded-[var(--radius-xs)] tracking-wider font-sans"
      style={{ backgroundColor: bg }}
    >
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Page                                                        */
/* ─────────────────────────────────────────────────────────── */

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Navigation ───────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-[var(--shadow-sm)]">
        <nav className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VertexLogo size={22} />
            <span className="text-[16px] font-semibold text-neutral-900 font-sans tracking-tight">Vertex</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[14px] font-medium text-primary-500 font-sans">Courses</a>
            <a href="#" className="text-[14px] font-medium text-neutral-700 hover:text-neutral-900 font-sans">My Learning</a>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* ── Title block ───────────────────────────────── */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-4">
            <VertexLogo size={36} />
            <span className="text-[22px] font-semibold text-neutral-900 font-sans tracking-tight">Vertex</span>
          </div>
          <h1 className="font-display text-[48px] font-bold leading-[56px] text-neutral-900 mb-4">
            Design System
          </h1>
          <p className="text-[16px] text-neutral-500 leading-[24px] max-w-sm font-sans">
            A unified design language for Vertex learning platform. Clean, modern and focused on clarity, consistency and intuitive learning experiences.
          </p>
          <p className="mt-4 text-[12px] text-neutral-400 font-sans tracking-wide uppercase">
            Version 1.0 · May 2025
          </p>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 01 COLORS                                     */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Section num="01" title="Colors">
          <div className="space-y-8">
            <div>
              <p className="text-[12px] font-semibold text-neutral-700 mb-4 font-sans">Primary</p>
              <div className="flex flex-wrap gap-4">
                <Swatch label="Primary 500" hex="#F97316" />
                <Swatch label="Primary 400" hex="#FB923C" />
                <Swatch label="Primary 300" hex="#FDBA74" />
                <Swatch label="Primary 200" hex="#FED7AA" />
                <Swatch label="Primary 100" hex="#FFEED5" />
              </div>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-neutral-700 mb-4 font-sans">Neutral</p>
              <div className="flex flex-wrap gap-4">
                <Swatch label="Neutral 900" hex="#0F172A" />
                <Swatch label="Neutral 700" hex="#334155" />
                <Swatch label="Neutral 500" hex="#64748B" />
                <Swatch label="Neutral 300" hex="#CBD5E1" />
                <Swatch label="Neutral 200" hex="#E2E8F0" />
                <Swatch label="Neutral 100" hex="#F1F5F9" />
                <Swatch label="Neutral 50"  hex="#F8FAFC" />
                <Swatch label="White"       hex="#FFFFFF" />
              </div>
            </div>
          </div>
        </Section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 02 TYPOGRAPHY + 03 TYPE SCALE                 */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Section num="02 · 03" title="Typography & Type Scale">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Font families */}
            <div className="space-y-8">
              <div>
                <p
                  className="font-display text-[64px] leading-none font-bold text-neutral-900 mb-1"
                  aria-label="Playfair Display specimen"
                >
                  Ag
                </p>
                <p className="text-[18px] font-semibold text-neutral-900 font-sans mb-1">Playfair Display</p>
                <p className="text-[14px] text-neutral-500 font-sans">Elegant · Readable · Timeless</p>
              </div>
              <div>
                <p
                  className="font-sans text-[64px] leading-none font-bold text-neutral-900 mb-1"
                  aria-label="Inter specimen"
                >
                  Ag
                </p>
                <p className="text-[18px] font-semibold text-neutral-900 font-sans mb-1">Inter</p>
                <p className="text-[14px] text-neutral-500 font-sans">Clean · Modern · Highly legible</p>
              </div>
            </div>

            {/* Type scale table */}
            <div>
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-6 gap-y-4 text-[12px] text-neutral-500 font-sans mb-4">
                <span className="font-semibold text-neutral-700">Style</span>
                <span className="font-semibold text-neutral-700">Size / LH</span>
                <span className="font-semibold text-neutral-700">Weight</span>
                <span className="font-semibold text-neutral-700">Use</span>
              </div>
              {[
                { style: "Display 1",  el: "p", className: "font-display text-[48px] leading-[56px] font-bold text-neutral-900",  size: "48/56px", weight: "Bold",     use: "Page titles" },
                { style: "Display 2",  el: "p", className: "font-display text-[36px] leading-[44px] font-bold text-neutral-900",  size: "36/44px", weight: "Bold",     use: "Section titles" },
                { style: "Heading 1",  el: "p", className: "font-sans text-[28px] leading-[36px] font-semibold text-neutral-900", size: "28/36px", weight: "SemiBold", use: "Card titles" },
                { style: "Heading 2",  el: "p", className: "font-sans text-[22px] leading-[30px] font-semibold text-neutral-900", size: "22/30px", weight: "SemiBold", use: "Sub section" },
                { style: "Heading 3",  el: "p", className: "font-sans text-[18px] leading-[26px] font-medium text-neutral-900",   size: "18/26px", weight: "Medium",   use: "Small titles" },
                { style: "Body Large", el: "p", className: "font-sans text-[16px] leading-[24px] text-neutral-700",               size: "16/24px", weight: "Regular",  use: "Body copy" },
                { style: "Body",       el: "p", className: "font-sans text-[14px] leading-[20px] text-neutral-700",               size: "14/20px", weight: "Regular",  use: "Supporting text" },
                { style: "Small",      el: "p", className: "font-sans text-[12px] leading-[16px] text-neutral-500",               size: "12/16px", weight: "Regular",  use: "Captions, meta" },
              ].map(({ style, className, size, weight, use }) => (
                <div key={style} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-6 gap-y-1 items-baseline border-b border-neutral-100 py-2">
                  <p className={className}>{style}</p>
                  <span className="text-[11px] text-neutral-500 font-sans whitespace-nowrap">{size}</span>
                  <span className="text-[11px] text-neutral-500 font-sans whitespace-nowrap">{weight}</span>
                  <span className="text-[11px] text-neutral-400 font-sans whitespace-nowrap">{use}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 04 SPACING                                    */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Section num="04" title="Spacing System">
          <p className="text-[12px] text-neutral-500 font-sans mb-6">Base unit: 4px</p>
          <div className="flex flex-wrap items-end gap-6">
            {[
              { px: 4,  rem: "0.25rem", tw: "1" },
              { px: 8,  rem: "0.5rem",  tw: "2" },
              { px: 12, rem: "0.75rem", tw: "3" },
              { px: 16, rem: "1rem",    tw: "4" },
              { px: 24, rem: "1.5rem",  tw: "6" },
              { px: 32, rem: "2rem",    tw: "8" },
              { px: 40, rem: "2.5rem",  tw: "10" },
              { px: 48, rem: "3rem",    tw: "12" },
              { px: 64, rem: "4rem",    tw: "16" },
            ].map(({ px, rem }) => (
              <div key={px} className="flex flex-col items-center gap-2">
                <div
                  className="bg-primary-200 rounded-[var(--radius-xs)]"
                  style={{ width: px, height: px }}
                />
                <span className="text-[11px] font-semibold text-neutral-700 font-sans">{px}</span>
                <span className="text-[10px] text-neutral-400 font-sans">({rem})</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 05 RADIUS & SHADOWS                           */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Section num="05" title="Radius & Shadows">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Radius */}
            <div>
              <p className="text-[12px] font-semibold text-neutral-700 mb-6 font-sans">Radius</p>
              <div className="flex flex-wrap gap-6">
                {[
                  { label: "4px (xs)",    r: "4px",    w: 56 },
                  { label: "8px (sm)",    r: "8px",    w: 64 },
                  { label: "12px (md)",   r: "12px",   w: 72 },
                  { label: "16px (lg)",   r: "16px",   w: 80 },
                  { label: "24px (xl)",   r: "24px",   w: 88 },
                  { label: "Full",        r: "9999px", w: 56 },
                ].map(({ label, r, w }) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <div
                      className="bg-neutral-100 border border-neutral-200"
                      style={{ width: w, height: 48, borderRadius: r }}
                    />
                    <span className="text-[11px] text-neutral-500 font-sans text-center">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shadows */}
            <div>
              <p className="text-[12px] font-semibold text-neutral-700 mb-6 font-sans">Shadows</p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Sm", shadow: "0 1px 2px 0 rgba(15,23,42,0.05)", desc: "0 1px 2px 0\nrgba(15, 23, 42, 0.05)" },
                  { label: "Md", shadow: "0 4px 12px -2px rgba(15,23,42,0.08)", desc: "0 4px 12px -2px\nrgba(15, 23, 42, 0.08)" },
                  { label: "Lg", shadow: "0 12px 24px -4px rgba(15,23,42,0.10)", desc: "0 12px 24px -4px\nrgba(15, 23, 42, 0.10)" },
                  { label: "Xl", shadow: "0 20px 40px -8px rgba(15,23,42,0.12)", desc: "0 20px 40px -8px\nrgba(15, 23, 42, 0.12)" },
                ].map(({ label, shadow, desc }) => (
                  <div key={label} className="flex flex-col gap-3">
                    <div
                      className="w-full h-14 bg-white rounded-[var(--radius-md)] border border-neutral-100 flex items-center justify-center"
                      style={{ boxShadow: shadow }}
                    >
                      <span className="text-[13px] font-semibold text-neutral-700 font-sans">{label}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 font-sans whitespace-pre">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 06 ICONS                                      */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Section num="06" title="Icons">
          <div className="space-y-6">
            {[
              { label: "Outline Style" },
              { label: "Filled Style" },
            ].map(({ label }, rowIdx) => (
              <div key={label}>
                <p className="text-[12px] text-neutral-500 font-sans mb-3">{label}</p>
                <div className="flex items-center gap-6 flex-wrap">
                  {/* Bell */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={rowIdx === 1 ? "#0F172A" : "none"} stroke={rowIdx === 0 ? "#334155" : "none"} strokeWidth="1.5"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-9.9-4.55A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {/* Search */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={rowIdx === 1 ? "#0F172A" : "none"} stroke={rowIdx === 0 ? "#334155" : "none"} strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>
                  {/* Play */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={rowIdx === 1 ? "#0F172A" : "none"} stroke={rowIdx === 0 ? "#334155" : "none"} strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16" fill={rowIdx === 0 ? "#334155" : "white"}/></svg>
                  {/* Document */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={rowIdx === 1 ? "#0F172A" : "none"} stroke={rowIdx === 0 ? "#334155" : "none"} strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" strokeLinecap="round"/></svg>
                  {/* Bookmark */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={rowIdx === 1 ? "#0F172A" : "none"} stroke={rowIdx === 0 ? "#334155" : "none"} strokeWidth="1.5"><path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {/* Bar chart */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={rowIdx === 1 ? "#0F172A" : "none"} stroke={rowIdx === 0 ? "#334155" : "none"} strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round"/></svg>
                  {/* Clock */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={rowIdx === 1 ? "#0F172A" : "none"} stroke={rowIdx === 0 ? "#334155" : "none"} strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/></svg>
                  {/* User */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={rowIdx === 1 ? "#0F172A" : "none"} stroke={rowIdx === 0 ? "#334155" : "none"} strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/></svg>
                  {/* Chevron right */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            ))}
            <div className="pt-2 space-y-1">
              <p className="text-[12px] font-semibold text-neutral-700 font-sans">Icon Specs</p>
              {["24×24px grid", "2px stroke width (outline)", "Rounded line caps", "Consistent optical balance"].map((spec) => (
                <p key={spec} className="text-[12px] text-neutral-500 font-sans">· {spec}</p>
              ))}
            </div>
          </div>
        </Section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 07 BUTTONS                                    */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Section num="07" title="Buttons">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="text-[11px] font-semibold text-neutral-500 pb-3 font-sans w-24">State</th>
                  <th className="text-[11px] font-semibold text-neutral-500 pb-3 font-sans">Primary</th>
                  <th className="text-[11px] font-semibold text-neutral-500 pb-3 font-sans">Secondary</th>
                  <th className="text-[11px] font-semibold text-neutral-500 pb-3 font-sans">Tertiary</th>
                  <th className="text-[11px] font-semibold text-neutral-500 pb-3 font-sans">Text</th>
                </tr>
              </thead>
              <tbody className="space-y-3">
                {/* Default */}
                <tr className="align-middle">
                  <td className="py-3 text-[12px] text-neutral-500 font-sans">Default</td>
                  <td className="py-3 pr-6">
                    <button
                      className="h-11 px-4 rounded-[var(--radius-md)] bg-primary-500 text-white text-[14px] font-medium font-sans cursor-default"
                      style={{ boxShadow: "0 1px 2px 0 rgba(15,23,42,0.05)" }}
                    >
                      Get Started
                    </button>
                  </td>
                  <td className="py-3 pr-6">
                    <button
                      className="h-11 px-4 rounded-[var(--radius-md)] border border-primary-500 text-primary-500 text-[14px] font-medium font-sans bg-transparent cursor-default"
                    >
                      Explore Courses
                    </button>
                  </td>
                  <td className="py-3 pr-6">
                    <button className="h-11 px-4 rounded-[var(--radius-md)] text-neutral-700 text-[14px] font-medium font-sans bg-transparent cursor-default">
                      <span className="flex items-center gap-1.5">View Lesson <ExternalLink /></span>
                    </button>
                  </td>
                  <td className="py-3">
                    <button className="h-11 px-4 text-primary-500 text-[14px] font-medium font-sans bg-transparent cursor-default">
                      <span className="flex items-center gap-1.5">Watch Video <PlayCircle /></span>
                    </button>
                  </td>
                </tr>
                {/* Hover */}
                <tr className="align-middle">
                  <td className="py-3 text-[12px] text-neutral-500 font-sans">Hover</td>
                  <td className="py-3 pr-6">
                    <button className="h-11 px-4 rounded-[var(--radius-md)] bg-primary-400 text-white text-[14px] font-medium font-sans cursor-default">
                      Get Started
                    </button>
                  </td>
                  <td className="py-3 pr-6">
                    <button className="h-11 px-4 rounded-[var(--radius-md)] border border-primary-500 text-primary-500 text-[14px] font-medium font-sans cursor-default" style={{ backgroundColor: "#FFF7ED" }}>
                      Explore Courses
                    </button>
                  </td>
                  <td className="py-3 pr-6">
                    <button className="h-11 px-4 rounded-[var(--radius-md)] text-neutral-700 text-[14px] font-medium font-sans bg-neutral-100 cursor-default">
                      <span className="flex items-center gap-1.5">View Lesson <ExternalLink /></span>
                    </button>
                  </td>
                  <td className="py-3">
                    <button className="h-11 px-4 text-primary-500 text-[14px] font-medium font-sans bg-transparent underline cursor-default">
                      <span className="flex items-center gap-1.5">Watch Video <PlayCircle /></span>
                    </button>
                  </td>
                </tr>
                {/* Disabled */}
                <tr className="align-middle opacity-40">
                  <td className="py-3 text-[12px] text-neutral-500 font-sans">Disabled</td>
                  <td className="py-3 pr-6">
                    <button disabled className="h-11 px-4 rounded-[var(--radius-md)] bg-primary-500 text-white text-[14px] font-medium font-sans cursor-not-allowed">
                      Get Started
                    </button>
                  </td>
                  <td className="py-3 pr-6">
                    <button disabled className="h-11 px-4 rounded-[var(--radius-md)] border border-primary-500 text-primary-500 text-[14px] font-medium font-sans bg-transparent cursor-not-allowed">
                      Explore Courses
                    </button>
                  </td>
                  <td className="py-3 pr-6">
                    <button disabled className="h-11 px-4 rounded-[var(--radius-md)] text-neutral-700 text-[14px] font-medium font-sans bg-transparent cursor-not-allowed">
                      <span className="flex items-center gap-1.5">View Lesson <ExternalLink /></span>
                    </button>
                  </td>
                  <td className="py-3">
                    <button disabled className="h-11 px-4 text-primary-500 text-[14px] font-medium font-sans bg-transparent cursor-not-allowed">
                      <span className="flex items-center gap-1.5">Watch Video <PlayCircle /></span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-100">
            <p className="text-[12px] font-semibold text-neutral-700 font-sans mb-2">Button Specs</p>
            {["Height: 44px (default)", "Padding: 0 16px (lg), 0 12px (md)", "Radius: 12px", "Font: Inter Medium (14–16px)"].map((s) => (
              <p key={s} className="text-[12px] text-neutral-500 font-sans">· {s}</p>
            ))}
          </div>
        </Section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 08 INPUTS                                     */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Section num="08" title="Inputs">
          <div className="grid sm:grid-cols-2 gap-8 max-w-xl">
            {/* Search */}
            <div>
              <p className="text-[12px] text-neutral-500 font-sans mb-3">Search / Text Input</p>
              <div
                className="flex items-center gap-3 h-11 px-4 bg-white border border-neutral-200 rounded-[var(--radius-md)]"
                style={{ boxShadow: "0 1px 2px 0 rgba(15,23,42,0.05)" }}
              >
                <SearchIcon />
                <span className="text-[14px] text-neutral-400 font-sans flex-1">Search anything...</span>
                <kbd className="text-[10px] text-neutral-400 border border-neutral-200 rounded px-1 font-sans">⌘ K</kbd>
              </div>
            </div>

            {/* Select */}
            <div>
              <p className="text-[12px] text-neutral-500 font-sans mb-3">Select</p>
              <div
                className="flex items-center justify-between h-11 px-4 bg-white border border-neutral-200 rounded-[var(--radius-md)] cursor-pointer"
              >
                <span className="text-[14px] text-neutral-700 font-sans">Most Relevant</span>
                <ChevronDown />
              </div>
            </div>

            {/* Focus state */}
            <div>
              <p className="text-[12px] text-neutral-500 font-sans mb-3">Focus State</p>
              <div
                className="flex items-center gap-3 h-11 px-4 bg-white rounded-[var(--radius-md)]"
                style={{ border: "1px solid #FB923C", boxShadow: "0 0 0 3px rgba(251,146,60,0.15)" }}
              >
                <span className="text-[14px] text-neutral-700 font-sans">Typing...</span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-100">
            <p className="text-[12px] font-semibold text-neutral-700 font-sans mb-2">Field Specs</p>
            {["Height: 44px", "Radius: 12px", "Border: 1px solid #E2E8F0", "Padding: 0 16px", "Focus: Border color #FB923C"].map((s) => (
              <p key={s} className="text-[12px] text-neutral-500 font-sans">· {s}</p>
            ))}
          </div>
        </Section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 09 BADGES / TAGS                              */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Section num="09" title="Badges / Tags">
          <div className="flex flex-wrap gap-8">
            {(["video", "lesson", "popular"] as const).map((v) => (
              <div key={v} className="flex flex-col items-start gap-2">
                <p className="text-[12px] text-neutral-500 font-sans capitalize">{v}</p>
                <Badge variant={v} />
              </div>
            ))}
          </div>
        </Section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 10 STATUS / INDICATORS                        */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Section num="10" title="Status / Indicators">
          <div className="flex flex-wrap gap-8">
            {[
              { icon: <SpinnerCircle />, label: "In Progress" },
              { icon: <CheckCircle />,  label: "Completed" },
              { icon: <PlayCircle />,   label: "Now Playing" },
              { icon: <LockIcon />,     label: "Locked" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                {icon}
                <span className="text-[13px] text-neutral-700 font-sans">{label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 11 PROGRESS BAR                               */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Section num="11" title="Progress Bar">
          <div className="max-w-md space-y-3">
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: "#E2E8F0" }}
              role="progressbar"
              aria-valuenow={35}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full rounded-full" style={{ width: "35%", backgroundColor: "#F97316" }} />
            </div>
            <p className="text-[12px] text-neutral-500 font-sans">35% complete</p>
          </div>
        </Section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 12 CARDS                                      */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Section num="12" title="Cards">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Course Card */}
            <div>
              <p className="text-[11px] font-semibold text-neutral-500 mb-3 font-sans uppercase tracking-wide">Course Card</p>
              <div
                className="bg-white border border-neutral-200 rounded-[var(--radius-lg)] p-5 flex flex-col gap-4"
                style={{ boxShadow: "0 4px 12px -2px rgba(15,23,42,0.08)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[var(--radius-md)] bg-neutral-900 flex items-center justify-center text-white font-bold text-[16px] font-sans flex-shrink-0">
                    N
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-neutral-900 font-sans leading-tight">Next.js for Production</p>
                  </div>
                </div>
                <p className="text-[12px] text-neutral-500 font-sans leading-[18px]">
                  Build scalable, high-performance web applications with Next.js.
                </p>
                <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-sans border-t border-neutral-100 pt-3">
                  <span className="flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#64748B" strokeWidth="1.2"/><path d="M6 3v3l2 1" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round"/></svg>Intermediate</span>
                  <span className="flex items-center gap-1"><ClockIcon />18h 24m</span>
                  <span className="flex items-center gap-1"><BookIcon />12 modules</span>
                </div>
              </div>
            </div>

            {/* Lesson Card (Video) */}
            <div>
              <p className="text-[11px] font-semibold text-neutral-500 mb-3 font-sans uppercase tracking-wide">Lesson Card (Video)</p>
              <div
                className="bg-white border border-neutral-200 rounded-[var(--radius-lg)] p-5 flex flex-col gap-3"
                style={{ boxShadow: "0 4px 12px -2px rgba(15,23,42,0.08)" }}
              >
                <Badge variant="video" />
                <p className="text-[14px] font-semibold text-neutral-900 font-sans leading-tight">
                  Data Fetching in Server Components
                </p>
                <p className="text-[12px] text-neutral-500 font-sans leading-[18px]">
                  Learn how to fetch data on the server using async/await and Next.js best practices.
                </p>
                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-sans border-t border-neutral-100 pt-3">
                  <span>Lesson 5.1 · 12:45</span>
                  <button className="flex items-center gap-1 text-primary-500 font-medium">
                    <PlayCircle />Watch from 12:45
                  </button>
                </div>
              </div>
            </div>

            {/* Lesson Card (Lesson) */}
            <div>
              <p className="text-[11px] font-semibold text-neutral-500 mb-3 font-sans uppercase tracking-wide">Lesson Card (Lesson)</p>
              <div
                className="bg-white border border-neutral-200 rounded-[var(--radius-lg)] p-5 flex flex-col gap-3"
                style={{ boxShadow: "0 4px 12px -2px rgba(15,23,42,0.08)" }}
              >
                <Badge variant="lesson" />
                <p className="text-[14px] font-semibold text-neutral-900 font-sans leading-tight">
                  Data Fetching &amp; Caching
                </p>
                <p className="text-[12px] text-neutral-500 font-sans leading-[18px]">
                  Explore different data fetching methods in Next.js and learn to cache and revalidate data for optimal performance.
                </p>
                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-sans border-t border-neutral-100 pt-3">
                  <span>Module 5</span>
                  <button className="flex items-center gap-1 text-primary-500 font-medium">
                    View lesson <ExternalLink />
                  </button>
                </div>
              </div>
            </div>

            {/* Resource Card */}
            <div>
              <p className="text-[11px] font-semibold text-neutral-500 mb-3 font-sans uppercase tracking-wide">Resource Card</p>
              <div
                className="bg-white border border-neutral-200 rounded-[var(--radius-lg)] p-5 flex flex-col gap-3"
                style={{ boxShadow: "0 4px 12px -2px rgba(15,23,42,0.08)" }}
              >
                <div className="flex items-start justify-between">
                  <FileIcon />
                  <ExternalLink />
                </div>
                <p className="text-[14px] font-semibold text-neutral-900 font-sans leading-tight">
                  Caching and Revalidation Guide
                </p>
                <p className="text-[12px] text-neutral-500 font-sans leading-[18px]">
                  Deep dive into Next.js caching strategies.
                </p>
                <div className="text-[11px] text-neutral-400 font-sans border-t border-neutral-100 pt-3">
                  PDF · 1.2 MB
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 13 NAVIGATION                                 */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Section num="13" title="Navigation">
          <div className="space-y-8">
            {/* Top nav specimen */}
            <div>
              <p className="text-[11px] font-semibold text-neutral-500 mb-3 font-sans uppercase tracking-wide">Top Navigation</p>
              <div className="bg-white border border-neutral-200 rounded-[var(--radius-md)] px-6 h-14 flex items-center justify-between" style={{ boxShadow: "0 1px 2px 0 rgba(15,23,42,0.05)" }}>
                <div className="flex items-center gap-2">
                  <VertexLogo size={20} />
                  <span className="text-[15px] font-semibold text-neutral-900 font-sans">Vertex</span>
                </div>
                <div className="flex items-center gap-6">
                  <a href="#" className="text-[14px] font-medium text-primary-500 font-sans">Courses</a>
                  <a href="#" className="text-[14px] font-medium text-neutral-700 font-sans">My Learning</a>
                </div>
              </div>
            </div>

            {/* Breadcrumbs */}
            <div>
              <p className="text-[11px] font-semibold text-neutral-500 mb-3 font-sans uppercase tracking-wide">Breadcrumbs</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {["All Courses", "Next.js for Production", "Data Fetching and Caching"].map((crumb, i, arr) => (
                  <span key={crumb} className="flex items-center gap-1.5">
                    <a
                      href="#"
                      className={`text-[13px] font-sans ${i === arr.length - 1 ? "text-neutral-900 font-medium" : "text-neutral-500 hover:text-neutral-700"}`}
                    >
                      {crumb}
                    </a>
                    {i < arr.length - 1 && <ChevronRight />}
                  </span>
                ))}
              </div>
            </div>

            {/* Pagination */}
            <div>
              <p className="text-[11px] font-semibold text-neutral-500 mb-3 font-sans uppercase tracking-wide">Pagination</p>
              <div className="flex items-center gap-1">
                {/* Prev */}
                <button className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] border border-neutral-200 text-neutral-500">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7l4 4" stroke="#64748B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {[1, 2, 3, "...", 8].map((p, i) => (
                  <button
                    key={i}
                    className={`w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[13px] font-sans border ${
                      p === 1
                        ? "bg-primary-500 text-white border-primary-500 font-medium"
                        : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                {/* Next */}
                <button className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] border border-neutral-200 text-neutral-500">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#64748B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 14 PRINCIPLES                                 */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Section num="14" title="Principles">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="5" stroke="#334155" strokeWidth="1.5"/><path d="M14 4v2M14 22v2M4 14H2M26 14h-2M7.05 7.05l-1.41-1.41M22.36 22.36l-1.41-1.41M7.05 20.95l-1.41 1.41M22.36 5.64l-1.41 1.41" stroke="#334155" strokeWidth="1.5" strokeLinecap="round"/></svg>,
                title: "Clarity First",
                desc: "Every element should communicate clearly.",
              },
              {
                icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="3" y="3" width="9" height="9" rx="2" stroke="#334155" strokeWidth="1.5"/><rect x="16" y="3" width="9" height="9" rx="2" stroke="#334155" strokeWidth="1.5"/><rect x="3" y="16" width="9" height="9" rx="2" stroke="#334155" strokeWidth="1.5"/><rect x="16" y="16" width="9" height="9" rx="2" stroke="#334155" strokeWidth="1.5"/></svg>,
                title: "Consistency",
                desc: "Use components and patterns consistently across the platform.",
              },
              {
                icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="10" stroke="#334155" strokeWidth="1.5"/><path d="M10 14l3 3 5-5" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title: "Focus & Calm",
                desc: "Remove noise and help learners focus on what matters.",
              },
              {
                icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4C9 4 5 8 5 14s4 10 9 10 9-4 9-10" stroke="#334155" strokeWidth="1.5" strokeLinecap="round"/><path d="M19 6l3 3-3 3" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 19l3 2-1 3" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                title: "Accessible",
                desc: "Design with accessibility and inclusivity in mind.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-3">
                <div className="text-neutral-700">{icon}</div>
                <p className="text-[14px] font-semibold text-neutral-900 font-sans">{title}</p>
                <p className="text-[13px] text-neutral-500 font-sans leading-[18px]">{desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VertexLogo size={18} />
            <span className="text-[13px] font-semibold text-neutral-700 font-sans">Vertex Design System</span>
          </div>
          <p className="text-[12px] text-neutral-400 font-sans">v1.0 · May 2025</p>
        </div>
      </footer>
    </div>
  );
}
