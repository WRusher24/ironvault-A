import { NextRequest, NextResponse } from "next/server";
import { and, eq, lt, max } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, exercises, prEntries } from "@/db/schema";
import { requireUser } from "@/lib/guard";

export const dynamic = "force-dynamic";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const createSchema = z.object({
  exerciseId: z.string().uuid().optional(),
  newExercise: z
    .object({
      name: z.string().trim().min(1, "أدخل اسم التمرين").max(160),
      categoryId: z.string().uuid("اختر فئة صحيحة"),
    })
    .optional(),
  weightKg: z
    .number({ error: "أدخل وزنًا صحيحًا بالكيلوغرام" })
    .positive("الوزن يجب أن يكون أكبر من صفر")
    .max(2000, "الوزن غير منطقي"),
  reps: z
    .number({ error: "أدخل عدد التكرارات" })
    .int("التكرارات يجب أن تكون رقمًا صحيحًا")
    .min(1, "تكرار واحد على الأقل")
    .max(500),
  note: z.string().trim().max(300).optional().nullable(),
  performedAt: z.string().regex(ISO_DATE, "صيغة التاريخ غير صحيحة"),
});

/**
 * Log a new PR entry — the lightning path used by the FAB sheet.
 * Responds with `isNewRecord` so the client can fire the celebration.
 */
export async function POST(req: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
      { status: 400 },
    );
  }
  const data = parsed.data;

  let exerciseId = data.exerciseId ?? null;

  if (!exerciseId && data.newExercise) {
    // Verify category ownership, then create the exercise inline.
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.id, data.newExercise.categoryId),
          eq(categories.userId, user.id),
        ),
      )
      .limit(1);
    if (!cat) {
      return NextResponse.json({ error: "الفئة المحددة غير موجودة" }, { status: 400 });
    }
    const [created] = await db
      .insert(exercises)
      .values({
        userId: user.id,
        categoryId: data.newExercise.categoryId,
        name: data.newExercise.name,
        nameEn: null,
        imageUrl: null,
      })
      .returning();
    exerciseId = created.id;
  }

  if (!exerciseId) {
    return NextResponse.json({ error: "اختر تمرينًا أو أنشئ تمرينًا جديدًا" }, { status: 400 });
  }

  // Strict isolation: verify the exercise belongs to this user.
  const [exercise] = await db
    .select({ id: exercises.id })
    .from(exercises)
    .where(and(eq(exercises.id, exerciseId), eq(exercises.userId, user.id)))
    .limit(1);
  if (!exercise) {
    return NextResponse.json({ error: "التمرين غير موجود" }, { status: 404 });
  }

  // True PR = weight strictly above every entry that existed before this date
  // (supports backdating correctly). `beatsAllTime` drives the celebration.
  const [historical] = await db
    .select({ max: max(prEntries.weightKg) })
    .from(prEntries)
    .where(
      and(
        eq(prEntries.exerciseId, exerciseId),
        lt(prEntries.performedAt, data.performedAt),
      ),
    );
  const [allTime] = await db
    .select({ max: max(prEntries.weightKg) })
    .from(prEntries)
    .where(eq(prEntries.exerciseId, exerciseId));

  const previousBest = allTime?.max ?? null;
  const isNewRecord = previousBest === null || data.weightKg > previousBest;
  const isPrAtDate =
    data.performedAt >= todayServer()
      ? isNewRecord
      : historical?.max === null || historical === undefined
        ? true
        : data.weightKg > historical.max;

  const [entry] = await db
    .insert(prEntries)
    .values({
      userId: user.id,
      exerciseId,
      weightKg: data.weightKg,
      reps: data.reps,
      note: data.note || null,
      performedAt: data.performedAt,
      isPr: isPrAtDate,
    })
    .returning();

  return NextResponse.json(
    { entry, isNewRecord, exerciseId, previousBest },
    { status: 201 },
  );
}

function todayServer(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
