"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgePlus,
  Check,
  ChevronDown,
  Dumbbell,
  LoaderCircle,
  Search,
  Sparkles,
} from "lucide-react";
import { api, ApiError } from "@/lib/http";
import { Sheet, PrimaryButton, FieldLabel, Stepper } from "@/components/ui";
import Celebration from "@/components/celebration";
import { categoryColor, categoryIcon } from "@/lib/categories";
import { formatWeight, todayIso } from "@/lib/format";

interface ExerciseLite {
  id: string;
  name: string;
  nameEn: string | null;
  categoryId: string;
  categoryName: string;
  maxWeight: number | null;
}

interface CategoryLite {
  id: string;
  name: string;
  nameEn: string | null;
  icon: string;
  color: string;
}

// Module-level cache so reopening the sheet is truly instant.
let exercisesCache: ExerciseLite[] | null = null;
let categoriesCache: CategoryLite[] | null = null;

interface Props {
  open: boolean;
  onClose: () => void;
  presetExerciseId?: string | null;
}

export default function LogPrSheet({ open, onClose, presetExerciseId }: Props) {
  const router = useRouter();
  const [exercises, setExercises] = useState<ExerciseLite[]>(exercisesCache ?? []);
  const [categories, setCategories] = useState<CategoryLite[]>(categoriesCache ?? []);

  const [query, setQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [exerciseId, setExerciseId] = useState<string | null>(presetExerciseId ?? null);
  const [newExerciseCategory, setNewExerciseCategory] = useState<string | null>(null);

  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("1");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayIso());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState<{
    weight: number;
    previousBest: number | null;
  } | null>(null);

  const weightRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    try {
      const [exRes, catRes] = await Promise.all([
        api<{ exercises: ExerciseLite[] }>("/api/exercises"),
        api<{ categories: CategoryLite[] }>("/api/categories"),
      ]);
      exercisesCache = exRes.exercises;
      categoriesCache = catRes.categories;
      setExercises(exRes.exercises);
      setCategories(catRes.categories);
    } catch {
      // Offline/unauthenticated — silently retry next open.
    }
  }, []);

  useEffect(() => {
    if (open) {
      void loadData();
      setTimeout(() => weightRef.current?.focus(), 350);
    }
  }, [open, loadData]);

  const selected = useMemo(
    () => exercises.find((e) => e.id === exerciseId) ?? null,
    [exercises, exerciseId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.nameEn ?? "").toLowerCase().includes(q) ||
        e.categoryName.includes(query.trim()),
    );
  }, [exercises, query]);

  const canCreateNew =
    query.trim().length > 0 &&
    !exercises.some((e) => e.name.toLowerCase() === query.trim().toLowerCase());

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps, 10);

    if (!selected && !(canCreateNew && newExerciseCategory)) {
      setError("اختر تمرينًا من القائمة أو أنشئ تمرينًا جديدًا");
      return;
    }
    if (!Number.isFinite(weightNum) || weightNum <= 0) {
      setError("أدخل الوزن بالكيلوغرام — مثال: 80 أو 102.5");
      return;
    }
    if (!Number.isFinite(repsNum) || repsNum < 1) {
      setError("أدخل عدد التكرارات");
      return;
    }

    setLoading(true);
    try {
      const res = await api<{ isNewRecord: boolean; previousBest: number | null }>(
        "/api/entries",
        {
          method: "POST",
          json: {
            ...(selected
              ? { exerciseId: selected.id }
              : { newExercise: { name: query.trim(), categoryId: newExerciseCategory! } }),
            weightKg: weightNum,
            reps: repsNum,
            note: note.trim() || null,
            performedAt: date,
          },
        },
      );
      exercisesCache = null; // aggregates changed → refresh cache next open
      if (res.isNewRecord) {
        setCelebrate({ weight: weightNum, previousBest: res.previousBest });
      } else {
        finish();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذر حفظ الرقم — حاول مجددًا");
    } finally {
      setLoading(false);
    }
  }

  function finish() {
    setCelebrate(null);
    setWeight("");
    setNote("");
    onClose();
    router.refresh();
  }

  const closePicker = () => setPickerOpen(false);

  return (
    <>
      <Sheet open={open} onClose={onClose} title="تسجيل رقم قياسي جديد">
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Exercise picker */}
          <div>
            <FieldLabel>التمرين</FieldLabel>
            {selected ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-volt-500/50 bg-volt-500/10 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-volt-500/20">
                    <Dumbbell className="h-4.5 w-4.5 text-volt-400" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-white">{selected.name}</p>
                    <p className="text-[11px] font-semibold text-slate-400">
                      {selected.categoryName}
                      {selected.maxWeight !== null && (
                        <>
                          {" "}
                          · الأقصى الحالي{" "}
                          <span className="tabular text-volt-400">
                            {formatWeight(selected.maxWeight)} كجم
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setExerciseId(null);
                    setPickerOpen(true);
                  }}
                  className="shrink-0 rounded-lg border border-iron-600 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white"
                >
                  تغيير
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPickerOpen(true);
                  }}
                  onFocus={() => setPickerOpen(true)}
                  placeholder="ابحث أو اكتب اسم تمرين بالعربي أو English…"
                  className="w-full rounded-xl border border-iron-600 bg-iron-800 py-3 pe-4 ps-11 text-sm text-white placeholder:text-slate-500 focus:border-volt-500 focus:outline-none focus:ring-2 focus:ring-volt-500/25"
                />
                <ChevronDown className="pointer-events-none absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            )}

            {/* Dropdown */}
            {pickerOpen && !selected && (
              <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-iron-600 bg-iron-900">
                {filtered.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => {
                      setExerciseId(ex.id);
                      setQuery("");
                      closePicker();
                    }}
                    className="flex w-full items-center justify-between gap-2 border-b border-iron-800 px-4 py-2.5 text-start transition-colors last:border-0 hover:bg-iron-800"
                  >
                    <span>
                      <span className="block text-sm font-bold text-white">{ex.name}</span>
                      <span className="block text-[11px] text-slate-500">
                        {ex.categoryName}
                        {ex.nameEn ? ` · ${ex.nameEn}` : ""}
                      </span>
                    </span>
                    {ex.maxWeight !== null && (
                      <span className="tabular shrink-0 rounded-lg bg-iron-800 px-2 py-1 text-[11px] font-black text-ice-300">
                        {formatWeight(ex.maxWeight)} كجم
                      </span>
                    )}
                  </button>
                ))}

                {canCreateNew && (
                  <div className="border-t border-iron-700 bg-iron-850/60 px-4 py-3">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-volt-400">
                      <BadgePlus className="h-4 w-4" />
                      تمرين جديد: «{query.trim()}»
                    </p>
                    <p className="mb-2 text-[11px] text-slate-500">اختر المجموعة العضلية:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map((c) => {
                        const Icon = categoryIcon(c.icon);
                        const col = categoryColor(c.color);
                        const active = newExerciseCategory === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setNewExerciseCategory(c.id)}
                            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all active:scale-95"
                            style={{
                              borderColor: active ? col.hex : "rgba(148,163,184,0.25)",
                              background: active ? col.soft : "transparent",
                              color: active ? col.hex : "#94a3b8",
                            }}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {c.name}
                            {active && <Check className="h-3 w-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {filtered.length === 0 && !canCreateNew && (
                  <p className="px-4 py-6 text-center text-xs text-slate-500">
                    لا توجد تمارين بعد — اكتب اسمًا لإنشاء واحد
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Weight & reps */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>الوزن الأقصى</FieldLabel>
              <Stepper
                value={weight}
                onChange={setWeight}
                step={2.5}
                min={0}
                max={2000}
                suffix="كجم kg"
              />
            </div>
            <div>
              <FieldLabel>التكرارات</FieldLabel>
              <Stepper value={reps} onChange={setReps} step={1} min={1} max={500} suffix="تكرار" inputMode="numeric" />
            </div>
          </div>

          {/* Quick weight chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500">سريع:</span>
            {[20, 40, 60, 80, 100, 120, 140].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeight(w.toString())}
                className="tabular rounded-full border border-iron-600 bg-iron-800 px-3 py-1 text-[11px] font-black text-slate-300 transition-all hover:border-volt-500/60 hover:text-volt-400 active:scale-95"
              >
                {w}
              </button>
            ))}
          </div>

          {/* Date & note */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel>التاريخ</FieldLabel>
              <input
                type="date"
                value={date}
                max={todayIso()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-iron-600 bg-iron-800 px-4 py-3 text-sm text-white focus:border-volt-500 focus:outline-none focus:ring-2 focus:ring-volt-500/25"
              />
            </div>
            <div>
              <FieldLabel>ملاحظة (اختياري)</FieldLabel>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={300}
                placeholder='مثال: "Bar + 30kg" أو "قبضة داخلية"'
                className="w-full rounded-xl border border-iron-600 bg-iron-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-volt-500 focus:outline-none focus:ring-2 focus:ring-volt-500/25"
              />
            </div>
          </div>

          {error && (
            <div role="alert" className="anim-pop rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">
              {error}
            </div>
          )}

          <PrimaryButton loading={loading} disabled={loading}>
            {loading ? (
              <LoaderCircle className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <Sparkles className="h-4.5 w-4.5" />
            )}
            {loading ? "جارٍ الحفظ..." : "احفظ الرقم القياسي"}
          </PrimaryButton>

          <p className="text-center text-[11px] font-semibold text-slate-500">
            الأوزان بالكيلوغرام (kg) حصرًا — الحديد يُقاس بالحديد.
          </p>
        </form>
      </Sheet>

      <Celebration
        show={celebrate !== null}
        weight={celebrate?.weight ?? 0}
        previousBest={celebrate?.previousBest ?? null}
        onDone={finish}
      />
    </>
  );
}
