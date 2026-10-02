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
import { formatWeight, greetingAr, sinceLabelAr, toArabicDigits } from "@/lib/format";

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
          <p className="text-xs font-bold text-slate-500">
            {greetingAr()}
          </p>
          <h1 className="mt-0.5 text-2xl font-black text-white">
            {firstName} <span className="text-volt-400">·</span>{" "}
            <span className="text-lg font-extrabold text-slate-300">خزنتك جاهزة</span>
          </h1>
        </div>
        <div className="volt-glow flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-volt-500 to-ice-500">
          <Dumbbell className="h-6 w-6 text-iron-950" strokeWidth={2.4} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="glass-card rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-volt-400">
            <Trophy className="h-4 w-4" />
            <span className="text-[10px] font-black text-slate-400">أرقام قياسية</span>
          </div>
          <p className="tabular mt-1.5 text-2xl font-black text-white">{toArabicDigits(prs)}</p>
          <p className="text-[10px] font-semibold text-slate-500">رقم محطَّم</p>
        </div>

        <div className="glass-card rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-ice-300">
            <Flame className="h-4 w-4" />
            <span className="text-[10px] font-black text-slate-400">سلسلة النشاط</span>
          </div>
          <p className="tabular mt-1.5 text-2xl font-black text-white">
            {toArabicDigits(streakWeeks)}
            <span className="text-xs font-bold text-slate-500"> أسبوع</span>
          </p>
          <p className={`text-[10px] font-bold ${trainedThisWeek ? "text-volt-400" : "text-slate-500"}`}>
            {trainedThisWeek ? "نشط هذا الأسبوع" : "بانتظارك هذا الأسبوع"}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-violet-300">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-black text-slate-400">سجلات</span>
          </div>
          <p className="tabular mt-1.5 text-2xl font-black text-white">{toArabicDigits(entries)}</p>
          <p className="text-[10px] font-semibold text-slate-500">
            {lastPrDate ? `آخر PR: ${sinceLabelAr(lastPrDate)}` : "سجل تدريبي"}
          </p>
        </div>
      </div>

      {/* Featured exercise highlight */}
      {featured && featured.maxWeight !== null && (
        <Link
          href={`/exercise/${featured.id}`}
          className="group relative block overflow-hidden rounded-2xl border border-volt-500/30 bg-gradient-to-l from-volt-500/12 via-iron-850 to-iron-850 p-4 transition-all hover:border-volt-500/60"
        >
          <div className="absolute -end-6 -top-6 h-24 w-24 rounded-full bg-volt-500/15 blur-2xl transition-all group-hover:bg-volt-500/25" />
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-volt-400">
                <Sparkles className="h-3.5 w-3.5" />
                تمرين اليوم المميز
              </p>
              <p className="mt-1 text-lg font-black text-white">
                {featured.name}
                <span className="ms-2 text-xs font-bold text-slate-500">{featured.categoryName}</span>
              </p>
              <p className="mt-0.5 text-xs font-semibold text-slate-400">
                رقمك القياسي الحالي — جاهز لتحطيمه؟
              </p>
            </div>
            <div className="shrink-0 text-start">
              <p className="tabular text-3xl font-black text-volt-400 drop-shadow-[0_0_18px_rgba(34,197,94,0.5)]">
                {formatWeight(featured.maxWeight)}
              </p>
              <p className="text-end text-[10px] font-bold text-slate-500">كجم</p>
            </div>
          </div>
        </Link>
      )}

      {/* Dynamic motivational line */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-iron-700/70 bg-iron-850/60 px-4 py-3">
        <Quote className="mt-0.5 h-4 w-4 shrink-0 -scale-x-100 text-ice-400" />
        <p className="text-xs font-semibold leading-relaxed text-slate-300">{motivation}</p>
      </div>
    </header>
  );
}
