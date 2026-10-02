import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { prEntries } from "@/db/schema";

/**
 * Recompute the `isPr` flag for every entry of an exercise.
 * An entry is a PR when its weight is strictly greater than every entry
 * logged before it (chronological by performedAt, then createdAt).
 * The very first entry is always a PR — it establishes the record.
 */
export async function recomputePrs(exerciseId: string): Promise<void> {
  const rows = await db
    .select({
      id: prEntries.id,
      weightKg: prEntries.weightKg,
      isPr: prEntries.isPr,
    })
    .from(prEntries)
    .where(eq(prEntries.exerciseId, exerciseId))
    .orderBy(asc(prEntries.performedAt), asc(prEntries.createdAt));

  let maxSoFar = -Infinity;
  const updates: { id: string; isPr: boolean }[] = [];
  for (const row of rows) {
    const isPr = row.weightKg > maxSoFar;
    if (row.weightKg > maxSoFar) maxSoFar = row.weightKg;
    if (row.isPr !== isPr) updates.push({ id: row.id, isPr });
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
