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
