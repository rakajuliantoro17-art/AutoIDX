"use client";

/**
==========================================================
AURA Trade OS
Sidebar Mobile Trigger (hamburger)
Version : 0.1.1

Cuma tampil di layar sempit (md:hidden) -- di desktop, sidebar
sudah statis (bisa diciutkan lewat tombol rail di AppSidebar,
bukan lewat tombol ini).

Perubahan dari 0.1.0: tombol ini pakai toggleMobile() (bisa
BUKA maupun TUTUP drawer), tapi aria-label & ikonnya sebelumnya
statis seolah-olah cuma untuk membuka -- sekarang ikon & label
ikut status drawer saat ini (hamburger <-> silang, "Buka menu"
<-> "Tutup menu"), sesuai konvensi aksesibilitas tombol toggle.
==========================================================
*/

import { useSidebar } from "@/services/sidebar/SidebarContext";
import { IconClose, IconMenu } from "@/components/icons";

export default function SidebarMobileTrigger() {

  const { mobileOpen, toggleMobile } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggleMobile}
      aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
      aria-expanded={mobileOpen}
      className="glass flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:text-[var(--text)] md:hidden"
    >
      {mobileOpen ? (
        <IconClose className="h-5 w-5" />
      ) : (
        <IconMenu className="h-5 w-5" />
      )}
    </button>
  );

}
