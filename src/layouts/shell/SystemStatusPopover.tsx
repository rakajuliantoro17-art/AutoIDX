"use client";

/**
==========================================================
AURA Trade OS
System Status Popover
Version : 0.1.0

Gabungan SystemStatusTrigger (ikon ringkas di header) +
SystemStatusPanel (daftar 7 subsistem lengkap) jadi satu
popover yang bisa ditutup klik di luar area popover-nya.
==========================================================
*/

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SystemStatusPanel, {
  SystemStatusTrigger,
} from "@/components/SystemStatusPanel";

export default function SystemStatusPopover() {

  const [open, setOpen] = useState(false);

  // Portal cuma boleh dipanggil di client (butuh document) --
  // "mounted" mencegah mismatch SSR/hydration.
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {

    if (!open) return;

    function handleClickOutside(event: MouseEvent) {

      const target = event.target as Node;

      const clickedTrigger = triggerRef.current?.contains(target);
      const clickedPanel = panelRef.current?.contains(target);

      if (!clickedTrigger && !clickedPanel) {
        setOpen(false);
      }

    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };

  }, [open]);

  return (
    <div ref={triggerRef} className="relative">

      <SystemStatusTrigger open={open} onClick={() => setOpen((v) => !v)} />

      {/* ==========================================================
          Dipasang lewat portal ke document.body -- BUKAN dirender
          di sini. Header (.glass-nav) pakai backdrop-filter, yang
          menjadikannya "containing block" baru untuk anak
          position:fixed di browser modern. Akibatnya fixed di
          dalam header dihitung relatif ke kotak header (tinggi
          64px), bukan ke viewport -- dropdown jadi terpotong di
          bagian atas. Portal ke body melepaskan dropdown dari
          jebakan itu sepenuhnya.
      ========================================================== */}
      {open && mounted && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Status sistem"
          className="glass fixed left-4 right-4 top-[4.25rem] z-[80] max-h-[calc(100vh-5.5rem)] overflow-y-auto p-3
                     sm:left-auto sm:right-4 sm:w-80"
        >
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Status Subsistem
          </p>
          <SystemStatusPanel compact />
        </div>,
        document.body
      )}

    </div>
  );

}
