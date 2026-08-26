/**
 * Vertex Design System — typed token constants
 * Source of truth: design/vertex-designsystem.png  v1.0 May 2025
 *
 * Import these in components instead of hardcoding hex values.
 * The CSS custom properties in globals.css are the runtime values;
 * these constants are for TypeScript consumers (e.g. canvas, chart, email).
 */

/* ─── Colors ─────────────────────────────────────────────── */

export const colors = {
  primary: {
    100: "#FFEED5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316",
  },
  neutral: {
    50:  "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    500: "#64748B",
    700: "#334155",
    900: "#0F172A",
  },
  white: "#FFFFFF",
  badge: {
    video:   "#F97316",
    lesson:  "#3B82F6",
    popular: "#8B5CF6",
  },
} as const;

/* ─── Typography ─────────────────────────────────────────── */

export const typography = {
  display1:  { fontFamily: "Playfair Display", fontSize: 48, lineHeight: 56, fontWeight: 700 },
  display2:  { fontFamily: "Playfair Display", fontSize: 36, lineHeight: 44, fontWeight: 700 },
  heading1:  { fontFamily: "Inter", fontSize: 28, lineHeight: 36, fontWeight: 600 },
  heading2:  { fontFamily: "Inter", fontSize: 22, lineHeight: 30, fontWeight: 600 },
  heading3:  { fontFamily: "Inter", fontSize: 18, lineHeight: 26, fontWeight: 500 },
  bodyLarge: { fontFamily: "Inter", fontSize: 16, lineHeight: 24, fontWeight: 400 },
  body:      { fontFamily: "Inter", fontSize: 14, lineHeight: 20, fontWeight: 400 },
  small:     { fontFamily: "Inter", fontSize: 12, lineHeight: 16, fontWeight: 400 },
} as const;

/* ─── Spacing (px) ───────────────────────────────────────── */

export const spacing = {
  1:   4,
  2:   8,
  3:   12,
  4:   16,
  6:   24,
  8:   32,
  10:  40,
  12:  48,
  16:  64,
} as const;

/* ─── Border Radius (px) ─────────────────────────────────── */

export const radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;

/* ─── Shadows ─────────────────────────────────────────────── */

export const shadows = {
  sm: "0 1px 2px 0 rgba(15, 23, 42, 0.05)",
  md: "0 4px 12px -2px rgba(15, 23, 42, 0.08)",
  lg: "0 12px 24px -4px rgba(15, 23, 42, 0.10)",
  xl: "0 20px 40px -8px rgba(15, 23, 42, 0.12)",
} as const;

/* ─── Buttons ─────────────────────────────────────────────── */

export const button = {
  height:        44,
  paddingX:      16,
  paddingXSm:    12,
  borderRadius:  12,
  fontSize:      14,
  fontWeight:    500,
} as const;

/* ─── Inputs ──────────────────────────────────────────────── */

export const input = {
  height:       44,
  borderRadius: 12,
  borderColor:  colors.neutral[200],
  focusColor:   colors.primary[400],
  paddingX:     16,
} as const;
