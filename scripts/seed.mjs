#!/usr/bin/env node
/**
 * IronVault — آيرون فالت · Database seed
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
  name: "بطل الحديد",
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
  { key: "chest", name: "الصدر", nameEn: "Chest", icon: "shield", color: "rose" },
  { key: "back", name: "الظهر", nameEn: "Back", icon: "anchor", color: "cyan" },
  { key: "shoulders", name: "الأكتاف", nameEn: "Shoulders", icon: "mountain", color: "amber" },
  { key: "arms", name: "الأذرع", nameEn: "Arms", icon: "dumbbell", color: "violet" },
  { key: "legs", name: "الأرجل", nameEn: "Legs", icon: "flame", color: "volt" },
  { key: "core", name: "البطن والجذع", nameEn: "Core", icon: "target", color: "blue" },
];

const EXERCISES = [
  // [category, nameAr, nameEn, startKg, endKg, sessions, repRange, noteBank]
  ["chest", "ضغط البنش", "Bench Press", 60, 92.5, 14, [4, 8],
    ["بار أولمبي 20kg", "Felt strong", "Rest 3 min", "آخر مجموعة ثقيلة", "صدور مفتوحة"]],
  ["chest", "الضغط المائل بالدمبل", "Incline Dumbbell Press", 40, 60, 12, [6, 10],
    ["دمبل +20kg لكل يد", "Bench angle 30°", "شد كامل بالأسفل"]],
  ["chest", "فتح صدر بالكيبل", "Cable Fly", 20, 35, 10, [10, 15],
    ["High pulley", "ضغط بطيء", "Burnout set"]],
  ["back", "Wide Lat Pulldown", "سحب لات واسع", 55, 82.5, 14, [6, 10],
    ["Wide grip", "Inside Hammers", "صدر مرفوع", "سحب للصدر العلوي"]],
  ["back", "Cable Rows", "سحب كيبل جالس", 50, 80, 13, [8, 12],
    ["V-bar", "Inside Hammers", "ظهر مستقيم", "Pause 1s"]],
  ["back", "الرفعة الميتة", "Deadlift", 100, 162.5, 12, [3, 6],
    ["Bar + 30kg", "بدون حزام", "Straps on", "ظهر محايد", "Heavy single"]],
  ["shoulders", "Shoulder Press", "ضغط أكتاف بالبار", 30, 47.5, 13, [6, 10],
    ["Seated", "Standing", "آخر مجموعة ثقيلة", "Core tight"]],
  ["shoulders", "رفع جانبي بالدمبل", "Dumbbell Lateral Raise", 10, 17.5, 12, [10, 15],
    ["Strict form", "Partial reps آخر سيت", "Tempo 3-1-3"]],
  ["shoulders", "سحب الوجه بالحبل", "Face Pull", 15, 32.5, 10, [12, 15],
    ["Rope attachment", "كوع عالي", "للصحة الكتفية"]],
  ["arms", "بايسبس بالبار", "Barbell Curl", 25, 42.5, 12, [8, 12],
    ["EZ bar", "Straight bar", "ثبات الكوع", "21s finisher"]],
  ["arms", "ترايسبس كيبل", "Triceps Pushdown", 25, 47.5, 12, [8, 14],
    ["Rope", "V-bar", "Overhead", "حرق ناري"]],
  ["arms", "هامر كيرل", "Hammer Curl", 16, 26, 10, [8, 12],
    ["Neutral grip", "Across body", "بطيء بالنزول"]],
  ["legs", "سكوات", "Back Squat", 80, 132.5, 14, [4, 6],
    ["عمق كامل ATG", "Belt on", "Bar + 30kg", "كعبين ثابتين", "Pause squats"]],
  ["legs", "ضغط الأرجل", "Leg Press", 140, 245, 12, [8, 12],
    ["Feet high", "Feet low", "Machine plate #14", "Drop set"]],
  ["legs", "رفعة السمانة واقفًا", "Standing Calf Raise", 60, 105, 10, [10, 15],
    ["Stretch كامل", "Pause by top", "Slow negatives"]],
  ["core", "كرانش بالأثقال", "Weighted Cable Crunch", 10, 27.5, 10, [12, 20],
    ["Rope pulldown", "انحناء كامل", "ضغط البطن"]],
];

/* ---------- entry synthesis ---------- */
function buildEntries(start, end, sessions, repRange, notes) {
  const entries = [];
  // spread sessions over last ~98 days (14 weeks) — most recent today or yesterday
  const spacing = 98 / sessions;
  let dayCursor = 98 - between(0, 2);
  let weight = start;
  let maxSoFar = -Infinity;
  for (let i = 0; i < sessions; i++) {
    const progress = i / (sessions - 1);
    // base ramp + plateau/deload noise
    const ramp = start + (end - start) * progress;
    const noise = pick([0, 0, 0, -2.5, -5, 1.25, 2.5]);
    weight = Math.max(start, Math.round((ramp + noise) * 4) / 4); // quarter-plate precision
    const reps = intBetween(repRange[0], repRange[1]);
    const date = isoDaysAgo(Math.max(0, Math.round(dayCursor)));
    const isPr = weight > maxSoFar;
    if (weight > maxSoFar) maxSoFar = weight;
    entries.push({
      id: crypto.randomUUID(),
      weightKg: weight,
      reps,
      note: rand() < 0.45 ? pick(notes) : null,
      performedAt: date,
      isPr,
      createdAt: new Date(date + "T19:00:00Z"),
    });
    dayCursor -= spacing * between(0.8, 1.2);
  }
  entries.sort((a, b) => a.performedAt.localeCompare(b.performedAt));
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
