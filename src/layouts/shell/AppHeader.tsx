"use client";

/**
==========================================================
AURA Trade OS
App Header (unified — App Router & Pages Router)
Version : 0.1.0
==========================================================
Sebelumnya markup header ada 2 tempat berbeda:
1. Inline di AppShell.tsx (App Router) -- pakai logo gambar
   (/logo.png) + teks "AutoIDX" penuh dengan gradient.
2. src/layouts/Header.tsx (Pages Router) -- TANPA logo gambar,
   cuma teks "Auto" + "IDX" bergradasi.

Sekarang disatukan di sini (versi lengkap dengan logo dipakai),
supaya kedua router menghasilkan header yang identik.
==========================================================
*/

import Image from "next/image";
import UserMenu from "@/components/auth/UserMenu";
import SystemStatusBadge from "@/components/SystemStatusBadge";
import SidebarMobileTrigger from "./SidebarMobileTrigger";
import ThemeToggleButton from "./ThemeToggleButton";
import SystemStatusPopover from "./SystemStatusPopover";

export default function AppHeader() {
  return (
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
  );
}
