"use client";

/**
==========================================================
AURA Trade OS
System Status Popover
Version : 0.1.1

Gabungan SystemStatusTrigger (ikon ringkas di header) +
SystemStatusPanel (daftar 7 subsistem lengkap) jadi satu
popover yang bisa ditutup klik di luar area popover-nya.

CATATAN PERBAIKAN (v0.1.1):
1. Dropdown dipasang lewat createPortal(..., document.body) --
   BUKAN dirender sebagai anak langsung di sini. Header
   (.glass-nav) pakai backdrop-filter, yang menurut spec CSS
   menjadikannya "containing block" baru untuk keturunan
   position:fixed di browser modern -- tanpa portal, fixed di
   dalam header dihitung relatif ke kotak header (tinggi 64px),
   bukan ke viewport, sehingga dropdown terpotong di bagian atas.
2. Positioning dropdown pakai class CSS manual ".system-status-
   panel" (lihat globals.css), BUKAN Tailwind arbitrary-class
   "max-h-[calc(100vh-5.5rem)]" -- versi itu invalid karena
   calc() wajib ada spasi di sekitar operator -/+, jadi properti
   (dan kemungkinan rule di sekitarnya saat di-minify) di-drop
   diam-diam oleh browser/build, membuat dropdown ke-render tapi
   tidak pernah terlihat.
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

      {open && mounted && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Status sistem"
          className="glass system-status-panel"
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
