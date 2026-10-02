"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  History,
  Plus,
  Download,
  UserRound,
} from "lucide-react";
import LogPrSheet from "@/components/log-pr-sheet";

const items = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutGrid },
  { href: "/history", label: "السجل", icon: History },
  { href: "/export", label: "التصدير", icon: Download },
  { href: "/profile", label: "حسابي", icon: UserRound },
] as const;

/**
 * Fixed, thumb-friendly bottom nav with a raised neon FAB for logging PRs.
 * Order (RTL → first item renders rightmost): الرئيسية، السجل، +، التصدير، حسابي
 */
export default function BottomNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [presetExercise, setPresetExercise] = useState<string | null>(null);

  // Detail pages can ask the FAB to open pre-targeted at one exercise.
  useEffect(() => {
    const handler = ((e: CustomEvent<{ exerciseId?: string }>) => {
      setPresetExercise(e.detail?.exerciseId ?? null);
      setSheetOpen(true);
    }) as EventListener;
    window.addEventListener("ironvault:log", handler);
    return () => window.removeEventListener("ironvault:log", handler);
  }, []);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto w-full max-w-lg">
          <div className="relative border-t border-iron-600/80 bg-iron-850/90 backdrop-blur-xl">
            {/* Raised center FAB — visible from anywhere, per product spec */}
            <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2">
              <button
                onClick={() => {
                  setPresetExercise(null);
                  setSheetOpen(true);
                }}
                aria-label="تسجيل رقم قياسي جديد"
                className="anim-pulse-ring pointer-events-auto flex h-15 w-15 items-center justify-center rounded-full bg-gradient-to-br from-volt-400 to-volt-600 text-iron-950 shadow-[0_10px_35px_-8px_rgba(34,197,94,0.8)] transition-transform hover:scale-105 active:scale-95"
              >
                <Plus className="h-7 w-7" strokeWidth={3} />
              </button>
            </div>

            <div className="grid grid-cols-5 items-center px-1">
              <NavItem item={items[0]} pathname={pathname} />
              <NavItem item={items[1]} pathname={pathname} />
              <div className="flex h-16 items-end justify-center pb-1.5">
                <span className="text-[10px] font-black text-volt-400">تسجيل قياسي</span>
              </div>
              <NavItem item={items[2]} pathname={pathname} />
              <NavItem item={items[3]} pathname={pathname} />
            </div>
          </div>
        </div>
      </nav>

      <LogPrSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        presetExerciseId={presetExercise}
        key={presetExercise ?? "blank"}
      />
    </>
  );
}

function NavItem({
  item,
  pathname,
}: {
  item: (typeof items)[number];
  pathname: string;
}) {
  const active = pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`relative flex h-16 flex-col items-center justify-center gap-1 transition-colors ${
        active ? "text-volt-400" : "text-slate-500 hover:text-slate-300"
      }`}
    >
      {active && (
        <span className="absolute top-0 h-0.5 w-8 rounded-full bg-volt-400 shadow-[0_0_12px_rgba(34,197,94,0.9)]" />
      )}
      <Icon className="h-5.5 w-5.5" strokeWidth={active ? 2.4 : 2} />
      <span className="text-[10px] font-bold">{item.label}</span>
    </Link>
  );
}
