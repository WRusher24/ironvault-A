import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "آيرون فالت — IronVault | خزنة أرقامك القياسية",
    template: "%s | آيرون فالت",
  },
  description:
    "منصة تتبع الحمل التدريجي والأرقام القياسية في صالة الحديد — سجّل أوزانك، تابع تقدمك، واحتفل بأرقامك القياسية.",
  applicationName: "IronVault",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="iron-backdrop min-h-dvh antialiased">
        <div className="iron-grid min-h-dvh">{children}</div>
      </body>
    </html>
  );
}
