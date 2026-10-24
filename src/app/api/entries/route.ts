import { NextRequest, NextResponse } from "next/server";
import { and, eq, max } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, exercises, prEntries } from "@/db/schema";
import { requireUser } from "@/lib/guard";
import { recomputePrs } from "@/lib/prs";

export const dynamic = "force-dynamic";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const createSchema = z.object({
  exerciseId: z.string().uuid().optional(),
  newExercise: z
    .object({
      name: z.string().trim().min(1, "Enter exercise name").max(160),
      categoryId: z.string().uuid("Choose a valid category"),
    })
    .optional(),
  weightKg: z
    .number({ error: "Enter a valid weight in kilograms" })
    .positive("Weight must be greater than zero")
    .max(2000, "Unrealistic weight"),
  reps: z
    .number({ error: "Enter number of reps" })
    .int("Reps must be a whole number")
    .min(1, "At least one rep")
    .max(500),
  note: z.string().trim().max(300).optional().nullable(),
  performedAt: z.string().regex(ISO_DATE, "Invalid date format"),
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
      { error: parsed.error.issues[0]?.message ?? "Invalid data" },
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
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
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
    return NextResponse.json({ error: "Pick an exercise or create a new one" }, { status: 400 });
  }

  // Strict isolation: verify the exercise belongs to this user.
  const [exercise] = await db
    .select({ id: exercises.id })
    .from(exercises)
    .where(and(eq(exercises.id, exerciseId), eq(exercises.userId, user.id)))
    .limit(1);
  if (!exercise) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  // TRUE PR semantics — a PR is exclusively the absolute highest weight ever
  // recorded for this exercise:
  //   • weight >  all-time max → NEW RECORD → celebration + PR flag
  //   • weight == all-time max → ties the record → PR flag (no celebration)
  //   • weight <  all-time max → ordinary entry, never a PR
  const [allTime] = await db
    .select({ max: max(prEntries.weightKg) })
    .from(prEntries)
    .where(eq(prEntries.exerciseId, exerciseId));

  const previousBest = allTime?.max ?? null;
  const isNewRecord = previousBest === null || data.weightKg > previousBest;
  const isPr = previousBest === null || data.weightKg >= previousBest;

  const [entry] = await db
    .insert(prEntries)
    .values({
      userId: user.id,
      exerciseId,
      weightKg: data.weightKg,
      reps: data.reps,
      note: data.note || null,
      performedAt: data.performedAt,
      isPr,
    })
    .returning();

  // A backdated high weight reshapes the ceiling → re-derive every flag
  // so only entries at the current all-time max stay highlighted.
  await recomputePrs(exerciseId);

  return NextResponse.json(
    { entry, isNewRecord, exerciseId, previousBest },
    { status: 201 },
  );
}
