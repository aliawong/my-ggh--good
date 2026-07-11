import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Comfy Foot Sales & Product Assistant",
  description:
    "Comfy Foot product catalog, customer inquiries, and sales tracking for the sales team.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <header className="border-b border-brand-200 bg-white sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🦶</span>
              <span className="font-bold text-lg tracking-tight text-brand-700">
                Comfy Foot
              </span>
              <span className="hidden sm:inline text-sm text-neutral-500">
                Sales &amp; Product Assistant
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm font-medium">
              <Link href="/" className="hover:text-brand-600">
                Catalog
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg bg-brand-600 text-white px-3 py-1.5 hover:bg-brand-700"
              >
                Sales Rep Dashboard
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-400">
          Comfy Foot Sales &amp; Product Assistant — internal demo
        </footer>
      </body>
    </html>
  );
}
