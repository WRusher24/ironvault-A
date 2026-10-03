import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { prEntries } from "@/db/schema";

/**
 * Recompute the `isPr` flag for every entry of an exercise.
 *
 * TRUE PR semantics: a Personal Record is exclusively the ABSOLUTE HIGHEST
 * weight ever recorded for the exercise. An entry is flagged only when its
 * weight equals the all-time maximum — every entry below that ceiling
 * (including past ascending records) is NOT a PR. Matching your own record
 * (tying the max) still counts as a PR.
 */
export async function recomputePrs(exerciseId: string): Promise<void> {
  const rows = await db
    .select({
      id: prEntries.id,
      weightKg: prEntries.weightKg,
      isPr: prEntries.isPr,
    })
    .from(prEntries)
    .where(eq(prEntries.exerciseId, exerciseId));

  if (rows.length === 0) return;

  const allTimeMax = rows.reduce((m, r) => Math.max(m, r.weightKg), -Infinity);

  const updates: { id: string; isPr: boolean }[] = [];
  for (const row of rows) {
    const shouldBePr = row.weightKg === allTimeMax;
    if (row.isPr !== shouldBePr) updates.push({ id: row.id, isPr: shouldBePr });
  }
  for (const u of updates) {
    await db
      .update(prEntries)
      .set({ isPr: u.isPr })
      .where(eq(prEntries.id, u.id));
  }
}

/** Current all-time max weight for an exercise. */
export async function currentMax(exerciseId: string): Promise<number | null> {
  const rows = await db
    .select({ max: sql<number | null>`max(${prEntries.weightKg})` })
    .from(prEntries)
    .where(eq(prEntries.exerciseId, exerciseId));
  return rows[0]?.max ?? null;
}
