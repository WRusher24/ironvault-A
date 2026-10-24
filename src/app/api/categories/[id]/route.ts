import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireUser } from "@/lib/guard";
import { CATEGORY_COLOR_KEYS, CATEGORY_ICON_KEYS } from "@/lib/categories";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().trim().min(1, "Enter category name").max(120).optional(),
  nameEn: z.string().trim().max(120).nullable().optional(),
  icon: z.string().refine((v) => CATEGORY_ICON_KEYS.includes(v)).optional(),
  color: z.string().refine((v) => CATEGORY_COLOR_KEYS.includes(v)).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
      { status: 400 },
    );
  }
  // Strict isolation: the WHERE clause always includes userId.
  const [updated] = await db
    .update(categories)
    .set({
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.nameEn !== undefined ? { nameEn: parsed.data.nameEn || null } : {}),
      ...(parsed.data.icon !== undefined ? { icon: parsed.data.icon } : {}),
      ...(parsed.data.color !== undefined ? { color: parsed.data.color } : {}),
    })
    .where(and(eq(categories.id, id), eq(categories.userId, user.id)))
    .returning();
  if (!updated) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  return NextResponse.json({ category: updated });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  // Cascades to exercises + entries via FK onDelete: cascade.
  const [deleted] = await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, user.id)))
    .returning({ id: categories.id });
  if (!deleted) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
