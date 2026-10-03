"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Dumbbell, Filter, Trophy } from "lucide-react";
import { formatCount, formatDayAr, formatWeight } from "@/lib/format";
import { and } from "@/lib/classnames";

interface HistoryEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseImage: string | null;
  categoryId: string;
  categoryName: string;
  weightKg: number;
  reps: number;
  note: string | null;
  performedAt: string;
  isPr: boolean;
}

export default function HistoryList({
  entries,
  categories,
}: {
  entries: HistoryEntry[];
  categories: { id: string; name: string }[];
}) {
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter ? entries.filter((e) => e.categoryId === filter) : entries),
    [entries, filter],
  );

  // Group by date string
  const groups = useMemo(() => {
    const map = new Map<string, HistoryEntry[]>();
    for (const e of filtered) {
      const list = map.get(e.performedAt) ?? [];
      list.push(e);
      map.set(e.performedAt, list);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="space-y-5">
      {/* Category filter chips */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <FilterChip
          active={filter === null}
          onClick={() => setFilter(null)}
          label="الكل"
        />
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            active={filter === c.id}
            onClick={() => setFilter((f) => (f === c.id ? null : c.id))}
            label={c.name}
          />
        ))}
      </div>

      {groups.map(([date, list]) => (
        <section key={date} className="stagger space-y-2">
          <h2 className="sticky top-3 z-20 w-fit rounded-full border border-iron-700 bg-iron-900/95 px-4 py-1.5 text-[11px] font-black text-slate-300 backdrop-blur">
            {formatDayAr(date)}
            <span className="ms-2 text-slate-600">{formatCount(list.length)} تمرين</span>
          </h2>
          {list.map((e) => (
            <Link
              key={e.id}
              href={`/exercise/${e.exerciseId}`}
              className={and(
                "glass-card group flex items-center gap-3 rounded-2xl p-3.5 transition-all hover:border-iron-600",
                e.isPr && "border-volt-500/35",
              )}
            >
              {e.exerciseImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={e.exerciseImage}
                  alt={e.exerciseName}
                  className="h-11 w-11 shrink-0 rounded-xl border border-iron-600 object-cover"
                />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-iron-800 text-slate-500">
                  <Dumbbell className="h-5 w-5" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-black text-white">
                  <span className="truncate">{e.exerciseName}</span>
                  {e.isPr && (
                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-volt-500/15 px-2 py-0.5 text-[9px] font-black text-volt-400">
                      <Trophy className="h-2.5 w-2.5" />
                      PR
                    </span>
                  )}
                </span>
                <span className="block truncate text-[11px] font-semibold text-slate-500">
                  {e.categoryName}
                  {e.note ? ` · ${e.note}` : ""}
                </span>
              </span>
              <span className="shrink-0 text-start">
                <span className={`tabular block text-base font-black ${e.isPr ? "text-volt-400" : "text-white"}`}>
                  {formatWeight(e.weightKg)}
                  <span className="text-[9px] text-slate-500"> كجم</span>
                </span>
                <span className="block text-[9px] font-bold text-ice-300">
                  {formatCount(e.reps)} تكرار
                </span>
              </span>
            </Link>
          ))}
        </section>
      ))}

      {groups.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Filter className="h-7 w-7 text-slate-600" />
          <p className="text-sm font-bold text-slate-400">لا يوجد سجل هنا بعد</p>
          <p className="max-w-60 text-xs text-slate-500">
            اضغط زر + أسفل الشاشة وسجّل أول أرقامك القياسية.
          </p>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
        active
          ? "border-volt-500/60 bg-volt-500/15 text-volt-400"
          : "border-iron-600 bg-iron-850/70 text-slate-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
