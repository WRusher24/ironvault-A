"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Dumbbell,
  Flame,
  Quote,
  Sparkles,
  Trophy,
} from "lucide-react";
import { formatCount, formatWeight, greetingEn, sinceLabelEn } from "@/lib/format";

interface Featured {
  id: string;
  name: string;
  categoryName: string;
  maxWeight: number | null;
}

interface Props {
  userName: string;
  totalPrs: number;
  totalEntries: number;
  streakWeeks: number;
  trainedThisWeek: boolean;
  motivation: string;
  lastPrDate: string | null;
  featured: Featured | null;
}

/** Animated count-up used for the headline numbers. */
function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

export default function StatsHeader({
  userName,
  totalPrs,
  totalEntries,
  streakWeeks,
  trainedThisWeek,
  motivation,
  lastPrDate,
  featured,
}: Props) {
  const prs = useCountUp(totalPrs);
  const entries = useCountUp(totalEntries);
  const firstName = userName.trim().split(/\s+/)[0];

  return (
    <header className="stagger space-y-4">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold" style={{ color: "var(--color-text-faint)" }}>
            {greetingEn()}
          </p>
          <h1 className="mt-0.5 text-2xl font-black" style={{ color: "var(--color-text)" }}>
            {firstName} <span style={{ color: "var(--color-accent)" }}>·</span>{" "}
            <span className="text-lg font-extrabold" style={{ color: "var(--color-text-muted)" }}>Your vault is ready</span>
          </h1>
        </div>
        <div className="coral-glow flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "var(--color-accent)" }}>
          <Dumbbell className="h-6 w-6 text-white" strokeWidth={2.4} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="clean-card rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5" style={{ color: "var(--color-accent)" }}>
            <Trophy className="h-4 w-4" />
            <span className="text-[10px] font-black" style={{ color: "var(--color-text-muted)" }}>PRs</span>
          </div>
          <p className="tabular mt-1.5 text-2xl font-black" style={{ color: "var(--color-text)" }}>{formatCount(prs)}</p>
          <p className="text-[10px] font-semibold" style={{ color: "var(--color-text-faint)" }}>Records broken</p>
        </div>

        <div className="clean-card rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-amber-500">
            <Flame className="h-4 w-4" />
            <span className="text-[10px] font-black" style={{ color: "var(--color-text-muted)" }}>Streak</span>
          </div>
          <p className="tabular mt-1.5 text-2xl font-black" style={{ color: "var(--color-text)" }}>
            {formatCount(streakWeeks)}
            <span className="text-xs font-bold" style={{ color: "var(--color-text-faint)" }}> weeks</span>
          </p>
          <p className="text-[10px] font-bold" style={{ color: trainedThisWeek ? "var(--color-accent)" : "var(--color-text-faint)" }}>
            {trainedThisWeek ? "Active this week" : "Waiting for you"}
          </p>
        </div>

        <div className="clean-card rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-teal-600">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-black" style={{ color: "var(--color-text-muted)" }}>Entries</span>
          </div>
          <p className="tabular mt-1.5 text-2xl font-black" style={{ color: "var(--color-text)" }}>{formatCount(entries)}</p>
          <p className="text-[10px] font-semibold" style={{ color: "var(--color-text-faint)" }}>
            {lastPrDate ? `Last PR: ${sinceLabelEn(lastPrDate)}` : "Training log"}
          </p>
        </div>
      </div>

      {/* Featured exercise highlight */}
      {featured && featured.maxWeight !== null && (
        <Link
          href={`/exercise/${featured.id}`}
          className="group relative block overflow-hidden rounded-2xl border p-4 transition-all"
          style={{ borderColor: "var(--color-accent)", background: "var(--color-accent-soft)" }}
        >
          <div className="absolute -end-6 -top-6 h-24 w-24 rounded-full blur-2xl transition-all" style={{ background: "var(--color-accent-soft)" }} />
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>
                <Sparkles className="h-3.5 w-3.5" />
                Featured exercise
              </p>
              <p className="mt-1 text-lg font-black" style={{ color: "var(--color-text)" }}>
                {featured.name}
                <span className="ms-2 text-xs font-bold" style={{ color: "var(--color-text-faint)" }}>{featured.categoryName}</span>
              </p>
              <p className="mt-0.5 text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
                Your current record — ready to break it?
              </p>
            </div>
            <div className="shrink-0 text-start">
              <p className="tabular text-3xl font-black" style={{ color: "var(--color-accent)" }}>
                {formatWeight(featured.maxWeight)}
              </p>
              <p className="text-end text-[10px] font-bold" style={{ color: "var(--color-text-faint)" }}>kg</p>
            </div>
          </div>
        </Link>
      )}

      {/* Dynamic motivational line */}
      <div className="flex items-start gap-2.5 rounded-2xl border px-4 py-3" style={{ borderColor: "var(--color-card-border)", background: "var(--color-card)" }}>
        <Quote className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--color-accent)" }} />
        <p className="text-xs font-semibold leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{motivation}</p>
      </div>
    </header>
  );
}
