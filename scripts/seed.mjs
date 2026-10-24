#!/usr/bin/env node
/**
 * IronVault — Database seed
 *
 * Creates the initial ADMIN account pre-populated with a realistic
 * ~14-week progressive-overload vault (categories, exercises, PR history
 * with gym-authentic notes like "Bar + 30kg" and "Inside Hammers").
 *
 * Usage:
 *   node scripts/seed.mjs            # seed (idempotent: re-seeds the admin vault)
 *
 * Requires DATABASE_URL (defaults to the local template instance).
 */
import crypto from "node:crypto";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const ADMIN = {
  name: "Iron Champion",
  email: "admin@ironvault.app",
  password: "IronVault#2026",
};

/* ---------- password hashing (must match src/lib/password.ts) ---------- */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/* ---------- deterministic PRNG (stable demo data) ---------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1337);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => min + rand() * (max - min);
const intBetween = (min, max) => Math.floor(between(min, max + 1));

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/* ---------- vault blueprint ---------- */
const CATEGORIES = [
  { key: "chest", name: "Chest", nameEn: "Chest", icon: "shield", color: "rose" },
  { key: "back", name: "Back", nameEn: "Back", icon: "anchor", color: "blue" },
  { key: "shoulders", name: "Shoulders", nameEn: "Shoulders", icon: "mountain", color: "amber" },
  { key: "arms", name: "Arms", nameEn: "Arms", icon: "dumbbell", color: "violet" },
  { key: "triceps", name: "Triceps", nameEn: "Triceps", icon: "zap", color: "coral" },
  { key: "legs", name: "Legs", nameEn: "Legs", icon: "flame", color: "teal" },
  { key: "core", name: "Core", nameEn: "Core", icon: "target", color: "orange" },
];

const EXERCISES = [
  // [category, name, nameEn, startKg, endKg, sessions, repRange, noteBank]
  ["chest", "Bench Press", "Bench Press", 60, 92.5, 14, [4, 8],
    ["Bar + 20kg", "Felt strong", "Rest 3 min", "Last set heavy", "Chest up"]],
  ["chest", "Incline Dumbbell Press", "Incline Dumbbell Press", 40, 60, 12, [6, 10],
    ["DB +20kg each hand", "Bench angle 30°", "Full stretch at bottom"]],
  ["chest", "Cable Fly", "Cable Fly", 20, 35, 10, [10, 15],
    ["High pulley", "Slow squeeze", "Burnout set"]],
  ["back", "Wide Lat Pulldown", "Wide Lat Pulldown", 55, 82.5, 14, [6, 10],
    ["Wide grip", "Inside Hammers", "Chest up", "Pull to upper chest"]],
  ["back", "Cable Rows", "Cable Rows", 50, 80, 13, [8, 12],
    ["V-bar", "Inside Hammers", "Straight back", "Pause 1s"]],
  ["back", "Deadlift", "Deadlift", 100, 162.5, 12, [3, 6],
    ["Bar + 30kg", "No belt", "Straps on", "Neutral spine", "Heavy single"]],
  ["shoulders", "Shoulder Press", "Shoulder Press", 30, 47.5, 13, [6, 10],
    ["Seated", "Standing", "Last set heavy", "Core tight"]],
  ["shoulders", "Dumbbell Lateral Raise", "Dumbbell Lateral Raise", 10, 17.5, 12, [10, 15],
    ["Strict form", "Partial reps last set", "Tempo 3-1-3"]],
  ["shoulders", "Face Pull", "Face Pull", 15, 32.5, 10, [12, 15],
    ["Rope attachment", "Elbows high", "Shoulder health"]],
  ["arms", "Barbell Curl", "Barbell Curl", 25, 42.5, 12, [8, 12],
    ["EZ bar", "Straight bar", "Elbows pinned", "21s finisher"]],
  ["triceps", "Triceps Pushdown", "Triceps Pushdown", 25, 47.5, 12, [8, 14],
    ["Rope", "V-bar", "Overhead", "Intense burn"]],
  ["arms", "Hammer Curl", "Hammer Curl", 16, 26, 10, [8, 12],
    ["Neutral grip", "Across body", "Slow negatives"]],
  ["legs", "Back Squat", "Back Squat", 80, 132.5, 14, [4, 6],
    ["Full depth ATG", "Belt on", "Bar + 30kg", "Feet planted", "Pause squats"]],
  ["legs", "Leg Press", "Leg Press", 140, 245, 12, [8, 12],
    ["Feet high", "Feet low", "Machine plate #14", "Drop set"]],
  ["legs", "Standing Calf Raise", "Standing Calf Raise", 60, 105, 10, [10, 15],
    ["Full stretch", "Pause at top", "Slow negatives"]],
  ["core", "Weighted Cable Crunch", "Weighted Cable Crunch", 10, 27.5, 10, [12, 20],
    ["Rope pulldown", "Full crunch", "Core squeeze"]],
];

