import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lead Capture",
  description: "Simple lead capture demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold text-slate-900">
              Lead Capture
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/" className="text-slate-600 hover:text-slate-900">
                Home
              </Link>
              <Link href="/leads" className="text-slate-600 hover:text-slate-900">
                Leads
              </Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
