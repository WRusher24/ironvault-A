import type { Metadata } from "next";
import { eq, sql } from "drizzle-orm";
import {
  Download,
  FileSpreadsheet,
  ShieldCheck,
  Table2,
} from "lucide-react";
import { db } from "@/db";
import { exercises, prEntries } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { formatCount } from "@/lib/format";

export const metadata: Metadata = { title: "تصدير البيانات" };
export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const user = (await getCurrentUser())!;

  const [stats] = await db
    .select({
      entries: sql<number>`count(*)::int`,
      prs: sql<number>`count(*) filter (where ${prEntries.isPr})::int`,
    })
    .from(prEntries)
    .where(eq(prEntries.userId, user.id));

  const [exCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(exercises)
    .where(eq(exercises.userId, user.id));

  return (
    <main className="stagger space-y-5 px-4 pt-6">
      <header>
        <h1 className="text-2xl font-black text-white">تصدير بياناتك</h1>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          بياناتك ملكك — حمّلها بصيغة CSV متى ما شئت.
        </p>
      </header>

      <div className="glass-card relative overflow-hidden rounded-3xl p-6">
        <div className="absolute -end-10 -top-10 h-40 w-40 rounded-full bg-volt-500/10 blur-3xl" />
        <div className="flex items-center gap-4">
          <div className="volt-glow flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-volt-500 to-ice-500">
            <FileSpreadsheet className="h-8 w-8 text-iron-950" strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">ملف CSV شامل</h2>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
              يشمل كل تمارينك وسجلاتك: التاريخ، الفئة، التمرين، الوزن، التكرارات،
              الملاحظات، وشارات PR.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5 border-t border-iron-700 pt-5 text-center">
          <div>
            <p className="tabular text-xl font-black text-white">{formatCount(stats?.entries ?? 0)}</p>
            <p className="text-[10px] font-bold text-slate-500">سجل تدريبي</p>
          </div>
          <div>
            <p className="tabular text-xl font-black text-volt-400">{formatCount(stats?.prs ?? 0)}</p>
            <p className="text-[10px] font-bold text-slate-500">رقم قياسي</p>
          </div>
          <div>
            <p className="tabular text-xl font-black text-ice-300">{formatCount(exCount?.count ?? 0)}</p>
            <p className="text-[10px] font-bold text-slate-500">تمرين</p>
          </div>
        </div>

        <a
          href="/api/export"
          download
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-volt-500 to-volt-600 py-4 text-sm font-black text-iron-950 shadow-[0_10px_35px_-10px_rgba(34,197,94,0.6)] transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <Download className="h-5 w-5" />
          تحميل ملف CSV الآن
        </a>
      </div>

      <div className="glass-card space-y-3 rounded-3xl p-5">
        <h3 className="flex items-center gap-2 text-sm font-black text-white">
          <Table2 className="h-4.5 w-4.5 text-ice-300" />
          ماذا يوجد داخل الملف؟
        </h3>
        <ul className="space-y-2 text-xs font-semibold leading-relaxed text-slate-400">
          <li className="flex gap-2">
            <span className="text-volt-400">•</span>
            أعمدة ثنائية اللغة (العربية / English) مرتبة زمنيًا لكل تمرين.
          </li>
          <li className="flex gap-2">
            <span className="text-volt-400">•</span>
            الأوزان بالكيلوغرام تمامًا كما سجلتها — بدون أي تحويل.
          </li>
          <li className="flex gap-2">
            <span className="text-volt-400">•</span>
            عمود «PR» يعلّم كل سجل حطّم رقمًا قياسيًا عند تسجيله.
          </li>
          <li className="flex gap-2">
            <span className="text-volt-400">•</span>
            يفتح مباشرة في Excel وGoogle Sheets مع دعم كامل للعربية (UTF-8).
          </li>
        </ul>
      </div>

      <div className="flex items-start gap-3 rounded-3xl border border-iron-700/70 bg-iron-850/60 p-5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-volt-400" />
        <p className="text-xs font-semibold leading-relaxed text-slate-400">
          التصدير يتم من خادم آمن وبعد التحقق من هويتك — لا يمكن لأي مستخدم آخر
          الوصول إلى بياناتك أو تنزيلها.
        </p>
      </div>
    </main>
  );
}
