import type { Metadata } from "next";
import { asc, eq, sql } from "drizzle-orm";
import { Download, Mail, Smartphone } from "lucide-react";
import { db } from "@/db";
import { categories, exercises, prEntries } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { formatCount, formatDateEn } from "@/lib/format";
import CategoryManager from "@/components/category-manager";
import LogoutButton from "@/components/logout-button";
import ThemeSelector from "@/components/theme-selector";

export const metadata: Metadata = { title: "My Account" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = (await getCurrentUser())!;

  const [stats] = await db
    .select({
      entries: sql<number>`count(*)::int`,
      prs: sql<number>`count(*) filter (where ${prEntries.isPr})::int`,
      topWeight: sql<number | null>`max(${prEntries.weightKg})`,
    })
    .from(prEntries)
    .where(eq(prEntries.userId, user.id));

  const [exCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(exercises)
    .where(eq(exercises.userId, user.id));

  const cats = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, user.id))
    .orderBy(asc(categories.sortOrder), asc(categories.createdAt));

  const initial = user.name.trim().charAt(0);

  return (
    <main className="stagger space-y-5 px-4 pt-6">
      {/* Identity card */}
      <section className="clean-card relative overflow-hidden rounded-3xl p-6">
        <div className="absolute -start-10 -top-10 h-40 w-40 rounded-full blur-3xl" style={{ background: "var(--color-accent-soft)" }} />
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl font-black text-white" style={{ background: "var(--color-accent)" }}>
            {initial}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black" style={{ color: "var(--color-text)" }}>{user.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
              {user.email && (
                <span className="flex items-center gap-1" dir="ltr">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
              )}
              {user.phone && (
                <span className="flex items-center gap-1" dir="ltr">
                  <Smartphone className="h-3.5 w-3.5" />
                  {user.phone}
                </span>
              )}
            </p>
            <p className="mt-1 text-[11px] font-bold" style={{ color: "var(--color-text-faint)" }}>
              Iron member since {formatDateEn(user.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2 border-t pt-4 text-center" style={{ borderColor: "var(--color-card-border)" }}>
          <div>
            <p className="tabular text-lg font-black" style={{ color: "var(--color-accent)" }}>{formatCount(stats?.prs ?? 0)}</p>
            <p className="text-[9px] font-bold" style={{ color: "var(--color-text-faint)" }}>PRs</p>
          </div>
          <div>
            <p className="tabular text-lg font-black" style={{ color: "var(--color-text)" }}>{formatCount(stats?.entries ?? 0)}</p>
            <p className="text-[9px] font-bold" style={{ color: "var(--color-text-faint)" }}>Entries</p>
          </div>
          <div>
            <p className="tabular text-lg font-black" style={{ color: "var(--color-text)" }}>{formatCount(exCount?.count ?? 0)}</p>
            <p className="text-[9px] font-bold" style={{ color: "var(--color-text-faint)" }}>Exercises</p>
          </div>
          <div>
            <p className="tabular text-lg font-black text-teal-600">
              {stats?.topWeight ? formatCount(Math.round(stats.topWeight)) : "—"}
            </p>
            <p className="text-[9px] font-bold" style={{ color: "var(--color-text-faint)" }}>Top Weight (kg)</p>
          </div>
        </div>
      </section>

      {/* Theme preference */}
      <ThemeSelector />

      {/* Quick export */}
      <a
        href="/api/export"
        download
        className="clean-card flex items-center justify-between rounded-2xl p-4 transition-all hover:opacity-80"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}>
            <Download className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-black" style={{ color: "var(--color-text)" }}>Export my data</span>
            <span className="block text-[11px] font-semibold" style={{ color: "var(--color-text-faint)" }}>
              CSV file ready for Excel and Google Sheets
            </span>
          </span>
        </span>
        <span className="rounded-full px-3 py-1 text-[10px] font-black" style={{ background: "var(--color-accent-soft)", color: "var(--color-accent-text)" }}>
          CSV
        </span>
      </a>

      {/* Categories CRUD */}
      <section id="categories">
        <CategoryManager
          initialCategories={cats.map((c) => ({
            id: c.id,
            name: c.name,
            nameEn: c.nameEn,
            icon: c.icon,
            color: c.color,
          }))}
        />
      </section>

      {/* Danger / session */}
      <section className="space-y-3">
        <LogoutButton />
        <p className="pb-4 text-center text-[10px] font-semibold" style={{ color: "var(--color-text-faint)" }}>
          IronVault — your data is fully isolated and never shared with anyone.
        </p>
      </section>
    </main>
  );
}
