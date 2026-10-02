"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dumbbell,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Smartphone,
  UserRound,
  LoaderCircle,
  ShieldCheck,
  Zap,
  TrendingUp,
} from "lucide-react";
import { api, ApiError } from "@/lib/http";

type Props = { mode: "login" | "register" };

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const isRegister = mode === "register";

  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api(`/api/auth/${mode}`, {
        method: "POST",
        json: isRegister ? { name, identifier, password } : { identifier, password },
      });
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "حدث خطأ غير متوقع");
      setLoading(false);
    }
  }

  const idIsEmail = identifier.includes("@");

  return (
    <div className="anim-fade-up w-full max-w-md">
      {/* Brand */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="volt-glow relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-volt-500 to-ice-500">
          <Dumbbell className="h-10 w-10 text-iron-900" strokeWidth={2.4} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white">
          آيرون <span className="text-volt-400">فالت</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          خزنة أرقامك القياسية في الحديد — IronVault
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-extrabold text-white">
          {isRegister ? "أنشئ خزنتك الخاصة" : "افتح خزنتك"}
        </h2>
        <p className="mt-1 mb-6 text-sm leading-relaxed text-slate-400">
          {isRegister
            ? "حساب جديد، وصول فوري — لا حاجة لأي موافقة. بياناتك ملكك وحدك."
            : "سجّل دخولك وواصل من حيث توقفت. الحديد لا ينتظر."}
        </p>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {isRegister && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-300">الاسم</span>
              <div className="relative">
                <UserRound className="pointer-events-none absolute start-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  required
                  minLength={2}
                  placeholder="مثال: أحمد بطل الحديد"
                  className="w-full rounded-xl border border-iron-600 bg-iron-850 py-3 pe-4 ps-11 text-sm text-white placeholder:text-slate-500 focus:border-volt-500 focus:outline-none focus:ring-2 focus:ring-volt-500/25"
                />
              </div>
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-300">
              البريد الإلكتروني أو رقم الهاتف
            </span>
            <div className="relative">
              {idIsEmail ? (
                <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
              ) : (
                <Smartphone className="pointer-events-none absolute start-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
              )}
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                type="text"
                inputMode="email"
                dir="ltr"
                required
                placeholder="you@email.com أو +9655XXXXXXX"
                className="w-full rounded-xl border border-iron-600 bg-iron-850 py-3 pe-4 ps-11 text-start text-sm text-white placeholder:text-slate-500 focus:border-volt-500 focus:outline-none focus:ring-2 focus:ring-volt-500/25"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-300">كلمة المرور</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                minLength={isRegister ? 8 : 1}
                placeholder={isRegister ? "٨ أحرف على الأقل" : "كلمة المرور"}
                className="w-full rounded-xl border border-iron-600 bg-iron-850 py-3 pe-11 ps-11 text-sm text-white placeholder:text-slate-500 focus:border-volt-500 focus:outline-none focus:ring-2 focus:ring-volt-500/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition-colors hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </label>

          {error && (
            <div
              role="alert"
              className="anim-pop rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-l from-volt-500 to-volt-600 py-3.5 text-sm font-black text-iron-950 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {loading
                ? "لحظات..."
                : isRegister
                  ? "إنشاء الحساب والدخول فورًا"
                  : "تسجيل الدخول"}
            </span>
          </button>
        </form>

        <div className="mt-6 border-t border-iron-700 pt-5 text-center text-sm text-slate-400">
          {isRegister ? (
            <>
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="font-bold text-volt-400 transition-colors hover:text-volt-300">
                سجّل الدخول
              </Link>
            </>
          ) : (
            <>
              مستخدم جديد؟{" "}
              <Link href="/register" className="font-bold text-volt-400 transition-colors hover:text-volt-300">
                أنشئ حسابك مجانًا
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Trust strip */}
      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        {[
          { icon: ShieldCheck, label: "عزل كامل للبيانات" },
          { icon: Zap, label: "تسجيل فوري" },
          { icon: TrendingUp, label: "تتبع الحمل التدريجي" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 rounded-2xl border border-iron-700/70 bg-iron-850/60 px-2 py-3">
            <Icon className="h-4.5 w-4.5 text-volt-400" />
            <span className="text-[10px] font-bold leading-tight text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
