"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy, Zap } from "lucide-react";
import { formatWeight } from "@/lib/format";

const CONFETTI_COLORS = ["#22c55e", "#22d3ee", "#a3e635", "#f59e0b", "#ffffff", "#86efac"];

interface Props {
  show: boolean;
  weight: number;
  previousBest: number | null;
  onDone: () => void;
}

/** Satisfying neon confetti burst + "NEW PR!" card when a record is smashed. */
export default function Celebration({ show, weight, previousBest, onDone }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) setVisible(true);
    if (!show) return;
    const t = setTimeout(() => {
      setVisible(false);
      onDone();
    }, 3200);
    return () => clearTimeout(t);
  }, [show, onDone]);

  const pieces = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2.2 + Math.random() * 1.4,
        size: 5 + Math.random() * 7,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        drift: (Math.random() - 0.5) * 240,
        spin: 360 + Math.random() * 720,
        round: Math.random() > 0.6,
      })),
    [show],
  );

  if (!visible) return null;

  const gain = previousBest !== null ? Math.round((weight - previousBest) * 100) / 100 : null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      <div className="anim-overlay-in absolute inset-0 bg-iron-950/85 backdrop-blur-sm" />

      {/* Confetti rain */}
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.45,
            background: p.color,
            borderRadius: p.round ? "50%" : 2,
            boxShadow: `0 0 10px ${p.color}`,
            animation: `iv-confetti ${p.duration}s cubic-bezier(0.25,0.4,0.45,1) ${p.delay}s both`,
            ["--drift" as string]: `${p.drift}px`,
            ["--spin" as string]: `${p.spin}deg`,
          }}
        />
      ))}

      {/* Hero card */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="anim-pop relative w-full max-w-xs rounded-3xl border border-volt-500/50 bg-gradient-to-b from-iron-800 to-iron-900 p-7 text-center shadow-[0_0_80px_-12px_rgba(34,197,94,0.65)]">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-volt-400 to-volt-600 shadow-[0_0_40px_rgba(34,197,94,0.8)]">
              <Trophy className="h-8 w-8 text-iron-950" strokeWidth={2.2} />
            </div>
          </div>
          <p className="mt-9 text-[11px] font-black uppercase tracking-[0.3em] text-volt-400">
            NEW PR
          </p>
          <h3 className="mt-1 text-2xl font-black text-white">رقم قياسي جديد!</h3>
          <div className="tabular mt-3 text-6xl font-black text-volt-400 drop-shadow-[0_0_24px_rgba(34,197,94,0.6)]">
            {formatWeight(weight)}
            <span className="me-1 text-xl text-slate-400"> كجم</span>
          </div>
          {gain !== null && gain > 0 && (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm font-bold text-ice-300">
              <Zap className="h-4 w-4" />
              <span className="tabular">+{formatWeight(gain)} كجم</span>
              فوق رقمك السابق
            </p>
          )}
          <p className="mt-4 text-xs font-semibold leading-relaxed text-slate-400">
            الحديد لا يكذب — وأنت للتو أثبتّ أنك أقوى من الأمس.
          </p>
        </div>
      </div>
    </div>
  );
}
