"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ThemeId = "paper" | "stone" | "midnight";

interface ThemeColors {
  bg: string;
  card: string;
  cardBorder: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  text: string;
  textMuted: string;
  textFaint: string;
  inputBg: string;
  hover: string;
}

const THEMES: Record<ThemeId, ThemeColors> = {
  paper: {
    bg: "#F6F4F1",
    card: "#ffffff",
    cardBorder: "#E4DED2",
    accent: "#F95C4B",
    accentSoft: "rgba(249,92,75,0.10)",
    accentText: "#F95C4B",
    text: "#000000",
    textMuted: "#6b6b6b",
    textFaint: "#a3a3a3",
    inputBg: "#ffffff",
    hover: "rgba(0,0,0,0.03)",
  },
  stone: {
    bg: "#E4DED2",
    card: "#F6F4F1",
    cardBorder: "#d4cec2",
    accent: "#F95C4B",
    accentSoft: "rgba(249,92,75,0.10)",
    accentText: "#F95C4B",
    text: "#000000",
    textMuted: "#6b6b6b",
    textFaint: "#a3a3a3",
    inputBg: "#F6F4F1",
    hover: "rgba(0,0,0,0.04)",
  },
  midnight: {
    bg: "#0f0f0f",
    card: "#1a1a1a",
    cardBorder: "#2a2a2a",
    accent: "#F95C4B",
    accentSoft: "rgba(249,92,75,0.15)",
    accentText: "#F95C4B",
    text: "#ffffff",
    textMuted: "#a3a3a3",
    textFaint: "#6b6b6b",
    inputBg: "#1a1a1a",
    hover: "rgba(255,255,255,0.05)",
  },
};

interface ThemeContextValue {
  theme: ThemeId;
  colors: ThemeColors;
  setTheme: (t: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "paper",
  colors: THEMES.paper,
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const STORAGE_KEY = "ironvault-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("paper");
  const [mounted, setMounted] = useState(false);

  // Load saved theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (saved && saved in THEMES) {
      setThemeState(saved);
    }
    setMounted(true);
  }, []);

  // Apply CSS custom properties to :root whenever theme changes
  useEffect(() => {
    if (!mounted) return;
    const colors = THEMES[theme];
    const root = document.documentElement;
    root.style.setProperty("--color-bg", colors.bg);
    root.style.setProperty("--color-card", colors.card);
    root.style.setProperty("--color-card-border", colors.cardBorder);
    root.style.setProperty("--color-accent", colors.accent);
    root.style.setProperty("--color-accent-soft", colors.accentSoft);
    root.style.setProperty("--color-accent-text", colors.accentText);
    root.style.setProperty("--color-text", colors.text);
    root.style.setProperty("--color-text-muted", colors.textMuted);
    root.style.setProperty("--color-text-faint", colors.textFaint);
    root.style.setProperty("--color-input-bg", colors.inputBg);
    root.style.setProperty("--color-hover", colors.hover);
    // Update color-scheme for native form controls
    root.style.colorScheme = theme === "midnight" ? "dark" : "light";
  }, [theme, mounted]);

  function setTheme(t: ThemeId) {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  }

  // Prevent flash of wrong theme
  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, colors: THEMES[theme], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
