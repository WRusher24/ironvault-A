"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
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
  formatDateAr,
  formatWeight,
  sinceLabelAr,
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
      setError(err instanceof ApiError ? err.message : "تعذر الحذف");
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
      setError(err instanceof ApiError ? err.message : "تعذر حذف السجل");
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
          className="flex items-center gap-1.5 rounded-full border border-iron-600 bg-iron-850/70 py-2 pe-4 ps-3 text-xs font-bold text-slate-300 transition-colors hover:text-white"
        >
          <ArrowRight className="h-4 w-4" />
          لوحة التحكم
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => setEditExercise(true)}
            aria-label="تعديل التمرين"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-iron-600 bg-iron-850/70 text-slate-300 transition-colors hover:text-white"
          >
            <Pencil className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => setConfirmDeleteExercise(true)}
            aria-label="حذف التمرين"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-300 transition-colors hover:bg-rose-500/20"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-iron-600">
        {exercise.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="h-52 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-iron-950 via-iron-950/40 to-transparent" />
          </>
        ) : (
          <div
            className="h-40 w-full"
            style={{
              background: `radial-gradient(600px 200px at 80% 0%, ${col.hex}33, transparent), linear-gradient(160deg, #16223c, #0f172a)`,
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
            style={{ background: col.soft, color: col.hex, border: `1px solid ${col.hex}55` }}
          >
            <Icon className="h-3.5 w-3.5" />
            {exercise.categoryName}
          </span>
          <h1 className="mt-2 text-2xl font-black text-white drop-shadow">{exercise.name}</h1>
          {exercise.nameEn && (
            <p className="text-sm font-bold text-slate-400" dir="ltr" style={{ textAlign: "end" }}>
              {exercise.nameEn}
            </p>
          )}
        </div>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="glass-card rounded-2xl p-3.5 text-center">
          <Trophy className="mx-auto h-4.5 w-4.5 text-volt-400" />
          <p className="tabular mt-1.5 text-xl font-black text-volt-400">
            {stats.maxWeight !== null ? formatWeight(stats.maxWeight) : "—"}
          </p>
          <p className="text-[10px] font-bold text-slate-500">الرقم القياسي الحالي (كجم)</p>
        </div>
        <div className="glass-card rounded-2xl p-3.5 text-center">
          <Medal className="mx-auto h-4.5 w-4.5 text-amber-400" />
          <p className="tabular mt-1.5 text-xl font-black text-white">
            {formatCount(stats.prCount)}
          </p>
          <p className="text-[10px] font-bold text-slate-500">مرات تحطيم الرقم</p>
        </div>
        <div className="glass-card rounded-2xl p-3.5 text-center">
          <TrendingUp className="mx-auto h-4.5 w-4.5 text-ice-300" />
          <p className="tabular mt-1.5 text-xl font-black text-white">
            {formatCount(stats.entryCount)}
          </p>
          <p className="text-[10px] font-bold text-slate-500">إجمالي السجلات</p>
        </div>
      </div>

      {/* Log CTA */}
      <button
        onClick={openLogSheet}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-volt-500 to-volt-600 py-4 text-sm font-black text-iron-950 shadow-[0_10px_35px_-10px_rgba(34,197,94,0.6)] transition-all hover:brightness-110 active:scale-[0.98]"
      >
        <Zap className="h-5 w-5" />
        سجّل رقمًا جديدًا لهذا التمرين
      </button>

      {/* Progress chart */}
      <section className="glass-card rounded-3xl p-4">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-white">منحنى التقدم</h2>
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-volt-500" /> رقم قياسي PR
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-ice-400" /> سجل عادي
            </span>
          </div>
        </div>
        {chartPoints.length > 0 ? (
          <ProgressChart points={chartPoints} />
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Dumbbell className="h-7 w-7 text-slate-600" />
            <p className="text-sm font-bold text-slate-400">لا توجد بيانات بعد</p>
            <p className="max-w-56 text-xs text-slate-500">
              سجّل أول رقم لك وسيظهر منحنى تقدمك هنا فورًا.
            </p>
          </div>
        )}
      </section>

      {/* Timeline */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-white">السجل الزمني</h2>
          {stats.lastDate && (
            <span className="text-[11px] font-bold text-slate-500">
              آخر تدريب: {sinceLabelAr(stats.lastDate)}
            </span>
          )}
        </div>

        {timeline.map((e) => (
          <div
            key={e.id}
            className={`glass-card rounded-2xl p-4 ${e.isPr ? "border-volt-500/40" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl ${
                  e.isPr ? "bg-volt-500/15" : "bg-iron-800"
                }`}
              >
                <span className={`tabular text-sm font-black leading-none ${e.isPr ? "text-volt-400" : "text-white"}`}>
                  {formatWeight(e.weightKg)}
                </span>
                <span className="mt-0.5 text-[8px] font-bold text-slate-500">كجم</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-1.5 text-sm font-black text-white">
                  {formatDateAr(e.performedAt)}
                  {e.isPr && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-volt-500/15 px-2 py-0.5 text-[10px] font-black text-volt-400">
                      <Trophy className="h-3 w-3" />
                      PR
                    </span>
                  )}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Repeat className="h-3 w-3" />
                    {formatCount(e.reps)} تكرار
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
                  aria-label="تعديل السجل"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-iron-600 bg-iron-800 text-slate-400 transition-colors hover:text-white"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setConfirmDeleteEntryId(e.id)}
                  aria-label="حذف السجل"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300/80 transition-colors hover:text-rose-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {timeline.length === 0 && (
          <p className="rounded-2xl border border-dashed border-iron-600 py-8 text-center text-xs font-bold text-slate-500">
            السجل فارغ — أول رقم يكتب تاريخك هنا.
          </p>
        )}
      </section>

      {/* Delete entry confirm */}
      {confirmDeleteEntryId && (
        <ConfirmBar
          message="حذف هذا السجل نهائيًا؟ لا يمكن التراجع."
          busy={busy}
          onCancel={() => setConfirmDeleteEntryId(null)}
          onConfirm={() => void deleteEntry(confirmDeleteEntryId)}
        />
      )}

      {/* Delete exercise confirm */}
      {confirmDeleteExercise && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8">
          <button
            aria-label="إغلاق"
            className="anim-overlay-in absolute inset-0 bg-iron-950/75 backdrop-blur-sm"
            onClick={() => setConfirmDeleteExercise(false)}
          />
          <div className="anim-sheet-up relative w-full max-w-sm rounded-3xl border border-rose-500/40 bg-iron-850 p-6 text-center">
            <Trash2 className="mx-auto h-8 w-8 text-rose-400" />
            <h3 className="mt-3 text-lg font-black text-white">حذف التمرين بالكامل؟</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
              سيتم حذف «{exercise.name}» مع كل سجلاته ({formatCount(stats.entryCount)}) نهائيًا.
              لا يمكن التراجع عن هذا الإجراء.
            </p>
            {error && <p className="mt-3 text-sm font-bold text-rose-300">{error}</p>}
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => void deleteExercise()}
                disabled={busy}
                className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-black text-white transition-all hover:bg-rose-400 active:scale-[0.98] disabled:opacity-50"
              >
                {busy ? "جارٍ الحذف..." : "نعم، احذف نهائيًا"}
              </button>
              <GhostButton onClick={() => setConfirmDeleteExercise(false)}>إلغاء</GhostButton>
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
    <div className="anim-pop fixed inset-x-0 bottom-24 z-50 mx-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-rose-500/40 bg-iron-850 p-4 shadow-2xl">
      <p className="text-center text-sm font-bold text-white">{message}</p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={onConfirm}
          disabled={busy}
          className="flex-1 rounded-xl bg-rose-500 py-2.5 text-xs font-black text-white transition-all hover:bg-rose-400 active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? "جارٍ الحذف..." : "تأكيد الحذف"}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl border border-iron-600 bg-iron-800 py-2.5 text-xs font-bold text-slate-300"
        >
          تراجع
        </button>
      </div>
    </div>
  );
}
