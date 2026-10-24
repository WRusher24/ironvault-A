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
      setError("Enter a valid weight in kilograms");
      return;
    }
    if (!Number.isFinite(repsNum) || repsNum < 1) {
      setError("Enter the number of reps");
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
      setError(err instanceof ApiError ? err.message : "Save failed — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={entry !== null} onClose={onClose} title="Edit Entry">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Weight (kg)</FieldLabel>
            <Stepper value={weight} onChange={setWeight} step={2.5} min={0.5} max={2000} suffix="kg" />
          </div>
          <div>
            <FieldLabel>Reps</FieldLabel>
            <Stepper value={reps} onChange={setReps} step={1} min={1} max={500} suffix="reps" inputMode="numeric" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel>Date</FieldLabel>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
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
            <FieldLabel>Note</FieldLabel>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              placeholder="Grip, setup, feel..."
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
          {loading && <LoaderCircle className="h-4.5 w-4.5 animate-spin" />}
          {loading ? "Saving..." : "Save changes"}
        </PrimaryButton>
        <p className="text-center text-[11px] font-semibold" style={{ color: "var(--color-text-faint)" }}>
          PR badges are automatically recalculated after any edit.
        </p>
      </form>
    </Sheet>
  );
}
