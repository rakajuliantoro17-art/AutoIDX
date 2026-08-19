/**
==========================================================
AURA Trade OS
Root Layout
Version : 0.0.3 Alpha
==========================================================
*/
import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";
import { AuthProvider } from "@/services/auth/AuthContext";
import RouteGuard from "@/components/auth/RouteGuard";
import UserMenu from "@/components/auth/UserMenu";
import SidebarAppRouter from "@/layouts/SidebarAppRouter";
import SystemStatusBadge from "@/components/SystemStatusBadge";

export const metadata: Metadata = {
  title: "AutoIDX • Automated Indodax Trading Engine",
  description: "AI-powered automated crypto trading dashboard for Indodax.",
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
      <body className="antialiased">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            {/* =====================================================
                HEADER
            ===================================================== */}
            <header className="glass-nav sticky top-0 z-50 border-b">
              <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
                {/* LOGO */}
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="AutoIDX Logo"
                    width={42}
                    height={42}
                    priority
                  />
                  <div>
                    <h1 className="text-lg font-bold tracking-wide">
                      <span className="brand-gradient">AutoIDX</span>
                    </h1>
                    <p className="text-xs text-slate-400">
                      Automated Trading Engine
                    </p>
                  </div>
                </div>
                {/* SYSTEM STATUS + USER MENU */}
                <div className="flex items-center gap-5">
                  <SystemStatusBadge />
                  <UserMenu />
                </div>
              </div>
            </header>

            {/* =====================================================
                SIDEBAR + MAIN CONTENT
            ===================================================== */}
            <div className="flex flex-1">
              <SidebarAppRouter />
              <main className="flex-1 w-full px-6 py-8">
                <RouteGuard>{children}</RouteGuard>
              </main>
            </div>

            {/* =====================================================
                FOOTER
            ===================================================== */}
            <footer className="glass-nav border-t mt-auto">
              <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-2">
                <span className="text-sm text-slate-500">
                  © 2026 AutoIDX — Automated Indodax Trading Engine
                </span>
                <span className="text-xs text-slate-600">
                  Version 0.0.2 Alpha
                </span>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
