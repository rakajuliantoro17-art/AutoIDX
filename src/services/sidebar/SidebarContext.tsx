"use client";

/**
==========================================================
AURA Trade OS
Sidebar Context
Version : 0.1.0

Menyimpan 2 state terpisah:
1. `railCollapsed` -- mode desktop, sidebar diciutkan jadi
   ikon saja. Persisten ke localStorage supaya preferensi user
   tidak reset tiap reload.
2. `mobileOpen` -- drawer off-canvas di tablet/mobile. Sengaja
   TIDAK dipersist (state sesaat, wajar reset tiap kunjungan
   halaman baru).

Dipakai terpisah oleh App Router (AppShell.tsx) dan Pages
Router (_app.tsx) -- dua instance provider berbeda (dua render
tree terpisah di project hybrid ini), tapi localStorage key
railCollapsed yang sama membuat preferensi tetap konsisten
kalau user pindah dari satu sisi ke sisi lain.
==========================================================
*/

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "autoidx-sidebar-rail";

interface SidebarContextValue {
  railCollapsed: boolean;
  toggleRail: () => void;
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {

  const [railCollapsed, setRailCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {

    try {
      setRailCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // localStorage diblokir -- default tidak diciutkan, bukan error fatal.
    }

  }, []);

  const toggleRail = useCallback(() => {

    setRailCollapsed((prev) => {

      const next = !prev;

      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Abaikan kalau localStorage diblokir.
      }

      return next;

    });

  }, []);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen((prev) => !prev), []);

  // Shortcut Ctrl+B / Cmd+B ala Claude -- ciutkan/perluas rail sidebar
  // dari mana saja (kecuali sedang mengetik di input/textarea/contentEditable).
  useEffect(() => {

    function handleKeyDown(event: KeyboardEvent) {

      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() !== "b") return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      const isEditable =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        target?.isContentEditable;

      if (isEditable) return;

      event.preventDefault();
      toggleRail();

    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);

  }, [toggleRail]);

  const value = useMemo(
    () => ({
      railCollapsed,
      toggleRail,
      mobileOpen,
      openMobile,
      closeMobile,
      toggleMobile,
    }),
    [railCollapsed, toggleRail, mobileOpen, openMobile, closeMobile, toggleMobile]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );

}

export function useSidebar(): SidebarContextValue {

  const ctx = useContext(SidebarContext);

  if (!ctx) {
    throw new Error("useSidebar() harus dipakai di dalam <SidebarProvider>.");
  }

  return ctx;

}
