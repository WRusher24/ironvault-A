import type { Metadata } from "next";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, exercises, prEntries } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import {
  motivationalLine,
  todayIso,
  weeklyStreak,
} from "@/lib/format";
import StatsHeader from "@/components/stats-header";
import SearchAndGrid, {
  type DashboardCategory,
} from "@/components/search-and-grid";

export const metadata: Metadata = { title: "لوحة التحكم" };
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

  // Global stats
  const [totals] = await db
    .select({
      totalEntries: sql<number>`count(*)::int`,
      totalPrs: sql<number>`count(*) filter (where ${prEntries.isPr})::int`,
    })
    .from(prEntries)
    .where(eq(prEntries.userId, user.id));

  const [lastPr] = await db
    .select({ date: prEntries.performedAt })
    .from(prEntries)
    .where(eq(prEntries.userId, user.id))
    .orderBy(desc(prEntries.performedAt))
    .limit(1);

  const dateRows = await db
    .select({ date: prEntries.performedAt })
    .from(prEntries)
    .where(eq(prEntries.userId, user.id));

  const allDates = dateRows.map((r) => r.date);
  const streak = weeklyStreak(allDates);
  const trainedThisWeek = allDates.some((d) => isSameWeek(d, todayIso()));

  const catNameById = new Map(cats.map((c) => [c.id, c.name]));
  const withEntries = exRows.filter((r) => r.entryCount > 0);
  // Deterministic "random" featured exercise — rotates daily.
  const featured =
    withEntries.length > 0
      ? withEntries[dayOfYear() % withEntries.length]
      : null;

  const lastPrDate = await lastPrDateForUser(user.id);

  const motivation = motivationalLine({
    totalPrs: totals?.totalPrs ?? 0,
    streakWeeks: streak,
    lastPrDate,
    trainedThisWeek,
  });

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
      <StatsHeader
        userName={user.name}
        totalPrs={totals?.totalPrs ?? 0}
        totalEntries={totals?.totalEntries ?? 0}
        streakWeeks={streak}
        trainedThisWeek={trainedThisWeek}
        motivation={motivation}
        lastPrDate={lastPrDate}
        featured={
          featured
            ? {
                id: featured.exercise.id,
                name: featured.exercise.name,
                categoryName: catNameById.get(featured.exercise.categoryId) ?? "",
                maxWeight: featured.maxWeight,
              }
            : null
        }
      />
      <SearchAndGrid categories={dashCategories} />
    </main>
  );
}

function isSameWeek(a: string, b: string): boolean {
  return monday(a) === monday(b);
}

function monday(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000);
}

async function lastPrDateForUser(userId: string): Promise<string | null> {
  const rows = await db
    .select({ date: prEntries.performedAt })
    .from(prEntries)
    .where(sql`${prEntries.userId} = ${userId} and ${prEntries.isPr}`)
    .orderBy(desc(prEntries.performedAt))
    .limit(1);
  return rows[0]?.date ?? null;
}
