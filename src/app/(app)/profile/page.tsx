import type { Metadata } from "next";
import { asc, eq, sql } from "drizzle-orm";
import { Download, Mail, Smartphone } from "lucide-react";
import { db } from "@/db";
import { categories, exercises, prEntries } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { formatCount, formatDateAr } from "@/lib/format";
import CategoryManager from "@/components/category-manager";
import LogoutButton from "@/components/logout-button";

export const metadata: Metadata = { title: "حسابي" };
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
      <section className="glass-card relative overflow-hidden rounded-3xl p-6">
        <div className="absolute -start-10 -top-10 h-40 w-40 rounded-full bg-ice-500/10 blur-3xl" />
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-volt-500 to-ice-500 text-3xl font-black text-iron-950">
            {initial}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black text-white">{user.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-400">
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
            <p className="mt-1 text-[11px] font-bold text-slate-500">
              عضو الحديد منذ {formatDateAr(user.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2 border-t border-iron-700 pt-4 text-center">
          <div>
            <p className="tabular text-lg font-black text-volt-400">{formatCount(stats?.prs ?? 0)}</p>
            <p className="text-[9px] font-bold text-slate-500">أرقام قياسية</p>
          </div>
          <div>
            <p className="tabular text-lg font-black text-white">{formatCount(stats?.entries ?? 0)}</p>
            <p className="text-[9px] font-bold text-slate-500">سجل</p>
          </div>
          <div>
            <p className="tabular text-lg font-black text-white">{formatCount(exCount?.count ?? 0)}</p>
            <p className="text-[9px] font-bold text-slate-500">تمرين</p>
          </div>
          <div>
            <p className="tabular text-lg font-black text-ice-300">
              {stats?.topWeight ? formatCount(Math.round(stats.topWeight)) : "—"}
            </p>
            <p className="text-[9px] font-bold text-slate-500">أثقل وزن (كجم)</p>
          </div>
        </div>
      </section>

      {/* Quick export */}
      <a
        href="/api/export"
        download
        className="glass-card flex items-center justify-between rounded-2xl p-4 transition-all hover:border-volt-500/40"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-volt-500/15 text-volt-400">
            <Download className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-black text-white">تصدير بياناتي</span>
            <span className="block text-[11px] font-semibold text-slate-500">
              ملف CSV جاهز لـ Excel وGoogle Sheets
            </span>
          </span>
        </span>
        <span className="rounded-full bg-volt-500/15 px-3 py-1 text-[10px] font-black text-volt-400">
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
        <p className="pb-4 text-center text-[10px] font-semibold text-slate-600">
          آيرون فالت · IronVault — بياناتك معزولة بالكامل ولا تُشارك مع أحد.
        </p>
      </section>
    </main>
  );
}
