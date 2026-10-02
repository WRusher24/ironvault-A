import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return (
    <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      {children}
    </main>
  );
}
