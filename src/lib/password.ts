import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;

/** Hash a password with a random salt using scrypt. Format: salt:hash (hex). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

/** Constant-time verification of a password against a stored salt:hash pair. */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/** SHA-256 a session token for safe at-rest storage. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Generate a cryptographically secure session token. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}
