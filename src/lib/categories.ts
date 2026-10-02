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

/** Neon accent palettes (hex pairs used for gradients/glows). */
export const CATEGORY_COLORS: Record<
  string,
  { label: string; hex: string; soft: string }
> = {
  volt: { label: "أخضر نيون", hex: "#22c55e", soft: "rgba(34,197,94,0.14)" },
  cyan: { label: "سماوي", hex: "#22d3ee", soft: "rgba(34,211,238,0.14)" },
  violet: { label: "بنفسجي", hex: "#a78bfa", soft: "rgba(167,139,250,0.14)" },
  amber: { label: "كهرماني", hex: "#f59e0b", soft: "rgba(245,158,11,0.14)" },
  rose: { label: "وردي", hex: "#fb7185", soft: "rgba(251,113,133,0.14)" },
  blue: { label: "أزرق", hex: "#60a5fa", soft: "rgba(96,165,250,0.14)" },
  lime: { label: "ليموني", hex: "#a3e635", soft: "rgba(163,230,53,0.14)" },
  orange: { label: "برتقالي", hex: "#fb923c", soft: "rgba(251,146,60,0.14)" },
};

export const CATEGORY_COLOR_KEYS = Object.keys(CATEGORY_COLORS);

export function categoryColor(key: string) {
  return CATEGORY_COLORS[key] ?? CATEGORY_COLORS.volt;
}

/** Default starter categories for brand-new vaults. */
export const DEFAULT_CATEGORIES: {
  name: string;
  nameEn: string;
  icon: string;
  color: string;
}[] = [
  { name: "الصدر", nameEn: "Chest", icon: "shield", color: "rose" },
  { name: "الظهر", nameEn: "Back", icon: "anchor", color: "cyan" },
  { name: "الأكتاف", nameEn: "Shoulders", icon: "mountain", color: "amber" },
  { name: "الأذرع", nameEn: "Arms", icon: "dumbbell", color: "violet" },
  { name: "الأرجل", nameEn: "Legs", icon: "flame", color: "volt" },
  { name: "البطن والجذع", nameEn: "Core", icon: "target", color: "blue" },
];
