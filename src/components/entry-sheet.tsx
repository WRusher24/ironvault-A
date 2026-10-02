"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { api, ApiError } from "@/lib/http";
import { Sheet, PrimaryButton, FieldLabel, Stepper } from "@/components/ui";

export interface EntryEditable {
  id: string;
  weightKg: number;
  reps: number;
  note: string | null;
  performedAt: string;
}

interface Props {
  entry: EntryEditable | null;
  onClose: () => void;
}

/** Edit a past history entry (weight / reps / note / date). */
export default function EntrySheet({ entry, onClose }: Props) {
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("1");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entry) {
      setWeight(entry.weightKg.toString());
      setReps(entry.reps.toString());
      setNote(entry.note ?? "");
      setDate(entry.performedAt);
      setError(null);
    }
  }, [entry]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entry) return;
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps, 10);
    if (!Number.isFinite(weightNum) || weightNum <= 0) {
      setError("أدخل وزنًا صحيحًا بالكيلوغرام");
      return;
    }
    if (!Number.isFinite(repsNum) || repsNum < 1) {
      setError("أدخل عدد التكرارات");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api(`/api/entries/${entry.id}`, {
        method: "PATCH",
        json: {
          weightKg: weightNum,
          reps: repsNum,
          note: note.trim() || null,
          performedAt: date,
        },
      });
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذر الحفظ — حاول مجددًا");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={entry !== null} onClose={onClose} title="تعديل السجل">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>الوزن (كجم)</FieldLabel>
            <Stepper value={weight} onChange={setWeight} step={2.5} min={0.5} max={2000} suffix="كجم kg" />
          </div>
          <div>
            <FieldLabel>التكرارات</FieldLabel>
            <Stepper value={reps} onChange={setReps} step={1} min={1} max={500} suffix="تكرار" inputMode="numeric" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel>التاريخ</FieldLabel>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl border border-iron-600 bg-iron-800 px-4 py-3 text-sm text-white focus:border-volt-500 focus:outline-none focus:ring-2 focus:ring-volt-500/25"
            />
          </div>
          <div>
            <FieldLabel>ملاحظة</FieldLabel>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              placeholder="قبضة، إعداد، إحساس…"
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
          {loading && <LoaderCircle className="h-4.5 w-4.5 animate-spin" />}
          {loading ? "جارٍ الحفظ..." : "حفظ التعديلات"}
        </PrimaryButton>
        <p className="text-center text-[11px] font-semibold text-slate-500">
          يُعاد احتساب شارات PR تلقائيًا بعد أي تعديل.
        </p>
      </form>
    </Sheet>
  );
}
