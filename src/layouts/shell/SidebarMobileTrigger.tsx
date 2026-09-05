"use client";

/**
==========================================================
AURA Trade OS
Sidebar Mobile Trigger (hamburger)
Version : 0.1.0

Cuma tampil di layar sempit (md:hidden) -- di desktop, sidebar
sudah statis (bisa diciutkan lewat tombol rail di AppSidebar,
bukan lewat tombol ini).
==========================================================
*/

import { useSidebar } from "@/services/sidebar/SidebarContext";
import { IconMenu } from "@/components/icons";

export default function SidebarMobileTrigger() {

  const { toggleMobile } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggleMobile}
      aria-label="Buka menu"
      className="glass flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:text-[var(--text)] md:hidden"
    >
      <IconMenu className="h-5 w-5" />
    </button>
  );

}
