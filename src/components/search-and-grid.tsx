"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  FolderPlus,
  Plus,
  Search,
  SearchX,
  Star,
} from "lucide-react";
import { categoryColor, categoryIcon } from "@/lib/categories";
import { formatCount, formatWeight, sinceLabelAr } from "@/lib/format";
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
    <section className="mt-6 space-y-4">
      {/* Quick search — instantly filters exercises across all categories */}
      <div className="anim-fade-up sticky top-3 z-30">
        <div className="relative">
          <Search className="pointer-events-none absolute start-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن تمرين… بالعربي أو English"
            className="w-full rounded-2xl border border-iron-600 bg-iron-850/95 py-3.5 pe-4 ps-12 text-sm text-white shadow-lg shadow-iron-950/40 backdrop-blur-xl placeholder:text-slate-500 focus:border-volt-500 focus:outline-none focus:ring-2 focus:ring-volt-500/25"
          />
          {searching && (
            <span className="absolute end-4 top-1/2 -translate-y-1/2 rounded-full bg-volt-500/15 px-2.5 py-0.5 text-[10px] font-black text-volt-400">
              {formatCount(results.length)} نتيجة
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
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-iron-600 py-10 text-center">
              <SearchX className="h-7 w-7 text-slate-600" />
              <p className="text-sm font-bold text-slate-400">
                لا نتائج لـ «{query.trim()}»
              </p>
              <p className="text-xs text-slate-500">
                استخدم زر + لتسجيل رقم قياسي وإنشاء تمرين جديد فورًا
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="stagger space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-slate-300">المجموعات العضلية</h2>
            <span className="text-[11px] font-bold text-slate-500">
              {formatCount(allExercises.length)} تمرين · {formatCount(categories.length)} فئة
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
                className="glass-card overflow-hidden rounded-2xl transition-all"
                style={open ? { borderColor: `${col.hex}55` } : undefined}
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
                    <span className="block text-sm font-black text-white">{cat.name}</span>
                    <span className="block text-[11px] font-semibold text-slate-500">
                      {cat.nameEn ?? ""}{" "}
                      {cat.exercises.length > 0 &&
                        `· ${formatCount(cat.exercises.length)} تمرين`}
                      {totalPrs > 0 && ` · ${formatCount(totalPrs)} PR`}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4.5 w-4.5 text-slate-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-1 border-t border-iron-700/60 px-2.5 pt-2.5 pb-3">
                      {cat.exercises.map((ex) => (
                        <ExerciseRow key={ex.id} ex={ex} compact />
                      ))}
                      {cat.exercises.length === 0 && (
                        <p className="px-2 py-3 text-center text-xs text-slate-500">
                          لا تمارين بعد في هذه الفئة
                        </p>
                      )}
                      <button
                        onClick={() => setSheet({ mode: "create", categoryId: cat.id })}
                        className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-iron-600 py-2.5 text-xs font-bold text-slate-400 transition-colors hover:border-volt-500/50 hover:text-volt-400"
                      >
                        <Plus className="h-4 w-4" />
                        إضافة تمرين إلى {cat.name}
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
            className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-iron-600 bg-iron-850/40 py-4 text-sm font-bold text-slate-400 transition-colors hover:border-volt-500/50 hover:text-volt-400"
          >
            <FolderPlus className="h-4.5 w-4.5" />
            إنشاء فئة مخصصة جديدة
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
      className={`group flex items-center gap-3 rounded-xl px-3 transition-colors hover:bg-iron-800 ${
        compact ? "py-2.5" : "glass-card py-3"
      }`}
    >
      {ex.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ex.imageUrl}
          alt={ex.name}
          className="h-10 w-10 shrink-0 rounded-lg border border-iron-600 object-cover"
        />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-iron-800 text-slate-500">
          <Star className="h-4.5 w-4.5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-white">
          {ex.name}
          {ex.nameEn && (
            <span className="ms-1.5 text-[11px] font-semibold text-slate-500">{ex.nameEn}</span>
          )}
        </span>
        <span className="block text-[11px] font-semibold text-slate-500">
          {showCategory && `${ex.categoryName} · `}
          {ex.entryCount > 0
            ? `${formatCount(ex.entryCount)} سجل${ex.lastDate ? ` · آخر ظهور ${sinceLabelAr(ex.lastDate)}` : ""}`
            : "لم يُسجَّل بعد"}
        </span>
      </span>
      {ex.maxWeight !== null && (
        <span className="tabular shrink-0 rounded-lg border border-volt-500/30 bg-volt-500/10 px-2 py-1 text-[11px] font-black text-volt-400">
          {formatWeight(ex.maxWeight)} كجم
        </span>
      )}
      <ChevronLeft className="h-4 w-4 shrink-0 text-slate-600 transition-transform group-hover:-translate-x-0.5" />
    </Link>
  );
}
