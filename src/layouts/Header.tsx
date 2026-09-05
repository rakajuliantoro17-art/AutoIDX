/**
==========================================================
AURA Trade OS
Dashboard Header (Pages Router)
Version : 0.2.0

Perubahan dari 0.1.0: tambah tombol menu mobile (buka drawer
AppSidebar), tombol dark/light, dan popover Status Sistem
(sebelumnya cuma badge mode paper/live -- sekarang operator bisa
lihat 7 subsistem backend langsung dari header tanpa pindah
halaman).
==========================================================
*/

import SystemStatusBadge from "@/components/SystemStatusBadge";
import UserMenu from "@/components/auth/UserMenu";
import SidebarMobileTrigger from "./shell/SidebarMobileTrigger";
import ThemeToggleButton from "./shell/ThemeToggleButton";
import SystemStatusPopover from "./shell/SystemStatusPopover";

export default function Header() {
  return (
    <header className="glass-nav sticky top-0 z-50 border-b">
      <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">

        <div className="flex min-w-0 items-center gap-3">
          <SidebarMobileTrigger />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold md:text-xl">
              Auto<span className="brand-gradient">IDX</span>
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
