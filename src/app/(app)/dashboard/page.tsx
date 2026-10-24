import type { Metadata } from "next";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, exercises, prEntries } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import SearchAndGrid, {
  type DashboardCategory,
} from "@/components/search-and-grid";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = (await getCurrentUser())!; // guaranteed by (app) layout

  const cats = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, user.id))
    .orderBy(asc(categories.sortOrder), asc(categories.createdAt));

  const exRows = await db
    .select({
      exercise: exercises,
      maxWeight: sql<number | null>`max(${prEntries.weightKg})`,
      entryCount: sql<number>`count(${prEntries.id})::int`,
      prCount: sql<number>`count(*) filter (where ${prEntries.isPr})::int`,
      lastDate: sql<string | null>`max(${prEntries.performedAt})`,
    })
    .from(exercises)
    .leftJoin(prEntries, eq(prEntries.exerciseId, exercises.id))
    .where(eq(exercises.userId, user.id))
    .groupBy(exercises.id)
    .orderBy(asc(exercises.createdAt));

  const catNameById = new Map(cats.map((c) => [c.id, c.name]));

  const dashCategories: DashboardCategory[] = cats.map((c) => ({
    id: c.id,
    name: c.name,
    nameEn: c.nameEn,
    icon: c.icon,
    color: c.color,
    exercises: exRows
      .filter((r) => r.exercise.categoryId === c.id)
      .map((r) => ({
        id: r.exercise.id,
        name: r.exercise.name,
        nameEn: r.exercise.nameEn,
        imageUrl: r.exercise.imageUrl,
        categoryId: r.exercise.categoryId,
        categoryName: catNameById.get(r.exercise.categoryId) ?? "",
        maxWeight: r.maxWeight,
        entryCount: r.entryCount,
        prCount: r.prCount,
        lastDate: r.lastDate,
      })),
  }));

  return (
    <main className="px-4 pt-6">
      <SearchAndGrid categories={dashCategories} />
    </main>
  );
}
