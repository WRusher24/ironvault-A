import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, exercises, prEntries } from "@/db/schema";
import { requireUser } from "@/lib/guard";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().trim().min(1, "Enter exercise name").max(160),
  nameEn: z.string().trim().max(160).optional().nullable(),
  categoryId: z.string().uuid("Choose a valid category"),
  imageUrl: z.string().max(500).optional().nullable(),
});

/** List exercises with per-exercise aggregates (max weight, entry count, last date). */
export async function GET(req: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;
  const categoryId = req.nextUrl.searchParams.get("categoryId");

  const rows = await db
    .select({
      exercise: exercises,
      categoryName: categories.name,
      categoryNameEn: categories.nameEn,
      maxWeight: sql<number | null>`max(${prEntries.weightKg})`,
      entryCount: sql<number>`count(${prEntries.id})::int`,
      prCount: sql<number>`count(*) filter (where ${prEntries.isPr})::int`,
      lastDate: sql<string | null>`max(${prEntries.performedAt})`,
    })
    .from(exercises)
    .innerJoin(categories, eq(exercises.categoryId, categories.id))
    .leftJoin(prEntries, eq(prEntries.exerciseId, exercises.id))
    .where(
      and(
        eq(exercises.userId, user.id),
        categoryId ? eq(exercises.categoryId, categoryId) : undefined,
      ),
    )
    .groupBy(exercises.id, categories.name, categories.nameEn)
    .orderBy(desc(sql`max(${prEntries.performedAt})`), asc(exercises.createdAt));

  return NextResponse.json({
    exercises: rows.map((r) => ({
      ...r.exercise,
      categoryName: r.categoryName,
      categoryNameEn: r.categoryNameEn,
      maxWeight: r.maxWeight,
      entryCount: r.entryCount,
      prCount: r.prCount,
      lastDate: r.lastDate,
    })),
  });
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 },
    );
  }
  // Verify the category belongs to this user (isolation guard).
  const [cat] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.id, parsed.data.categoryId),
        eq(categories.userId, user.id),
      ),
    )
    .limit(1);
  if (!cat) {
    return NextResponse.json({ error: "Category not found" }, { status: 400 });
  }

  const [created] = await db
    .insert(exercises)
    .values({
      userId: user.id,
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      nameEn: parsed.data.nameEn || null,
      imageUrl: parsed.data.imageUrl || null,
    })
    .returning();
  return NextResponse.json({ exercise: created }, { status: 201 });
}
