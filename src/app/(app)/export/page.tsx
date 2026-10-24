import type { Metadata } from "next";
import { eq, sql } from "drizzle-orm";
import {
  Download,
  FileSpreadsheet,
  ShieldCheck,
  Table2,
} from "lucide-react";
import { db } from "@/db";
import { exercises, prEntries } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { formatCount } from "@/lib/format";

export const metadata: Metadata = { title: "Export Data" };
export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const user = (await getCurrentUser())!;

  const [stats] = await db
    .select({
      entries: sql<number>`count(*)::int`,
      prs: sql<number>`count(*) filter (where ${prEntries.isPr})::int`,
    })
    .from(prEntries)
    .where(eq(prEntries.userId, user.id));

  const [exCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(exercises)
    .where(eq(exercises.userId, user.id));

  return (
    <main className="stagger space-y-5 px-4 pt-6">
      <header>
        <h1 className="text-2xl font-black" style={{ color: "var(--color-text)" }}>Export Your Data</h1>
        <p className="mt-1 text-xs font-semibold" style={{ color: "var(--color-text-faint)" }}>
          Your data is yours — download it as a CSV whenever you want.
        </p>
      </header>

      <div className="clean-card relative overflow-hidden rounded-3xl p-6">
        <div className="absolute -end-10 -top-10 h-40 w-40 rounded-full blur-3xl" style={{ background: "var(--color-accent-soft)" }} />
        <div className="flex items-center gap-4">
          <div className="coral-glow flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl" style={{ background: "var(--color-accent)" }}>
            <FileSpreadsheet className="h-8 w-8 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-lg font-black" style={{ color: "var(--color-text)" }}>Full CSV File</h2>
            <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              Includes all your exercises and entries: date, category, exercise, weight, reps,
              notes, and PR markers.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5 border-t pt-5 text-center" style={{ borderColor: "var(--color-card-border)" }}>
          <div>
            <p className="tabular text-xl font-black" style={{ color: "var(--color-text)" }}>{formatCount(stats?.entries ?? 0)}</p>
            <p className="text-[10px] font-bold" style={{ color: "var(--color-text-faint)" }}>Training entries</p>
          </div>
          <div>
            <p className="tabular text-xl font-black" style={{ color: "var(--color-accent)" }}>{formatCount(stats?.prs ?? 0)}</p>
            <p className="text-[10px] font-bold" style={{ color: "var(--color-text-faint)" }}>PRs</p>
          </div>
          <div>
            <p className="tabular text-xl font-black text-teal-600">{formatCount(exCount?.count ?? 0)}</p>
            <p className="text-[10px] font-bold" style={{ color: "var(--color-text-faint)" }}>Exercises</p>
          </div>
        </div>

        <a
          href="/api/export"
          download
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: "var(--color-accent)" }}
        >
          <Download className="h-5 w-5" />
          Download CSV now
        </a>
      </div>

      <div className="clean-card space-y-3 rounded-3xl p-5">
        <h3 className="flex items-center gap-2 text-sm font-black" style={{ color: "var(--color-text)" }}>
          <Table2 className="h-4.5 w-4.5 text-teal-600" />
          What&apos;s inside the file?
        </h3>
        <ul className="space-y-2 text-xs font-semibold leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          <li className="flex gap-2">
            <span style={{ color: "var(--color-accent)" }}>•</span>
            Bilingual columns (English/Arabic) arranged chronologically per exercise.
          </li>
          <li className="flex gap-2">
            <span style={{ color: "var(--color-accent)" }}>•</span>
            Weights in kilograms exactly as you logged them — no conversion.
          </li>
          <li className="flex gap-2">
            <span style={{ color: "var(--color-accent)" }}>•</span>
            A &ldquo;PR&rdquo; column marking every entry that broke a personal record.
          </li>
          <li className="flex gap-2">
            <span style={{ color: "var(--color-accent)" }}>•</span>
            Opens directly in Excel and Google Sheets with full UTF-8 support.
          </li>
        </ul>
      </div>

      <div className="flex items-start gap-3 rounded-3xl border p-5" style={{ borderColor: "var(--color-card-border)", background: "var(--color-card)" }}>
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-accent)" }} />
        <p className="text-xs font-semibold leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          Export happens on a secure server after verifying your identity — no other user can
          access or download your data.
        </p>
      </div>
    </main>
  );
}
