import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, exercises, prEntries } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import ExerciseDetail from "@/components/exercise-detail";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ExercisePage({ params }: Props) {
  const user = (await getCurrentUser())!;
  const { id } = await params;

  // Strict data isolation: ownership enforced in the WHERE clause.
  const rows = await db
    .select({
      exercise: exercises,
      categoryName: categories.name,
      categoryNameEn: categories.nameEn,
      categoryColor: categories.color,
      categoryIcon: categories.icon,
    })
    .from(exercises)
    .innerJoin(categories, eq(exercises.categoryId, categories.id))
    .where(and(eq(exercises.id, id), eq(exercises.userId, user.id)))
    .limit(1);
  const row = rows[0];
  if (!row) notFound();

  const entries = await db
    .select()
    .from(prEntries)
    .where(and(eq(prEntries.exerciseId, id), eq(prEntries.userId, user.id)))
    .orderBy(asc(prEntries.performedAt), asc(prEntries.createdAt));

  const cats = await db
    .select({ id: categories.id, name: categories.name, icon: categories.icon, color: categories.color })
    .from(categories)
    .where(eq(categories.userId, user.id))
    .orderBy(asc(categories.sortOrder));

  const maxWeight = entries.reduce((m, e) => Math.max(m, e.weightKg), 0);

  return (
    <main className="px-4 pt-5">
      <ExerciseDetail
        exercise={{
          id: row.exercise.id,
          name: row.exercise.name,
          nameEn: row.exercise.nameEn,
          imageUrl: row.exercise.imageUrl,
          categoryId: row.exercise.categoryId,
          categoryName: row.categoryName,
          categoryNameEn: row.categoryNameEn,
          categoryColor: row.categoryColor,
          categoryIcon: row.categoryIcon,
        }}
        entries={entries.map((e) => ({
          id: e.id,
          weightKg: e.weightKg,
          reps: e.reps,
          note: e.note,
          performedAt: e.performedAt,
          isPr: e.isPr,
        }))}
        stats={{
          maxWeight: entries.length ? maxWeight : null,
          prCount: entries.filter((e) => e.isPr).length,
          entryCount: entries.length,
          lastDate: entries.length ? entries[entries.length - 1].performedAt : null,
        }}
        categories={cats}
      />
    </main>
  );
}
