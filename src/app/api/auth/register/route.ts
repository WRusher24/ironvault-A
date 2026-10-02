import { NextRequest, NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";
import { DEFAULT_CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(120),
  identifier: z.string().trim().min(5, "أدخل بريدًا إلكترونيًا أو رقم هاتف صحيحًا").max(255),
  password: z
    .string()
    .min(8, "كلمة المرور يجب ألا تقل عن 8 أحرف")
    .max(100, "كلمة المرور طويلة جدًا"),
});

function detectIdentifier(raw: string): { email?: string; phone?: string } {
  if (raw.includes("@")) {
    return { email: raw.toLowerCase() };
  }
  // Normalize phone: keep digits and leading +
  const digits = raw.replace(/[^\d+]/g, "");
  return { phone: digits };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
        { status: 400 },
      );
    }
    const { name, identifier, password } = parsed.data;
    const idn = detectIdentifier(identifier);

    if (idn.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(idn.email)) {
      return NextResponse.json(
        { error: "صيغة البريد الإلكتروني غير صحيحة" },
        { status: 400 },
      );
    }
    if (idn.phone && !/^\+?\d{7,15}$/.test(idn.phone)) {
      return NextResponse.json(
        { error: "صيغة رقم الهاتف غير صحيحة" },
        { status: 400 },
      );
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(
        idn.email
          ? or(eq(users.email, idn.email), idn.phone ? eq(users.phone, idn.phone) : eq(users.email, idn.email))
          : eq(users.phone, idn.phone!),
      )
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "هذا الحساب مسجل بالفعل — جرّب تسجيل الدخول" },
        { status: 409 },
      );
    }

    const [user] = await db
      .insert(users)
      .values({
        name,
        email: idn.email ?? null,
        phone: idn.phone ?? null,
        passwordHash: hashPassword(password),
      })
      .returning();

    // Seed the new vault with default muscle-group categories — instant access, no approval gate.
    await db.insert(categories).values(
      DEFAULT_CATEGORIES.map((c, i) => ({
        userId: user.id,
        name: c.name,
        nameEn: c.nameEn,
        icon: c.icon,
        color: c.color,
        sortOrder: i,
      })),
    );

    await createSession(user.id);
    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    // Unique-violation race guard
    if ((error as { code?: string })?.code === "23505") {
      return NextResponse.json(
        { error: "هذا الحساب مسجل بالفعل — جرّب تسجيل الدخول" },
        { status: 409 },
      );
    }
    console.error("register error", error);
    return NextResponse.json({ error: "تعذر إنشاء الحساب الآن" }, { status: 500 });
  }
}
