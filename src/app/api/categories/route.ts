import { NextRequest, NextResponse } from "next/server";
import { asc, eq, max } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireUser } from "@/lib/guard";
import { CATEGORY_COLOR_KEYS, CATEGORY_ICON_KEYS } from "@/lib/categories";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().trim().min(1, "Enter category name").max(120),
  nameEn: z.string().trim().max(120).optional().nullable(),
  icon: z.string().refine((v) => CATEGORY_ICON_KEYS.includes(v), "Unknown icon").default("dumbbell"),
  color: z.string().refine((v) => CATEGORY_COLOR_KEYS.includes(v), "Unknown color").default("coral"),
});

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, user.id))
    .orderBy(asc(categories.sortOrder), asc(categories.createdAt));
  return NextResponse.json({ categories: rows });
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
  const [top] = await db
    .select({ max: max(categories.sortOrder) })
    .from(categories)
    .where(eq(categories.userId, user.id));
  const [created] = await db
    .insert(categories)
    .values({
      userId: user.id,
      name: parsed.data.name,
      nameEn: parsed.data.nameEn || null,
      icon: parsed.data.icon,
      color: parsed.data.color,
      sortOrder: (top?.max ?? -1) + 1,
    })
    .returning();
  return NextResponse.json({ category: created }, { status: 201 });
}
