import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "IronVault — Your PR Vault",
    template: "%s | IronVault",
  },
  description:
    "Track progressive overload and personal records in the gym — log your weights, follow your progress, and celebrate your PRs.",
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
  themeColor: "#F6F4F1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={inter.variable}>
      <body className="paper-backdrop min-h-dvh antialiased">
        <ThemeProvider>
          <div className="paper-grid min-h-dvh">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
