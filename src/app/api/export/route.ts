import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, exercises, prEntries } from "@/db/schema";
import { requireUser } from "@/lib/guard";
import { buildCsv } from "@/lib/csv";
import { formatWeight } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Export the entire vault (exercises + full PR history) as a CSV download. */
export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  const rows = await db
    .select({
      date: prEntries.performedAt,
      category: categories.name,
      categoryEn: categories.nameEn,
      exercise: exercises.name,
      exerciseEn: exercises.nameEn,
      weight: prEntries.weightKg,
      reps: prEntries.reps,
      note: prEntries.note,
      isPr: prEntries.isPr,
    })
    .from(prEntries)
    .innerJoin(exercises, eq(prEntries.exerciseId, exercises.id))
    .innerJoin(categories, eq(exercises.categoryId, categories.id))
    .where(eq(prEntries.userId, user.id))
    .orderBy(asc(categories.sortOrder), asc(exercises.name), asc(prEntries.performedAt));

  // Bilingual headers keep the CSV useful in both Arabic and English tooling.
  const csv = buildCsv(
    ["التاريخ / Date", "الفئة / Category", "التمرين / Exercise", "Exercise (EN)", "الوزن (كجم) / Weight (kg)", "التكرارات / Reps", "ملاحظة / Note", "رقم قياسي / PR"],
    rows.map((r) => [
      r.date,
      r.category,
      r.exercise,
      r.exerciseEn ?? "",
      formatWeight(r.weight),
      r.reps,
      r.note,
      r.isPr ? "PR" : "",
    ]),
  );

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ironvault-export-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
