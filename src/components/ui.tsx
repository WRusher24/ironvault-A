"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Shared mobile-first UI primitives.
 * Uses CSS custom properties for theme-aware colors.
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
        aria-label="Close"
        onClick={onClose}
        className="anim-overlay-in absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div className="anim-sheet-up absolute inset-x-0 bottom-0 mx-auto flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-[2rem] border shadow-2xl" style={{ background: "var(--color-card)", borderColor: "var(--color-card-border)" }}>
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--color-card-border)" }}>
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-10 rounded-full" style={{ background: "var(--color-accent)" }} />
            <h3 className="text-base font-extrabold" style={{ color: "var(--color-text)" }}>{title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sheet"
            className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
            style={{ borderColor: "var(--color-card-border)", color: "var(--color-text-muted)" }}
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
      className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      style={{ background: "var(--color-accent)" }}
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
      className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50"
      style={
        danger
          ? { borderColor: "var(--color-accent)", background: "var(--color-accent-soft)", color: "var(--color-accent-text)" }
          : { borderColor: "var(--color-card-border)", background: "var(--color-card)", color: "var(--color-text-muted)" }
      }
    >
      {children}
    </button>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>{children}</span>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${props.className ?? ""}`}
      style={{
        borderColor: "var(--color-card-border)",
        background: "var(--color-input-bg)",
        color: "var(--color-text)",
        // @ts-expect-error CSS custom property
        "--tw-ring-color": "var(--color-accent)",
        ...(props.style ?? {}),
      }}
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
    <div className="flex items-stretch overflow-hidden rounded-xl border focus-within:ring-2" style={{ borderColor: "var(--color-card-border)", background: "var(--color-input-bg)", "--tw-ring-color": "var(--color-accent)" } as React.CSSProperties}>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => apply(step)}
        className="w-12 shrink-0 text-xl font-black transition-colors"
        style={{ background: "var(--color-hover)", color: "var(--color-accent)" }}
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
          className="tabular w-full bg-transparent py-3 text-center text-lg font-black focus:outline-none"
          style={{ color: "var(--color-text)" }}
          placeholder="0"
        />
        <span className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] font-bold" style={{ color: "var(--color-text-faint)" }}>
          {suffix}
        </span>
      </div>
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => apply(-step)}
        className="w-12 shrink-0 text-xl font-black transition-colors"
        style={{ background: "var(--color-hover)", color: "var(--color-text-muted)" }}
      >
        −
      </button>
    </div>
  );
}
