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
      setError("Pick an exercise from the list or create a new one");
      return;
    }
    if (!Number.isFinite(weightNum) || weightNum <= 0) {
      setError("Enter weight in kilograms — e.g. 80 or 102.5");
      return;
    }
    if (!Number.isFinite(repsNum) || repsNum < 1) {
      setError("Enter the number of reps");
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
      setError(err instanceof ApiError ? err.message : "Failed to save — please try again");
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
      <Sheet open={open} onClose={onClose} title="Log a New PR">
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Exercise picker */}
          <div>
            <FieldLabel>Exercise</FieldLabel>
            {selected ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3" style={{ borderColor: "var(--color-accent)", background: "var(--color-accent-soft)" }}>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "var(--color-accent-soft)" }}>
                    <Dumbbell className="h-4.5 w-4.5" style={{ color: "var(--color-accent)" }} />
                  </span>
                  <div>
                    <p className="text-sm font-black" style={{ color: "var(--color-text)" }}>{selected.name}</p>
                    <p className="text-[11px] font-semibold" style={{ color: "var(--color-text-muted)" }}>
                      {selected.categoryName}
                      {selected.maxWeight !== null && (
                        <>
                          {" "}
                          · Current max{" "}
                          <span className="tabular" style={{ color: "var(--color-accent)" }}>
                            {formatWeight(selected.maxWeight)} kg
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
                  className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-bold"
                  style={{ borderColor: "var(--color-card-border)", color: "var(--color-text-muted)" }}
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2" style={{ color: "var(--color-text-faint)" }} />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPickerOpen(true);
                  }}
                  onFocus={() => setPickerOpen(true)}
                  placeholder="Search or type an exercise name..."
                  className="w-full rounded-xl border py-3 pe-4 ps-11 text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--color-card-border)",
                    background: "var(--color-input-bg)",
                    color: "var(--color-text)",
                    "--tw-ring-color": "var(--color-accent)",
                  } as React.CSSProperties}
                />
                <ChevronDown className="pointer-events-none absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--color-text-faint)" }} />
              </div>
            )}

            {/* Dropdown */}
            {pickerOpen && !selected && (
              <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border" style={{ borderColor: "var(--color-card-border)", background: "var(--color-card)" }}>
                {filtered.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => {
                      setExerciseId(ex.id);
                      setQuery("");
                      closePicker();
                    }}
                    className="flex w-full items-center justify-between gap-2 border-b px-4 py-2.5 text-start transition-colors last:border-0"
                    style={{ borderColor: "var(--color-card-border)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <span>
                      <span className="block text-sm font-bold" style={{ color: "var(--color-text)" }}>{ex.name}</span>
                      <span className="block text-[11px]" style={{ color: "var(--color-text-faint)" }}>
                        {ex.categoryName}
                        {ex.nameEn ? ` · ${ex.nameEn}` : ""}
                      </span>
                    </span>
                    {ex.maxWeight !== null && (
                      <span className="tabular shrink-0 rounded-lg px-2 py-1 text-[11px] font-black" style={{ background: "var(--color-hover)", color: "var(--color-accent)" }}>
                        {formatWeight(ex.maxWeight)} kg
                      </span>
                    )}
                  </button>
                ))}

                {canCreateNew && (
                  <div className="border-t px-4 py-3" style={{ borderColor: "var(--color-card-border)", background: "var(--color-hover)" }}>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold" style={{ color: "var(--color-accent)" }}>
                      <BadgePlus className="h-4 w-4" />
                      New exercise: &ldquo;{query.trim()}&rdquo;
                    </p>
                    <p className="mb-2 text-[11px]" style={{ color: "var(--color-text-faint)" }}>Choose muscle group:</p>
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
                              borderColor: active ? col.hex : "var(--color-card-border)",
                              background: active ? col.soft : "transparent",
                              color: active ? col.hex : "var(--color-text-muted)",
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
                  <p className="px-4 py-6 text-center text-xs" style={{ color: "var(--color-text-faint)" }}>
                    No exercises yet — type a name to create one
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Weight & reps */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Weight</FieldLabel>
              <Stepper
                value={weight}
                onChange={setWeight}
                step={2.5}
                min={0}
                max={2000}
                suffix="kg"
              />
            </div>
            <div>
              <FieldLabel>Reps</FieldLabel>
              <Stepper value={reps} onChange={setReps} step={1} min={1} max={500} suffix="reps" inputMode="numeric" />
            </div>
          </div>

          {/* Quick weight chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold" style={{ color: "var(--color-text-faint)" }}>Quick:</span>
            {[20, 40, 60, 80, 100, 120, 140].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeight(w.toString())}
                className="tabular rounded-full border px-3 py-1 text-[11px] font-black transition-all active:scale-95"
                style={{ borderColor: "var(--color-card-border)", background: "var(--color-card)", color: "var(--color-text-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.color = "var(--color-accent-text)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-card-border)"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
              >
                {w}
              </button>
            ))}
          </div>

          {/* Date & note */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel>Date</FieldLabel>
              <input
                type="date"
                value={date}
                max={todayIso()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--color-card-border)",
                  background: "var(--color-input-bg)",
                  color: "var(--color-text)",
                  "--tw-ring-color": "var(--color-accent)",
                } as React.CSSProperties}
              />
            </div>
            <div>
              <FieldLabel>Note (optional)</FieldLabel>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={300}
                placeholder='e.g. "Bar + 30kg" or "Inside grip"'
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--color-card-border)",
                  background: "var(--color-input-bg)",
                  color: "var(--color-text)",
                  "--tw-ring-color": "var(--color-accent)",
                } as React.CSSProperties}
              />
            </div>
          </div>

          {error && (
            <div role="alert" className="anim-pop rounded-xl border px-4 py-3 text-sm font-semibold" style={{ borderColor: "var(--color-accent)", background: "var(--color-accent-soft)", color: "var(--color-accent-text)" }}>
              {error}
            </div>
          )}

          <PrimaryButton loading={loading} disabled={loading}>
            {loading ? (
              <LoaderCircle className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <Sparkles className="h-4.5 w-4.5" />
            )}
            {loading ? "Saving..." : "Save PR"}
          </PrimaryButton>

          <p className="text-center text-[11px] font-semibold" style={{ color: "var(--color-text-faint)" }}>
            Weights are in kilograms (kg) only — iron is measured in iron.
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
