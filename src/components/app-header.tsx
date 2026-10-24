import Link from "next/link";
import Image from "next/image";

/**
 * Brand bar for the authenticated app shell.
 *
 * Deliberately NOT sticky: the dashboard search field and the history list
 * already use `sticky top-3` within this column, so a sticky bar here would
 * fight them for the same offset. This scrolls away with the content and
 * leaves every existing sticky behaviour untouched.
 */
export default function AppHeader() {
  return (
    <header
      className="flex items-center border-b px-4 pb-3"
      style={{
        borderColor: "var(--color-card-border)",
        // viewportFit is "cover" and the app can run standalone (saved to the
        // iOS home screen), so clear the status bar / notch. No-op in a browser.
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)",
      }}
    >
      <Link
        href="/dashboard"
        aria-label="IronVault — Dashboard"
        className="group flex items-center gap-2.5 rounded-xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
      >
        <Image
          src="/logo.svg"
          alt="IronVault logo"
          width={36}
          height={36}
          unoptimized
          priority
          className="h-9 w-9 shrink-0"
        />
        <span
          className="text-lg font-black tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          Iron<span style={{ color: "var(--color-accent)" }}>Vault</span>
        </span>
      </Link>
    </header>
  );
}
