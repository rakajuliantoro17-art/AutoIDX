"use client";

/**
==========================================================
AURA Trade OS
App Shell (App Router)
Version : 0.1.0

Dipisah dari src/app/layout.tsx supaya layout.tsx bisa tetap
Server Component (butuh `export const metadata`, yang tidak
boleh ada di file "use client"). Semua yang butuh hook client
(usePathname, ThemeProvider, SidebarProvider) tinggal di sini.
==========================================================
*/

import Image from "next/image";
import { usePathname } from "next/navigation";
import RouteGuard from "@/components/auth/RouteGuard";
import UserMenu from "@/components/auth/UserMenu";
import AppSidebar from "./AppSidebar";
import SidebarMobileTrigger from "./SidebarMobileTrigger";
import ThemeToggleButton from "./ThemeToggleButton";
import SystemStatusPopover from "./SystemStatusPopover";
import SystemStatusBadge from "@/components/SystemStatusBadge";
import { ThemeProvider } from "@/services/theme/ThemeContext";
import { SidebarProvider } from "@/services/sidebar/SidebarContext";

export default function AppShell({ children }: { children: React.ReactNode }) {

  const pathname = usePathname();

  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex min-h-screen flex-col">

          {/* ===============================================
              HEADER
          =============================================== */}
          <header className="glass-nav sticky top-0 z-50 border-b">
            <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">

              <div className="flex min-w-0 items-center gap-3">
                <SidebarMobileTrigger />
                <Image
                  src="/logo.png"
                  alt="AutoIDX Logo"
                  width={38}
                  height={38}
                  priority
                  className="shrink-0"
                />
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-bold tracking-wide">
                    <span className="brand-gradient">AutoIDX</span>
                  </h1>
                  <p className="hidden text-xs text-[var(--text-muted)] sm:block">
                    Automated Trading Engine
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <SystemStatusPopover />
                <ThemeToggleButton />
                <SystemStatusBadge />
                <UserMenu />
              </div>

            </div>
          </header>

          {/* ===============================================
              SIDEBAR + MAIN CONTENT
          =============================================== */}
          <div className="flex flex-1">
            <AppSidebar pathname={pathname} />
            <main className="w-full flex-1 px-4 py-6 md:px-6 md:py-8">
              <RouteGuard>{children}</RouteGuard>
            </main>
          </div>

          {/* ===============================================
              FOOTER
          =============================================== */}
          <footer className="glass-nav mt-auto border-t">
            <div className="flex flex-col items-center justify-between gap-2 px-4 py-6 md:flex-row md:px-6">
              <span className="text-sm text-[var(--text-muted)]">
                © 2026 AutoIDX — Automated Indodax Trading Engine
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                Version 0.0.2 Alpha
              </span>
            </div>
          </footer>

        </div>
      </SidebarProvider>
    </ThemeProvider>
  );

}
