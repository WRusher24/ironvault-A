import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import BottomNav from "@/components/bottom-nav";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="relative z-10 mx-auto min-h-dvh w-full max-w-lg pb-28">
      {children}
      <BottomNav />
    </div>
  );
}
