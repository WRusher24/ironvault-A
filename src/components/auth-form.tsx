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
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const idIsEmail = identifier.includes("@");

  return (
    <div className="anim-fade-up w-full max-w-md">
      {/* Brand */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="coral-glow relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl" style={{ background: "var(--color-accent)" }}>
          <Dumbbell className="h-10 w-10 text-white" strokeWidth={2.4} />
        </div>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--color-text)" }}>
          Iron<span style={{ color: "var(--color-accent)" }}>Vault</span>
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Your personal PR vault — track progressive overload
        </p>
      </div>

      <div className="clean-card rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-extrabold" style={{ color: "var(--color-text)" }}>
          {isRegister ? "Create your vault" : "Open your vault"}
        </h2>
        <p className="mt-1 mb-6 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          {isRegister
            ? "New account, instant access — no approval needed. Your data is yours alone."
            : "Log in and pick up where you left off. Iron never waits."}
        </p>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {isRegister && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>Name</span>
              <div className="relative">
                <UserRound className="pointer-events-none absolute start-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2" style={{ color: "var(--color-text-faint)" }} />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  required
                  minLength={2}
                  placeholder="e.g. Ahmed, Iron Champion"
                  className="w-full rounded-xl border py-3 pe-4 ps-11 text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--color-card-border)",
                    background: "var(--color-input-bg)",
                    color: "var(--color-text)",
                    "--tw-ring-color": "var(--color-accent)",
                  } as React.CSSProperties}
                />
              </div>
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>
              Email or phone number
            </span>
            <div className="relative">
              {idIsEmail ? (
                <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2" style={{ color: "var(--color-text-faint)" }} />
              ) : (
                <Smartphone className="pointer-events-none absolute start-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2" style={{ color: "var(--color-text-faint)" }} />
              )}
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                type="text"
                inputMode="email"
                dir="ltr"
                required
                placeholder="you@email.com or +9655XXXXXXX"
                className="w-full rounded-xl border py-3 pe-4 ps-11 text-start text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--color-card-border)",
                  background: "var(--color-input-bg)",
                  color: "var(--color-text)",
                  "--tw-ring-color": "var(--color-accent)",
                } as React.CSSProperties}
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2" style={{ color: "var(--color-text-faint)" }} />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                minLength={isRegister ? 8 : 1}
                placeholder={isRegister ? "At least 8 characters" : "Your password"}
                className="w-full rounded-xl border py-3 pe-11 ps-11 text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--color-card-border)",
                  background: "var(--color-input-bg)",
                  color: "var(--color-text)",
                  "--tw-ring-color": "var(--color-accent)",
                } as React.CSSProperties}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-1 transition-colors"
                style={{ color: "var(--color-text-faint)" }}
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </label>

          {error && (
            <div
              role="alert"
              className="anim-pop rounded-xl border px-4 py-3 text-sm font-semibold"
              style={{ borderColor: "var(--color-accent)", background: "var(--color-accent-soft)", color: "var(--color-accent-text)" }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-black text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            style={{ background: "var(--color-accent)" }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {loading
                ? "One moment..."
                : isRegister
                  ? "Create account & enter instantly"
                  : "Log in"}
            </span>
          </button>
        </form>

        <div className="mt-6 border-t pt-5 text-center text-sm" style={{ borderColor: "var(--color-card-border)", color: "var(--color-text-muted)" }}>
          {isRegister ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-bold transition-colors" style={{ color: "var(--color-accent)" }}>
                Log in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/register" className="font-bold transition-colors" style={{ color: "var(--color-accent)" }}>
                Create your free account
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Trust strip */}
      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        {[
          { icon: ShieldCheck, label: "Full data isolation" },
          { icon: Zap, label: "Instant logging" },
          { icon: TrendingUp, label: "Progressive overload tracking" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3" style={{ borderColor: "var(--color-card-border)", background: "var(--color-card)" }}>
            <Icon className="h-4.5 w-4.5" style={{ color: "var(--color-accent)" }} />
            <span className="text-[10px] font-bold leading-tight" style={{ color: "var(--color-text-muted)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
