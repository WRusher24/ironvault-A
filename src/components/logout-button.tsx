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
      className="flex w-full items-center justify-center gap-2 rounded-2xl border py-4 text-sm font-black transition-all hover:opacity-80 active:scale-[0.98] disabled:opacity-50"
      style={{ borderColor: "var(--color-accent)", background: "var(--color-accent-soft)", color: "var(--color-accent-text)" }}
    >
      <LogOut className="h-4.5 w-4.5" />
      {busy ? "Logging out..." : "Log out"}
    </button>
  );
}
