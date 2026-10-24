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
    <header className="flex items-center border-b border-iron-700/50 px-4 pb-3 pt-4">
      <Link
        href="/dashboard"
        aria-label="آيرون فالت — لوحة التحكم"
        className="group flex items-center gap-2.5 rounded-xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-volt-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-iron-900"
      >
        <Image
          src="/logo.svg"
          alt="شعار آيرون فالت"
          width={36}
          height={36}
          unoptimized
          priority
          className="h-9 w-9 shrink-0"
        />
        <span className="text-lg font-black tracking-tight text-white">
          Iron<span className="text-volt-400">Vault</span>
        </span>
      </Link>
    </header>
  );
}
