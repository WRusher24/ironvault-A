"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Plus,
  Search,
  SearchX,
  Star,
} from "lucide-react";
import { categoryColor, categoryIcon } from "@/lib/categories";
import { formatCount, formatWeight, sinceLabelEn } from "@/lib/format";
import ExerciseSheet from "@/components/exercise-sheet";

export interface DashboardExercise {
  id: string;
  name: string;
  nameEn: string | null;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  maxWeight: number | null;
  entryCount: number;
  prCount: number;
  lastDate: string | null;
}

export interface DashboardCategory {
  id: string;
  name: string;
  nameEn: string | null;
  icon: string;
  color: string;
  exercises: DashboardExercise[];
}

export default function SearchAndGrid({
  categories,
}: {
  categories: DashboardCategory[];
}) {
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(categories.slice(0, 2).map((c) => c.id)),
  );
  const [sheet, setSheet] = useState<{
    mode: "create";
    categoryId: string;
  } | null>(null);

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const allExercises = useMemo(
    () => categories.flatMap((c) => c.exercises),
    [categories],
  );

  const results = useMemo(() => {
    if (!searching) return [];
    return allExercises.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.nameEn ?? "").toLowerCase().includes(q) ||
        e.categoryName.toLowerCase().includes(q),
    );
  }, [allExercises, q, searching]);

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section className="space-y-4">
      {/* Quick search — instantly filters exercises across all categories */}
      <div className="anim-fade-up sticky top-3 z-30">
        <div className="relative">
          <Search className="pointer-events-none absolute start-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2" style={{ color: "var(--color-text-faint)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for an exercise..."
            className="w-full rounded-2xl border py-3.5 pe-4 ps-12 text-sm shadow-sm focus:outline-none focus:ring-2"
            style={{
              borderColor: "var(--color-card-border)",
              background: "var(--color-input-bg)",
              color: "var(--color-text)",
              "--tw-ring-color": "var(--color-accent)",
            } as React.CSSProperties}
          />
          {searching && (
            <span className="absolute end-4 top-1/2 -translate-y-1/2 rounded-full px-2.5 py-0.5 text-[10px] font-black" style={{ background: "var(--color-accent-soft)", color: "var(--color-accent-text)" }}>
              {formatCount(results.length)} result{results.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {searching ? (
        <div className="space-y-2">
          {results.map((ex) => (
            <ExerciseRow key={ex.id} ex={ex} showCategory />
          ))}
          {results.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-10 text-center" style={{ borderColor: "var(--color-card-border)" }}>
              <SearchX className="h-7 w-7" style={{ color: "var(--color-text-faint)" }} />
              <p className="text-sm font-bold" style={{ color: "var(--color-text-muted)" }}>
                No results for &ldquo;{query.trim()}&rdquo;
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-faint)" }}>
                Use the + button to log a PR and create a new exercise instantly
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="stagger space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black" style={{ color: "var(--color-text)" }}>Muscle Groups</h2>
            <span className="text-[11px] font-bold" style={{ color: "var(--color-text-faint)" }}>
              {formatCount(allExercises.length)} exercise{allExercises.length !== 1 ? "s" : ""} · {formatCount(categories.length)} categor{categories.length !== 1 ? "ies" : "y"}
            </span>
          </div>

          {categories.map((cat) => {
            const Icon = categoryIcon(cat.icon);
            const col = categoryColor(cat.color);
            const open = openIds.has(cat.id);
            const totalPrs = cat.exercises.reduce((s, e) => s + e.prCount, 0);
            return (
              <div
                key={cat.id}
                className="clean-card overflow-hidden transition-all"
                style={open ? { borderColor: `${col.hex}44` } : undefined}
              >
                <button
                  onClick={() => toggle(cat.id)}
                  className="flex w-full items-center gap-3 p-4 text-start"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: col.soft, color: col.hex }}
                  >
                    <Icon className="h-5.5 w-5.5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-black" style={{ color: "var(--color-text)" }}>{cat.name}</span>
                    <span className="block text-[11px] font-semibold" style={{ color: "var(--color-text-faint)" }}>
                      {cat.nameEn ?? ""}{" "}
                      {cat.exercises.length > 0 &&
                        `· ${formatCount(cat.exercises.length)} exercise${cat.exercises.length !== 1 ? "s" : ""}`}
                      {totalPrs > 0 && ` · ${formatCount(totalPrs)} PR${totalPrs !== 1 ? "s" : ""}`}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4.5 w-4.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                    style={{ color: "var(--color-text-faint)" }}
                  />
                </button>

                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-1 border-t px-2.5 pt-2.5 pb-3" style={{ borderColor: "var(--color-card-border)" }}>
                      {cat.exercises.map((ex) => (
                        <ExerciseRow key={ex.id} ex={ex} compact />
                      ))}
                      {cat.exercises.length === 0 && (
                        <p className="px-2 py-3 text-center text-xs" style={{ color: "var(--color-text-faint)" }}>
                          No exercises in this category yet
                        </p>
                      )}
                      <button
                        onClick={() => setSheet({ mode: "create", categoryId: cat.id })}
                        className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed py-2.5 text-xs font-bold transition-colors"
                        style={{ borderColor: "var(--color-card-border)", color: "var(--color-text-muted)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.color = "var(--color-accent-text)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-card-border)"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
                      >
                        <Plus className="h-4 w-4" />
                        Add exercise to {cat.name}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Create a new custom category */}
          <Link
            href="/profile#categories"
            className="flex items-center justify-center gap-2 rounded-2xl border border-dashed py-4 text-sm font-bold transition-colors"
            style={{ borderColor: "var(--color-card-border)", color: "var(--color-text-muted)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.color = "var(--color-accent-text)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-card-border)"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
          >
            <FolderPlus className="h-4.5 w-4.5" />
            Create new custom category
          </Link>
        </div>
      )}

      <ExerciseSheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
        }))}
        presetCategoryId={sheet?.categoryId ?? null}
      />
    </section>
  );
}

function ExerciseRow({
  ex,
  compact,
  showCategory,
}: {
  ex: DashboardExercise;
  compact?: boolean;
  showCategory?: boolean;
}) {
  return (
    <Link
      href={`/exercise/${ex.id}`}
      className={`group flex items-center gap-3 rounded-xl px-3 transition-colors ${compact ? "py-2.5" : "clean-card py-3"}`}
      style={{ background: compact ? "transparent" : "var(--color-card)" }}
      onMouseEnter={(e) => { if (compact) e.currentTarget.style.background = "var(--color-hover)"; }}
      onMouseLeave={(e) => { if (compact) e.currentTarget.style.background = "transparent"; }}
    >
      {ex.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ex.imageUrl}
          alt={ex.name}
          className="h-10 w-10 shrink-0 rounded-lg border object-cover"
          style={{ borderColor: "var(--color-card-border)" }}
        />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--color-hover)", color: "var(--color-text-faint)" }}>
          <Star className="h-4.5 w-4.5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold" style={{ color: "var(--color-text)" }}>
          {ex.name}
          {ex.nameEn && (
            <span className="ms-1.5 text-[11px] font-semibold" style={{ color: "var(--color-text-faint)" }}>{ex.nameEn}</span>
          )}
        </span>
        <span className="block text-[11px] font-semibold" style={{ color: "var(--color-text-faint)" }}>
          {showCategory && `${ex.categoryName} · `}
          {ex.entryCount > 0
            ? `${formatCount(ex.entryCount)} entr${ex.entryCount !== 1 ? "ies" : "y"}${ex.lastDate ? ` · Last ${sinceLabelEn(ex.lastDate)}` : ""}`
            : "Not logged yet"}
        </span>
      </span>
      {ex.maxWeight !== null && (
        <span className="tabular shrink-0 rounded-lg border px-2 py-1 text-[11px] font-black" style={{ borderColor: "var(--color-accent)", background: "var(--color-accent-soft)", color: "var(--color-accent-text)" }}>
          {formatWeight(ex.maxWeight)} kg
        </span>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--color-text-faint)" }} />
    </Link>
  );
}
