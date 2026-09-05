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
import SystemStatusPanel, {
  SystemStatusTrigger,
} from "@/components/SystemStatusPanel";

export default function SystemStatusPopover() {

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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
    <div ref={containerRef} className="relative">

      <SystemStatusTrigger open={open} onClick={() => setOpen((v) => !v)} />

      {open && (
        <div
          role="dialog"
          aria-label="Status sistem"
          className="glass fixed left-4 right-4 top-[4.25rem] z-[80] max-h-[calc(100vh-5.5rem)] overflow-y-auto p-3
                     sm:left-auto sm:right-4 sm:w-80"
        >
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Status Subsistem
          </p>
          <SystemStatusPanel />
        </div>
      )}

    </div>
  );

}
