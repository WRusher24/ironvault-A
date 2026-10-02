import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";
import { generateToken, hashToken } from "@/lib/password";

export const SESSION_COOKIE = "iv_session";
const SESSION_DAYS = 30;

async function cookieStore() {
  return cookies();
}

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}

/** Create a new DB session and set the httpOnly cookie. Returns the raw token. */
export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({
    tokenHash: hashToken(token),
    userId,
    expiresAt,
  });
  const store = await cookieStore();
  store.set(SESSION_COOKIE, token, cookieOptions(expiresAt));
  return token;
}

/** Destroy the current session (cookie + DB row). */
export async function destroySession(): Promise<void> {
  const store = await cookieStore();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  store.delete(SESSION_COOKIE);
}

/**
 * Resolve the current authenticated user from the session cookie.
 * Cached per-request via React `cache`. Returns null when anonymous.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const store = await cookieStore();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, hashToken(token)),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return rows[0]?.user ?? null;
});
