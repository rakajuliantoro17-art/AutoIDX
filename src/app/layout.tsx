/**
==========================================================
AURA Trade OS
Root Layout
Version : 0.0.1 Alpha
==========================================================
*/

import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoIDX • Automated Indodax Trading Engine",
  description:
    "AI-powered automated crypto trading dashboard for Indodax.",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>

        {/* ===========================
            Header
        ============================ */}

        <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/30">

          <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">

            {/* Logo */}

            <div className="flex items-center gap-3">

              <Image
                src="/logo.png"
                alt="AutoIDX"
                width={42}
                height={42}
                priority
              />

              <div>

                <h1 className="text-lg font-bold tracking-wide">

                  Auto<span className="text-sky-400">IDX</span>

                </h1>

                <p className="text-xs text-slate-400">

                  Automated Trading Engine

                </p>

              </div>

            </div>

            {/* Status */}

            <div className="flex items-center gap-3">

              <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />

              <span className="text-sm text-slate-300">

                Paper Trading

              </span>

            </div>

          </div>

        </header>

        {/* ===========================
            Main
        ============================ */}

        <main className="max-w-7xl mx-auto px-6 py-8">

          {children}

        </main>

        {/* ===========================
            Footer
        ============================ */}

        <footer className="border-t border-white/10 mt-12">

          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-2">

            <span className="text-sm text-slate-500">

              © 2026 AutoIDX — Automated Indodax Trading Engine

            </span>

            <span className="text-xs text-slate-600">

              Version 0.0.1 Alpha

            </span>

          </div>

        </footer>

      </body>
    </html>
  );
}
