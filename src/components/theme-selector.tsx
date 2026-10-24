"use client";

import { Check, Palette } from "lucide-react";
import { useTheme, type ThemeId } from "@/components/theme-provider";

const THEMES: { id: ThemeId; name: string; description: string; colors: { bg: string; accent: string; text: string } }[] = [
  {
    id: "paper",
    name: "Paper",
    description: "Clean minimalist light",
    colors: { bg: "#F6F4F1", accent: "#F95C4B", text: "#000000" },
  },
  {
    id: "stone",
    name: "Stone",
    description: "Warm neutral tones",
    colors: { bg: "#E4DED2", accent: "#F95C4B", text: "#000000" },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark mode",
    colors: { bg: "#0f0f0f", accent: "#F95C4B", text: "#ffffff" },
  },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="clean-card space-y-4 rounded-3xl p-5">
      <div className="flex items-center gap-2">
        <Palette className="h-4.5 w-4.5 text-coral" />
        <h2 className="text-sm font-black text-ink">Theme</h2>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {THEMES.map((t) => {
          const active = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all active:scale-95 ${
                active
                  ? "border-coral bg-coral/5"
                  : "border-stone bg-white hover:border-ink-faint"
              }`}
            >
              <div
                className="flex h-10 w-full items-center justify-center rounded-lg"
                style={{ background: t.colors.bg, border: "1px solid rgba(0,0,0,0.08)" }}
              >
                <div className="flex gap-1">
                  <div className="h-3 w-3 rounded-full" style={{ background: t.colors.accent }} />
                  <div className="h-3 w-3 rounded-full" style={{ background: t.colors.text }} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-black text-ink">{t.name}</p>
                <p className="text-[9px] font-semibold text-ink-faint">{t.description}</p>
              </div>
              {active && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-coral">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
