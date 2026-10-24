"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Dumbbell,
  Medal,
  Pencil,
  Repeat,
  StickyNote,
  Trash2,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { api, ApiError } from "@/lib/http";
import { categoryColor, categoryIcon } from "@/lib/categories";
import {
  formatDateEn,
  formatWeight,
  sinceLabelEn,
  formatCount,
} from "@/lib/format";
import ProgressChart from "@/components/progress-chart";
import EntrySheet, { type EntryEditable } from "@/components/entry-sheet";
import ExerciseSheet from "@/components/exercise-sheet";
import { GhostButton } from "@/components/ui";

interface DetailExercise {
  id: string;
  name: string;
  nameEn: string | null;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  categoryNameEn: string | null;
  categoryColor: string;
  categoryIcon: string;
}

interface DetailEntry {
  id: string;
  weightKg: number;
  reps: number;
  note: string | null;
  performedAt: string;
  isPr: boolean;
}

interface Stats {
  maxWeight: number | null;
  prCount: number;
  entryCount: number;
  lastDate: string | null;
}

interface Props {
  exercise: DetailExercise;
  entries: DetailEntry[];
  stats: Stats;
  categories: { id: string; name: string; icon: string; color: string }[];
}

export default function ExerciseDetail({ exercise, entries, stats, categories }: Props) {
  const router = useRouter();
  const [editEntry, setEditEntry] = useState<EntryEditable | null>(null);
  const [editExercise, setEditExercise] = useState(false);
  const [confirmDeleteExercise, setConfirmDeleteExercise] = useState(false);
  const [confirmDeleteEntryId, setConfirmDeleteEntryId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const Icon = categoryIcon(exercise.categoryIcon);
  const col = categoryColor(exercise.categoryColor);

  const chartPoints = [...entries]
    .sort((a, b) => a.performedAt.localeCompare(b.performedAt))
    .map((e) => ({
      id: e.id,
      date: e.performedAt,
      weight: e.weightKg,
      reps: e.reps,
      isPr: e.isPr,
    }));

  const timeline = [...entries].sort((a, b) =>
    b.performedAt === a.performedAt
      ? b.id.localeCompare(a.id)
      : b.performedAt.localeCompare(a.performedAt),
  );

  async function deleteExercise() {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/exercises/${exercise.id}`, { method: "DELETE" });
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed");
      setBusy(false);
    }
  }

  async function deleteEntry(id: string) {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/entries/${id}`, { method: "DELETE" });
      setConfirmDeleteEntryId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete entry");
    } finally {
      setBusy(false);
    }
  }

  const openLogSheet = () => {
    window.dispatchEvent(
      new CustomEvent("ironvault:log", { detail: { exerciseId: exercise.id } }),
    );
  };

  return (
    <div className="anim-fade-up space-y-5 pb-6">
      {/* Top bar */}
      <div className="flex items-center justify-between pt-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-full border py-2 pe-4 ps-3 text-xs font-bold transition-colors"
          style={{ borderColor: "var(--color-card-border)", background: "var(--color-card)", color: "var(--color-text-muted)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => setEditExercise(true)}
            aria-label="Edit exercise"
            className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
            style={{ borderColor: "var(--color-card-border)", background: "var(--color-card)", color: "var(--color-text-muted)" }}
          >
            <Pencil className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => setConfirmDeleteExercise(true)}
            aria-label="Delete exercise"
            className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
            style={{ borderColor: "var(--color-accent)", background: "var(--color-accent-soft)", color: "var(--color-accent-text)" }}
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border" style={{ borderColor: "var(--color-card-border)", background: "var(--color-card)" }}>
        {exercise.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="h-52 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <div
            className="h-40 w-full"
            style={{
              background: `radial-gradient(600px 200px at 80% 0%, ${col.hex}22, transparent), linear-gradient(160deg, var(--color-bg), var(--color-card-border))`,
            }}
          >
            <Icon
              className="absolute end-4 top-4 h-28 w-28 opacity-15"
              style={{ color: col.hex }}
            />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black"
            style={{ background: col.soft, color: col.hex, border: `1px solid ${col.hex}44` }}
          >
            <Icon className="h-3.5 w-3.5" />
            {exercise.categoryName}
          </span>
          <h1 className="mt-2 text-2xl font-black text-white drop-shadow">{exercise.name}</h1>
          {exercise.nameEn && (
            <p className="text-sm font-bold text-white/70" dir="ltr" style={{ textAlign: "end" }}>
              {exercise.nameEn}
            </p>
          )}
        </div>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="clean-card p-3.5 text-center">
          <Trophy className="mx-auto h-4.5 w-4.5" style={{ color: "var(--color-accent)" }} />
          <p className="tabular mt-1.5 text-xl font-black" style={{ color: "var(--color-accent)" }}>
            {stats.maxWeight !== null ? formatWeight(stats.maxWeight) : "—"}
          </p>
          <p className="text-[10px] font-bold" style={{ color: "var(--color-text-faint)" }}>Current PR (kg)</p>
        </div>
        <div className="clean-card p-3.5 text-center">
          <Medal className="mx-auto h-4.5 w-4.5 text-amber-500" />
          <p className="tabular mt-1.5 text-xl font-black" style={{ color: "var(--color-text)" }}>
            {formatCount(stats.prCount)}
          </p>
          <p className="text-[10px] font-bold" style={{ color: "var(--color-text-faint)" }}>Times Broken</p>
        </div>
        <div className="clean-card p-3.5 text-center">
          <TrendingUp className="mx-auto h-4.5 w-4.5 text-teal-600" />
          <p className="tabular mt-1.5 text-xl font-black" style={{ color: "var(--color-text)" }}>
            {formatCount(stats.entryCount)}
          </p>
          <p className="text-[10px] font-bold" style={{ color: "var(--color-text-faint)" }}>Total Entries</p>
        </div>
      </div>

      {/* Log CTA */}
      <button
        onClick={openLogSheet}
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: "var(--color-accent)" }}
      >
        <Zap className="h-5 w-5" />
        Log a new PR for this exercise
      </button>

      {/* Progress chart */}
      <section className="clean-card rounded-3xl p-4">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-sm font-black" style={{ color: "var(--color-text)" }}>Progress Chart</h2>
        </div>
        {chartPoints.length > 0 ? (
          <ProgressChart points={chartPoints} />
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Dumbbell className="h-7 w-7" style={{ color: "var(--color-text-faint)" }} />
            <p className="text-sm font-bold" style={{ color: "var(--color-text-muted)" }}>No data yet</p>
            <p className="max-w-56 text-xs" style={{ color: "var(--color-text-faint)" }}>
              Log your first PR and your progress chart will appear here instantly.
            </p>
          </div>
        )}
      </section>

      {/* Timeline */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black" style={{ color: "var(--color-text)" }}>History Timeline</h2>
          {stats.lastDate && (
            <span className="text-[11px] font-bold" style={{ color: "var(--color-text-faint)" }}>
              Last trained: {sinceLabelEn(stats.lastDate)}
            </span>
          )}
        </div>

        {timeline.map((e) => (
          <div
            key={e.id}
            className="clean-card rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl"
                style={{ background: "var(--color-hover)" }}
              >
                <span className="tabular text-sm font-black leading-none" style={{ color: "var(--color-text)" }}>
                  {formatWeight(e.weightKg)}
                </span>
                <span className="mt-0.5 text-[8px] font-bold" style={{ color: "var(--color-text-faint)" }}>kg</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-1.5 text-sm font-black" style={{ color: "var(--color-text)" }}>
                  {formatDateEn(e.performedAt)}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-semibold" style={{ color: "var(--color-text-muted)" }}>
                  <span className="flex items-center gap-1">
                    <Repeat className="h-3 w-3" />
                    {formatCount(e.reps)} reps
                  </span>
                  {e.note && (
                    <span className="flex items-center gap-1 truncate">
                      <StickyNote className="h-3 w-3 shrink-0" />
                      <span className="truncate">{e.note}</span>
                    </span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() =>
                    setEditEntry({
                      id: e.id,
                      weightKg: e.weightKg,
                      reps: e.reps,
                      note: e.note,
                      performedAt: e.performedAt,
                    })
                  }
                  aria-label="Edit entry"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
                  style={{ borderColor: "var(--color-card-border)", background: "var(--color-card)", color: "var(--color-text-muted)" }}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setConfirmDeleteEntryId(e.id)}
                  aria-label="Delete entry"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
                  style={{ borderColor: "var(--color-accent)", background: "var(--color-accent-soft)", color: "var(--color-accent-text)" }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {timeline.length === 0 && (
          <p className="rounded-2xl border border-dashed py-8 text-center text-xs font-bold" style={{ borderColor: "var(--color-card-border)", color: "var(--color-text-faint)" }}>
            Timeline is empty — your first PR writes your history here.
          </p>
        )}
      </section>

      {/* Delete entry confirm */}
      {confirmDeleteEntryId && (
        <ConfirmBar
          message="Permanently delete this entry? This cannot be undone."
          busy={busy}
          onCancel={() => setConfirmDeleteEntryId(null)}
          onConfirm={() => void deleteEntry(confirmDeleteEntryId)}
        />
      )}

      {/* Delete exercise confirm */}
      {confirmDeleteExercise && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8">
          <button
            aria-label="Close"
            className="anim-overlay-in absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmDeleteExercise(false)}
          />
          <div className="anim-sheet-up relative w-full max-w-sm rounded-3xl border p-6 text-center" style={{ borderColor: "var(--color-accent)", background: "var(--color-card)" }}>
            <Trash2 className="mx-auto h-8 w-8" style={{ color: "var(--color-accent)" }} />
            <h3 className="mt-3 text-lg font-black" style={{ color: "var(--color-text)" }}>Delete exercise entirely?</h3>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              &ldquo;{exercise.name}&rdquo; and all its {formatCount(stats.entryCount)} entries will be permanently deleted.
              This cannot be undone.
            </p>
            {error && <p className="mt-3 text-sm font-bold" style={{ color: "var(--color-accent)" }}>{error}</p>}
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => void deleteExercise()}
                disabled={busy}
                className="flex-1 rounded-xl py-3 text-sm font-black text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{ background: "var(--color-accent)" }}
              >
                {busy ? "Deleting..." : "Yes, delete permanently"}
              </button>
              <GhostButton onClick={() => setConfirmDeleteExercise(false)}>Cancel</GhostButton>
            </div>
          </div>
        </div>
      )}

      <EntrySheet entry={editEntry} onClose={() => setEditEntry(null)} />

      <ExerciseSheet
        open={editExercise}
        onClose={() => setEditExercise(false)}
        categories={categories}
        exercise={{
          id: exercise.id,
          name: exercise.name,
          nameEn: exercise.nameEn,
          categoryId: exercise.categoryId,
          imageUrl: exercise.imageUrl,
        }}
      />
    </div>
  );
}

function ConfirmBar({
  message,
  busy,
  onCancel,
  onConfirm,
}: {
  message: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="anim-pop fixed inset-x-0 bottom-24 z-50 mx-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border p-4 shadow-2xl" style={{ borderColor: "var(--color-accent)", background: "var(--color-card)" }}>
      <p className="text-center text-sm font-bold" style={{ color: "var(--color-text)" }}>{message}</p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={onConfirm}
          disabled={busy}
          className="flex-1 rounded-xl py-2.5 text-xs font-black text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          style={{ background: "var(--color-accent)" }}
        >
          {busy ? "Deleting..." : "Confirm delete"}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl border py-2.5 text-xs font-bold"
          style={{ borderColor: "var(--color-card-border)", background: "var(--color-card)", color: "var(--color-text-muted)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
