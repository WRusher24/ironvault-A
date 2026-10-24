import Link from "next/link";
import { Dumbbell, LayoutGrid } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="coral-glow mb-6 flex h-20 w-20 items-center justify-center rounded-3xl" style={{ background: "var(--color-accent)" }}>
        <Dumbbell className="h-10 w-10 text-white" strokeWidth={2.4} />
      </div>
      <p className="tabular text-6xl font-black" style={{ color: "var(--color-accent)" }}>404</p>
      <h1 className="mt-2 text-xl font-black" style={{ color: "var(--color-text)" }}>Page not found</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        Looks like you lifted too heavy — the page you&apos;re looking for is outside the vault.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-white transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: "var(--color-accent)" }}
      >
        <LayoutGrid className="h-4.5 w-4.5" />
        Back to dashboard
      </Link>
    </main>
  );
}
