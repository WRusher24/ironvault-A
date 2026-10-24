import { NextRequest, NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  identifier: z.string().trim().min(5, "Enter your email or phone number"),
  password: z.string().min(1, "Enter your password"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 },
      );
    }
    const { identifier, password } = parsed.data;
    const normalized = identifier.includes("@")
      ? identifier.toLowerCase()
      : identifier.replace(/[^\d+]/g, "");

    const rows = await db
      .select()
      .from(users)
      .where(or(eq(users.email, normalized), eq(users.phone, normalized)))
      .limit(1);
    const user = rows[0];

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid credentials — check and try again" },
        { status: 401 },
      );
    }

    await createSession(user.id);
    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    console.error("login error", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
