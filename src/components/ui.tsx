"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Shared mobile-first UI primitives.
 */

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  // Lock body scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button
        aria-label="إغلاق"
        onClick={onClose}
        className="anim-overlay-in absolute inset-0 bg-iron-950/75 backdrop-blur-sm"
      />
      <div className="anim-sheet-up absolute inset-x-0 bottom-0 mx-auto flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-[2rem] border border-iron-600 border-b-0 bg-iron-850 shadow-2xl">
        <div className="flex items-center justify-between border-b border-iron-700 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-10 rounded-full bg-volt-500/70" />
            <h3 className="text-base font-extrabold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-iron-600 bg-iron-800 text-slate-400 transition-colors hover:text-white"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="no-scrollbar safe-bottom overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  loading,
  disabled,
  type = "submit",
  onClick,
}: {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-volt-500 to-volt-600 py-3.5 text-sm font-black text-iron-950 transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  danger,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 ${
        danger
          ? "border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
          : "border-iron-600 bg-iron-800 text-slate-300 hover:border-iron-600 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs font-bold text-slate-300">{children}</span>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-iron-600 bg-iron-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-volt-500 focus:outline-none focus:ring-2 focus:ring-volt-500/25 ${props.className ?? ""}`}
    />
  );
}

/** Numeric stepper for weights/reps — thumb-friendly between heavy sets. */
export function Stepper({
  value,
  onChange,
  step,
  min,
  max,
  suffix,
  inputMode = "decimal",
}: {
  value: string;
  onChange: (v: string) => void;
  step: number;
  min: number;
  max?: number;
  suffix: string;
  inputMode?: "decimal" | "numeric";
}) {
  const n = parseFloat(value);
  const apply = (delta: number) => {
    const base = Number.isFinite(n) ? n : 0;
    let next = Math.round((base + delta) * 100) / 100;
    if (next < min) next = min;
    if (max !== undefined && next > max) next = max;
    onChange(next.toString());
  };
  return (
    <div className="flex items-stretch overflow-hidden rounded-xl border border-iron-600 bg-iron-800 focus-within:border-volt-500 focus-within:ring-2 focus-within:ring-volt-500/25">
      <button
        type="button"
        aria-label="زيادة"
        onClick={() => apply(step)}
        className="w-12 shrink-0 bg-iron-700/60 text-xl font-black text-volt-400 transition-colors hover:bg-iron-700 active:bg-volt-500 active:text-iron-950"
      >
        +
      </button>
      <div className="relative flex-1">
        <input
          value={value}
          inputMode={inputMode}
          onChange={(e) => {
            const v = e.target.value.replace(/[^\d.]/g, "");
            onChange(v);
          }}
          className="tabular w-full bg-transparent py-3 text-center text-lg font-black text-white focus:outline-none"
          placeholder="0"
        />
        <span className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500">
          {suffix}
        </span>
      </div>
      <button
        type="button"
        aria-label="إنقاص"
        onClick={() => apply(-step)}
        className="w-12 shrink-0 bg-iron-700/60 text-xl font-black text-slate-300 transition-colors hover:bg-iron-700 active:bg-rose-500/70 active:text-white"
      >
        −
      </button>
    </div>
  );
}
