"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Dumbbell, Filter } from "lucide-react";
import { formatCount, formatDayEn, formatWeight } from "@/lib/format";
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
          label="All"
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
          <h2 className="sticky top-3 z-20 w-fit rounded-full border px-4 py-1.5 text-[11px] font-black backdrop-blur" style={{ borderColor: "var(--color-card-border)", background: "var(--color-card)", color: "var(--color-text-muted)" }}>
            {formatDayEn(date)}
            <span className="ms-2" style={{ color: "var(--color-text-faint)" }}>{formatCount(list.length)} exercise{list.length !== 1 ? "s" : ""}</span>
          </h2>
          {list.map((e) => (
            <Link
              key={e.id}
              href={`/exercise/${e.exerciseId}`}
              className={and(
                "clean-card group flex items-center gap-3 rounded-2xl p-3.5 transition-all",
              )}
            >
              {e.exerciseImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={e.exerciseImage}
                  alt={e.exerciseName}
                  className="h-11 w-11 shrink-0 rounded-xl border object-cover"
                  style={{ borderColor: "var(--color-card-border)" }}
                />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--color-hover)", color: "var(--color-text-faint)" }}>
                  <Dumbbell className="h-5 w-5" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-black" style={{ color: "var(--color-text)" }}>
                  <span className="truncate">{e.exerciseName}</span>
                </span>
                <span className="block truncate text-[11px] font-semibold" style={{ color: "var(--color-text-faint)" }}>
                  {e.categoryName}
                  {e.note ? ` · ${e.note}` : ""}
                </span>
              </span>
              <span className="shrink-0 text-start">
                <span className="tabular block text-base font-black" style={{ color: "var(--color-text)" }}>
                  {formatWeight(e.weightKg)}
                  <span className="text-[9px]" style={{ color: "var(--color-text-faint)" }}> kg</span>
                </span>
                <span className="block text-[9px] font-bold text-teal-600">
                  {formatCount(e.reps)} reps
                </span>
              </span>
            </Link>
          ))}
        </section>
      ))}

      {groups.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Filter className="h-7 w-7" style={{ color: "var(--color-text-faint)" }} />
          <p className="text-sm font-bold" style={{ color: "var(--color-text-muted)" }}>No history here yet</p>
          <p className="max-w-60 text-xs" style={{ color: "var(--color-text-faint)" }}>
            Tap the + button at the bottom of the screen and log your first PR.
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
      className="shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-all active:scale-95"
      style={
        active
          ? { borderColor: "var(--color-accent)", background: "var(--color-accent-soft)", color: "var(--color-accent-text)" }
          : { borderColor: "var(--color-card-border)", background: "var(--color-card)", color: "var(--color-text-muted)" }
      }
    >
      {label}
    </button>
  );
}
