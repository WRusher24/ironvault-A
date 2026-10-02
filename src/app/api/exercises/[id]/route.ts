import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, exercises, prEntries } from "@/db/schema";
import { requireUser } from "@/lib/guard";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().trim().min(1, "أدخل اسم التمرين").max(160).optional(),
  nameEn: z.string().trim().max(160).nullable().optional(),
  categoryId: z.string().uuid().optional(),
  imageUrl: z.string().max(500).nullable().optional(),
});

/** Full exercise detail: exercise + chronological entry history. */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;

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
  if (!row) {
    return NextResponse.json({ error: "التمرين غير موجود" }, { status: 404 });
  }

  const entries = await db
    .select()
    .from(prEntries)
    .where(and(eq(prEntries.exerciseId, id), eq(prEntries.userId, user.id)))
    .orderBy(asc(prEntries.performedAt), asc(prEntries.createdAt));

  const maxWeight = entries.reduce((m, e) => Math.max(m, e.weightKg), 0);
  const prCount = entries.filter((e) => e.isPr).length;

  return NextResponse.json({
    exercise: {
      ...row.exercise,
      categoryName: row.categoryName,
      categoryNameEn: row.categoryNameEn,
      categoryColor: row.categoryColor,
      categoryIcon: row.categoryIcon,
    },
    entries,
    stats: {
      maxWeight: entries.length ? maxWeight : null,
      prCount,
      entryCount: entries.length,
      lastDate: entries.length ? entries[entries.length - 1].performedAt : null,
    },
  });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 },
    );
  }
  if (parsed.data.categoryId) {
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
      return NextResponse.json({ error: "الفئة المحددة غير موجودة" }, { status: 400 });
    }
  }
  const [updated] = await db
    .update(exercises)
    .set({
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.nameEn !== undefined ? { nameEn: parsed.data.nameEn || null } : {}),
      ...(parsed.data.categoryId !== undefined ? { categoryId: parsed.data.categoryId } : {}),
      ...(parsed.data.imageUrl !== undefined ? { imageUrl: parsed.data.imageUrl || null } : {}),
    })
    .where(and(eq(exercises.id, id), eq(exercises.userId, user.id)))
    .returning();
  if (!updated) {
    return NextResponse.json({ error: "التمرين غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ exercise: updated });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  const [deleted] = await db
    .delete(exercises)
    .where(and(eq(exercises.id, id), eq(exercises.userId, user.id)))
    .returning({ id: exercises.id });
  if (!deleted) {
    return NextResponse.json({ error: "التمرين غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
