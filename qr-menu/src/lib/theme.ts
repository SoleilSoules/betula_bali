export type ThemeId = "paper" | "warm" | "coastal" | "hideout" | "dark";

type Tokens = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  cardBg: string;
  shadow: string;
  // optional decorative tokens — components fall back gracefully if unset
  accent?: string;
  rule?: string;
};

export const THEMES: Record<ThemeId, Tokens> = {
  // serious-but-warm cream paper. Replaces the old sterile "modern".
  paper: {
    bg: "#f6f1e8",
    surface: "#fdfaf2",
    text: "#1d1812",
    muted: "#5b5346",
    border: "#e2d8c2",
    cardBg: "#fdfaf2",
    shadow: "0 1px 2px 0 rgb(96 70 22 / 0.06)",
    accent: "#9c6a2a",
    rule: "#c9b58e",
  },
  warm: {
    bg: "#fbf3e1",
    surface: "#fffaf0",
    text: "#2a1d0f",
    muted: "#6b4f2c",
    border: "#e6d2a8",
    cardBg: "#ffffff",
    shadow: "0 1px 3px 0 rgb(122 80 0 / 0.08)",
    accent: "#b87333",
    rule: "#d9bc7d",
  },
  // bali vibe — sand + ocean. Lives in the same family as paper/warm so the
  // theme can be swapped without re-styling photos and CTAs.
  coastal: {
    bg: "#f4ede1",
    surface: "#fbf6ec",
    text: "#1a2b2d",
    muted: "#4d6164",
    border: "#d4c5a7",
    cardBg: "#fbf6ec",
    shadow: "0 1px 3px 0 rgb(30 60 60 / 0.08)",
    accent: "#1f6f73",
    rule: "#c9b687",
  },
  // hideout — Bali Betula vibe: cream paper + бордовый (берёза в круге)
  // + гжельский синий (этнический узор с тарелок). Не tropical-resort,
  // а «дача с печкой под пальмой».
  hideout: {
    bg: "#f1ece2",
    surface: "#f7f2e8",
    text: "#1a1a1a",
    muted: "#6b5b4d",
    border: "#d9cfc0",
    cardBg: "#fbf6ec",
    shadow: "0 1px 3px 0 rgb(74 32 30 / 0.08)",
    accent: "#7d3a4c",
    rule: "#1e4a6b",
  },
  dark: {
    bg: "#0c0c0c",
    surface: "#1a1a1a",
    text: "#fafafa",
    muted: "#b5b5b5",
    border: "#2e2e2e",
    cardBg: "#1a1a1a",
    shadow: "0 1px 2px 0 rgb(0 0 0 / 0.6)",
    accent: "#e8b86d",
    rule: "#3a3a3a",
  },
};

// allow legacy "modern" records (pre-rename) to render as paper instead of
// throwing. New records validate against the enum in validators.ts.
const LEGACY_ALIASES: Record<string, ThemeId> = { modern: "paper" };

export function themeStyle(themeId: string, primary: string): React.CSSProperties {
  const resolved =
    (themeId as ThemeId) in THEMES
      ? (themeId as ThemeId)
      : LEGACY_ALIASES[themeId] ?? "paper";
  const t = THEMES[resolved];
  return {
    ["--qr-bg" as string]: t.bg,
    ["--qr-surface" as string]: t.surface,
    ["--qr-text" as string]: t.text,
    ["--qr-muted" as string]: t.muted,
    ["--qr-border" as string]: t.border,
    ["--qr-card-bg" as string]: t.cardBg,
    ["--qr-shadow" as string]: t.shadow,
    ["--qr-accent" as string]: t.accent ?? primary,
    ["--qr-rule" as string]: t.rule ?? t.border,
    ["--qr-primary" as string]: primary,
  } as React.CSSProperties;
}
