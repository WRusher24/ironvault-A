import type { Metadata } from "next";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = { title: "إنشاء حساب جديد" };

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
