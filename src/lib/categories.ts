import {
  Dumbbell,
  Flame,
  Zap,
  Mountain,
  Shield,
  Target,
  Waves,
  HeartPulse,
  Crown,
  Anchor,
  Rocket,
  Atom,
  type LucideIcon,
} from "lucide-react";

/** Selectable icon set for muscle-group categories. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  flame: Flame,
  zap: Zap,
  mountain: Mountain,
  shield: Shield,
  target: Target,
  waves: Waves,
  heart: HeartPulse,
  crown: Crown,
  anchor: Anchor,
  rocket: Rocket,
  atom: Atom,
};

export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS);

export function categoryIcon(key: string): LucideIcon {
  return CATEGORY_ICONS[key] ?? Dumbbell;
}

/** Accent palettes (hex pairs used for category color coding). */
export const CATEGORY_COLORS: Record<
  string,
  { label: string; hex: string; soft: string }
> = {
  coral: { label: "Coral", hex: "#F95C4B", soft: "rgba(249,92,75,0.12)" },
  amber: { label: "Amber", hex: "#f59e0b", soft: "rgba(245,158,11,0.12)" },
  rose: { label: "Rose", hex: "#fb7185", soft: "rgba(251,113,133,0.12)" },
  blue: { label: "Blue", hex: "#60a5fa", soft: "rgba(96,165,250,0.12)" },
  violet: { label: "Violet", hex: "#a78bfa", soft: "rgba(167,139,250,0.12)" },
  teal: { label: "Teal", hex: "#2dd4bf", soft: "rgba(45,212,191,0.12)" },
  orange: { label: "Orange", hex: "#fb923c", soft: "rgba(251,146,60,0.12)" },
  slate: { label: "Slate", hex: "#64748b", soft: "rgba(100,116,139,0.12)" },
};

export const CATEGORY_COLOR_KEYS = Object.keys(CATEGORY_COLORS);

export function categoryColor(key: string) {
  return CATEGORY_COLORS[key] ?? CATEGORY_COLORS.coral;
}

/** Default starter categories for brand-new vaults. */
export const DEFAULT_CATEGORIES: {
  name: string;
  nameEn: string;
  icon: string;
  color: string;
}[] = [
  { name: "Chest", nameEn: "Chest", icon: "shield", color: "rose" },
  { name: "Back", nameEn: "Back", icon: "anchor", color: "blue" },
  { name: "Shoulders", nameEn: "Shoulders", icon: "mountain", color: "amber" },
  { name: "Arms", nameEn: "Arms", icon: "dumbbell", color: "violet" },
  { name: "Triceps", nameEn: "Triceps", icon: "zap", color: "coral" },
  { name: "Legs", nameEn: "Legs", icon: "flame", color: "teal" },
  { name: "Core", nameEn: "Core", icon: "target", color: "orange" },
];
