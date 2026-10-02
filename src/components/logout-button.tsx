"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { api } from "@/lib/http";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await api("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={() => void logout()}
      disabled={busy}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 py-4 text-sm font-black text-rose-300 transition-all hover:bg-rose-500/20 active:scale-[0.98] disabled:opacity-50"
    >
      <LogOut className="h-4.5 w-4.5" />
      {busy ? "جارٍ تسجيل الخروج..." : "تسجيل الخروج"}
    </button>
  );
}
