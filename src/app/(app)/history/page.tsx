import type { Metadata } from "next";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, exercises, prEntries } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import HistoryList from "@/components/history-list";

export const metadata: Metadata = { title: "Full History" };
export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = (await getCurrentUser())!;

  const rows = await db
    .select({
      entry: prEntries,
      exerciseName: exercises.name,
      exerciseImage: exercises.imageUrl,
      categoryId: categories.id,
      categoryName: categories.name,
    })
    .from(prEntries)
    .innerJoin(exercises, eq(prEntries.exerciseId, exercises.id))
    .innerJoin(categories, eq(exercises.categoryId, categories.id))
    .where(eq(prEntries.userId, user.id))
    .orderBy(desc(prEntries.performedAt), desc(prEntries.createdAt))
    .limit(400);

  const cats = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.userId, user.id));

  return (
    <main className="px-4 pt-6">
      <header className="anim-fade-up mb-5">
        <h1 className="text-2xl font-black" style={{ color: "var(--color-text)" }}>Full History</h1>
        <p className="mt-1 text-xs font-semibold" style={{ color: "var(--color-text-faint)" }}>
          Every rep you&apos;ve lifted, documented chronologically — newest first.
        </p>
      </header>
      <HistoryList
        entries={rows.map((r) => ({
          id: r.entry.id,
          exerciseId: r.entry.exerciseId,
          exerciseName: r.exerciseName,
          exerciseImage: r.exerciseImage,
          categoryId: r.categoryId,
          categoryName: r.categoryName,
          weightKg: r.entry.weightKg,
          reps: r.entry.reps,
          note: r.entry.note,
          performedAt: r.entry.performedAt,
          isPr: r.entry.isPr,
        }))}
        categories={cats}
      />
    </main>
  );
}
