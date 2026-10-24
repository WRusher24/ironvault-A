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
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32 48x48" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "IronVault",
    statusBarStyle: "black",
  },
  // Next emits the standard `mobile-web-app-capable`; older iOS Safari still
  // keys off the apple-prefixed variant when saving to the home screen.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
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