/* ---------- entry synthesis ---------- */
function buildEntries(start, end, sessions, repRange, notes) {
  const entries = [];
  // spread sessions over last ~98 days (14 weeks) — most recent today or yesterday
  const spacing = 98 / sessions;
  let dayCursor = 98 - between(0, 2);
  let weight = start;
  for (let i = 0; i < sessions; i++) {
    const progress = i / (sessions - 1);
    // base ramp + plateau/deload noise
    const ramp = start + (end - start) * progress;
    const noise = pick([0, 0, 0, -2.5, -5, 1.25, 2.5]);
    weight = Math.max(start, Math.round((ramp + noise) * 4) / 4); // quarter-plate precision
    const reps = intBetween(repRange[0], repRange[1]);
    const date = isoDaysAgo(Math.max(0, Math.round(dayCursor)));
    entries.push({
      id: crypto.randomUUID(),
      weightKg: weight,
      reps,
      note: rand() < 0.45 ? pick(notes) : null,
      performedAt: date,
      isPr: false, // set below — TRUE PR semantics applied after all weights exist
      createdAt: new Date(date + "T19:00:00Z"),
    });
    dayCursor -= spacing * between(0.8, 1.2);
  }
  entries.sort((a, b) => a.performedAt.localeCompare(b.performedAt));

  // TRUE PR semantics: flag exclusively entries sitting at the ALL-TIME MAX
  // weight for this exercise. Everything below the ceiling is not a PR.
  const allTimeMax = Math.max(...entries.map((e) => e.weightKg));
  for (const e of entries) e.isPr = e.weightKg === allTimeMax;

  return entries;
}

/* ---------- main ---------- */
async function main() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Idempotent: wipe the previous seeded admin vault entirely (cascades).
    const existing = await client.query("SELECT id FROM users WHERE email = $1", [ADMIN.email]);
    if (existing.rows.length > 0) {
      await client.query("DELETE FROM users WHERE id = $1", [existing.rows[0].id]);
      console.log("• Existing admin vault wiped for a clean re-seed.");
    }

    const userId = crypto.randomUUID();
    await client.query(
      `INSERT INTO users (id, name, email, phone, password_hash, is_admin, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())`,
      [userId, ADMIN.name, ADMIN.email, null, hashPassword(ADMIN.password), true],
    );

    const catIds = new Map();
    for (let i = 0; i < CATEGORIES.length; i++) {
      const c = CATEGORIES[i];
      const id = crypto.randomUUID();
      catIds.set(c.key, id);
      await client.query(
        `INSERT INTO categories (id, user_id, name, name_en, icon, color, sort_order, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now())`,
        [id, userId, c.name, c.nameEn, c.icon, c.color, i],
      );
    }

    let entryCount = 0;
    let prCount = 0;
    for (const [catKey, name, nameEn, start, end, sessions, repRange, notes] of EXERCISES) {
      const exId = crypto.randomUUID();
      await client.query(
        `INSERT INTO exercises (id, user_id, category_id, name, name_en, image_url, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, now())`,
        [exId, userId, catIds.get(catKey), name, nameEn, null],
      );
      const entries = buildEntries(start, end, sessions, repRange, notes);
      for (const e of entries) {
        await client.query(
          `INSERT INTO pr_entries (id, user_id, exercise_id, weight_kg, reps, note, performed_at, is_pr, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [e.id, userId, exId, e.weightKg, e.reps, e.note, e.performedAt, e.isPr, e.createdAt],
        );
        entryCount++;
        if (e.isPr) prCount++;
      }
    }

    await client.query("COMMIT");
    console.log("✓ IronVault seeded successfully");
    console.log(`  Admin login : ${ADMIN.email} / ${ADMIN.password}`);
    console.log(`  Vault       : ${CATEGORIES.length} categories · ${EXERCISES.length} exercises · ${entryCount} entries · ${prCount} PRs`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("✗ Seed failed:", err.message);
    console.error("  Hint: run `npx drizzle-kit push` first so the tables exist.");
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
