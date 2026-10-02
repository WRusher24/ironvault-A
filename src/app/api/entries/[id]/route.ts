import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { prEntries } from "@/db/schema";
import { requireUser } from "@/lib/guard";
import { recomputePrs } from "@/lib/prs";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  weightKg: z.number().positive("الوزن يجب أن يكون أكبر من صفر").max(2000).optional(),
  reps: z.number().int().min(1).max(500).optional(),
  note: z.string().trim().max(300).nullable().optional(),
  performedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "صيغة التاريخ غير صحيحة").optional(),
});

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
  const [updated] = await db
    .update(prEntries)
    .set({
      ...(parsed.data.weightKg !== undefined ? { weightKg: parsed.data.weightKg } : {}),
      ...(parsed.data.reps !== undefined ? { reps: parsed.data.reps } : {}),
      ...(parsed.data.note !== undefined ? { note: parsed.data.note || null } : {}),
      ...(parsed.data.performedAt !== undefined ? { performedAt: parsed.data.performedAt } : {}),
    })
    .where(and(eq(prEntries.id, id), eq(prEntries.userId, user.id)))
    .returning();
  if (!updated) {
    return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });
  }
  // Weights/dates changed → PR flags may shift across the whole timeline.
  await recomputePrs(updated.exerciseId);
  return NextResponse.json({ entry: updated });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await ctx.params;
  const [deleted] = await db
    .delete(prEntries)
    .where(and(eq(prEntries.id, id), eq(prEntries.userId, user.id)))
    .returning({ id: prEntries.id, exerciseId: prEntries.exerciseId });
  if (!deleted) {
    return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });
  }
  await recomputePrs(deleted.exerciseId);
  return NextResponse.json({ ok: true });
}
