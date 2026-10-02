import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  integer,
  doublePrecision,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * IronVault — آيرون فالت
 * Every domain table carries a `userId` foreign key so each account operates
 * inside a 100% isolated data container. All queries MUST filter by userId.
 */

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    // Either email or phone may be null — but at least one is always set.
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 40 }),
    passwordHash: text("password_hash").notNull(),
    isAdmin: boolean("is_admin").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_unique").on(t.email),
    uniqueIndex("users_phone_unique").on(t.phone),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tokenHash: text("token_hash").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    nameEn: varchar("name_en", { length: 120 }),
    icon: varchar("icon", { length: 40 }).notNull().default("dumbbell"),
    color: varchar("color", { length: 24 }).notNull().default("volt"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("categories_user_idx").on(t.userId)],
);

export const exercises = pgTable(
  "exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    nameEn: varchar("name_en", { length: 160 }),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull().defaultNow(),
  },
  (t) => [
    index("exercises_user_idx").on(t.userId),
    index("exercises_category_idx").on(t.categoryId),
  ],
);

export const prEntries = pgTable(
  "pr_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    weightKg: doublePrecision("weight_kg").notNull(),
    reps: integer("reps").notNull(),
    note: text("note"),
    performedAt: date("performed_at", { mode: "string" }).notNull(),
    // True when this entry set a new all-time max weight for the exercise
    // at the moment it was logged. Recomputed after every mutation.
    isPr: boolean("is_pr").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("entries_user_idx").on(t.userId),
    index("entries_exercise_date_idx").on(t.exerciseId, t.performedAt),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  exercises: many(exercises),
  entries: many(prEntries),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  user: one(users, { fields: [exercises.userId], references: [users.id] }),
  category: one(categories, {
    fields: [exercises.categoryId],
    references: [categories.id],
  }),
  entries: many(prEntries),
}));

export const prEntriesRelations = relations(prEntries, ({ one }) => ({
  user: one(users, { fields: [prEntries.userId], references: [users.id] }),
  exercise: one(exercises, {
    fields: [prEntries.exerciseId],
    references: [exercises.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type PrEntry = typeof prEntries.$inferSelect;
