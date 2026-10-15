"use client";

/**
==========================================================
AURA Trade OS
Header Menu (badge gear) -- mengumpulkan isi navbar atas
==========================================================
Satu badge gear di header menggantikan deretan tombol yang
saling bertumpuk di layar HP. Klik gear -> dropdown berisi:
notifikasi, status subsistem, tema, mode (klik lagi untuk
memilih Paper/Live), dan akun. Panel tetap ter-mount saat
tertutup (hanya disembunyikan) supaya hitungan notifikasi
dan status mode di badge tetap hidup.
==========================================================
*/

import { useCallback, useEffect, useRef, useState } from "react";
import { IconChevronDown, IconSettings } from "@/components/icons";
import SystemStatusBadge, { type StatusTone } from "@/components/SystemStatusBadge";
import UserMenu from "@/components/auth/UserMenu";
import { useAuth } from "@/services/auth/AuthContext";
import NotificationBell from "./NotificationBell";
import SystemStatusPopover from "./SystemStatusPopover";
import ThemeToggleButton from "./ThemeToggleButton";
import ModeSwitcher from "./ModeSwitcher";

const TONE_DOT: Record<StatusTone, string> = {
  ok: "bg-emerald-400",
  warn: "bg-amber-400",
  danger: "bg-red-500",
};

export default function HeaderMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [modesOpen, setModesOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [tone, setTone] = useState<StatusTone>("warn");
  const [refreshKey, setRefreshKey] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent | TouchEvent) {
      const t = e.target as Element | null;
      if (!t) return;
      if (rootRef.current?.contains(t)) return;
      // Panel notifikasi/status dirender lewat portal -- jangan dianggap "di luar".
      if (t.closest("[data-keep-open], [role=dialog]")) return;
      setOpen(false);
      setModesOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setModesOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onUnread = useCallback((n: number) => setUnread(n), []);
  const onTone = useCallback((t: StatusTone) => setTone(t), []);

  const caption = "mt-1 text-[10px] text-[var(--text-muted)]";

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (open) setModesOpen(false);
        }}
        aria-label={`Menu pengaturan${unread ? `, ${unread} notifikasi baru` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        className="glass relative flex h-10 items-center gap-2 rounded-full px-3 text-[var(--text-secondary)] transition hover:text-[var(--text)]"
      >
        <IconSettings className={`h-5 w-5 transition-transform ${open ? "rotate-90" : ""}`} />
        <span className={`h-2.5 w-2.5 rounded-full ${TONE_DOT[tone]}`} aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <div
        role="menu"
        hidden={!open}
        className="absolute right-0 top-12 z-[70] w-[min(92vw,20rem)] max-h-[calc(100vh-5.5rem)] overflow-y-auto rounded-2xl border border-white/10 bg-[var(--background-secondary)] p-3 shadow-xl"
      >
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center">
            <NotificationBell onUnread={onUnread} />
            <span className={caption}>Notifikasi</span>
          </div>
          <div className="flex flex-col items-center">
            <SystemStatusPopover />
            <span className={caption}>Sistem</span>
          </div>
          <div className="flex flex-col items-center">
            <ThemeToggleButton />
            <span className={caption}>Tema</span>
          </div>
        </div>

        <div className="mt-3 border-t border-white/10 pt-3">
          <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Mode trading
          </p>
          <button
            type="button"
            onClick={() => setModesOpen((v) => !v)}
            aria-expanded={modesOpen}
            className="flex w-full items-center justify-between gap-2 rounded-xl text-left"
          >
            <SystemStatusBadge refreshKey={refreshKey} onTone={onTone} />
            <IconChevronDown
              className={`mr-1 h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform ${modesOpen ? "rotate-180" : ""}`}
            />
          </button>
          {modesOpen && user && <ModeSwitcher onChanged={() => setRefreshKey((k) => k + 1)} />}
        </div>

        <div className="mt-3 flex justify-end border-t border-white/10 pt-3">
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
