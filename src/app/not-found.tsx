import Link from "next/link";
import { Dumbbell, LayoutGrid } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="volt-glow mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-volt-500 to-ice-500">
        <Dumbbell className="h-10 w-10 text-iron-950" strokeWidth={2.4} />
      </div>
      <p className="tabular text-6xl font-black text-volt-400">404</p>
      <h1 className="mt-2 text-xl font-black text-white">هذه الصفحة غير موجودة</h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
        يبدو أنك رفعت وزنًا أثقل من اللازم — الصفحة التي تبحث عنها خارج الخزنة.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-l from-volt-500 to-volt-600 px-6 py-3 text-sm font-black text-iron-950 transition-all hover:brightness-110 active:scale-[0.98]"
      >
        <LayoutGrid className="h-4.5 w-4.5" />
        العودة إلى لوحة التحكم
      </Link>
    </main>
  );
}
