"use client";

/**
==========================================================
AURA Trade OS
App Sidebar (unified — App Router & Pages Router)
Version : 0.1.0

Menggantikan SidebarAppRouter.tsx (App Router) & Sidebar.tsx
(Pages Router) yang tadinya dua daftar menu terpisah dan pernah
"drift" (lihat catatan riwayat di navigation.ts). Sekarang satu
komponen, dapat `pathname` sebagai PROP (bukan panggil hook
router sendiri) supaya bisa dipakai dari kedua sisi:
- App Router : dipanggil dari AppShell.tsx dengan usePathname()
- Pages Router: dipanggil dari DashboardLayout.tsx dengan
  useRouter().pathname

3 mode tampilan:
1. Desktop lebar penuh (default)
2. Desktop rail mode (diciutkan jadi ikon, toggle tersimpan
   localStorage lewat useSidebar())
3. Mobile/tablet: drawer off-canvas dengan overlay gelap,
   dibuka lewat SidebarMobileTrigger di header

Grup "Sistem" (lihat navigation.ts, `collapsible: true`)
ditampilkan sebagai accordion yang bisa dilipat -- state lipat
disimpan per grup di localStorage supaya tidak collapse ulang
tiap reload. Grup yang sedang berisi halaman aktif SELALU
dipaksa terbuka, apa pun state tersimpannya.
==========================================================
*/

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSidebar } from "@/services/sidebar/SidebarContext";
import { NAV_GROUPS, isNavItemActive } from "@/layouts/navigation";
import { IconChevronDown, IconChevronsLeft, IconClose } from "@/components/icons";

const ACCORDION_STORAGE_KEY = "autoidx-sidebar-open-groups";

function readOpenGroups(): Record<string, boolean> {

  if (typeof window === "undefined") return {};

  try {

    const raw = window.localStorage.getItem(ACCORDION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};

  } catch {

    return {};

  }

}

interface AppSidebarProps {
  pathname: string | null;
}

export default function AppSidebar({ pathname }: AppSidebarProps) {

  const { railCollapsed, toggleRail, mobileOpen, closeMobile } = useSidebar();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenGroups(readOpenGroups());
  }, []);

  const toggleGroup = (groupId: string) => {

    setOpenGroups((prev) => {

      const next = { ...prev, [groupId]: !(prev[groupId] !== false) };

      try {
        window.localStorage.setItem(ACCORDION_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Abaikan kalau localStorage diblokir.
      }

      return next;

    });

  };

  const content = (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-5">

      {NAV_GROUPS.map((group) => {

        const forceOpen = group.items.some((item) =>
          isNavItemActive(item.path, pathname)
        );

        const savedOpen = openGroups[group.id] !== false;
        const isOpen = !group.collapsible || forceOpen || savedOpen;

        return (
          <div key={group.id}>

            {!railCollapsed && group.collapsible ? (
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={isOpen}
                className="mb-1.5 flex w-full items-center justify-between px-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] transition hover:text-[var(--text-secondary)]"
              >
                <span>{group.label}</span>
                <IconChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            ) : !railCollapsed ? (
              <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {group.label}
              </p>
            ) : null}

            {(isOpen || railCollapsed) && (
              <div className="space-y-1">

                {group.items.map((item) => {

                  const active = isNavItemActive(item.path, pathname);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={closeMobile}
                      aria-current={active ? "page" : undefined}
                      title={railCollapsed ? item.name : undefined}
                      className={`nav-pill flex items-center gap-3 ${
                        active ? "active" : ""
                      } ${railCollapsed ? "justify-center px-0" : ""}`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {!railCollapsed && (
                        <span className="truncate">
                          {item.shortName ?? item.name}
                        </span>
                      )}
                    </Link>
                  );

                })}

              </div>
            )}

          </div>
        );

      })}

      {/* Toggle rail mode -- cuma tampil desktop */}
      <button
        type="button"
        onClick={toggleRail}
        className="mt-auto hidden items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] py-2.5 text-xs text-[var(--text-muted)] transition hover:text-[var(--text-secondary)] md:flex"
        title={`${railCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"} (Ctrl+B)`}
      >
        <IconChevronsLeft
          className={`h-4 w-4 transition-transform ${
            railCollapsed ? "rotate-180" : ""
          }`}
        />
        {!railCollapsed && (
          <span className="flex items-center gap-1.5">
            Ciutkan
            <kbd className="rounded border border-[var(--border)] px-1 py-0.5 text-[10px] leading-none text-[var(--text-muted)]">
              Ctrl+B
            </kbd>
          </span>
        )}
      </button>

    </nav>
  );

  return (
    <>
      {/* Desktop / tablet-lebar: sidebar statis (rail atau penuh) */}
      <aside
        className={`glass-nav sticky top-16 hidden h-[calc(100vh-64px)] shrink-0 border-r transition-[width] duration-300 md:block ${
          railCollapsed ? "w-[76px]" : "w-64"
        }`}
      >
        {content}
      </aside>

      {/* Mobile / tablet sempit: drawer off-canvas + overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`glass-nav fixed inset-y-0 left-0 z-[70] w-72 border-r transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <span className="text-sm font-semibold text-[var(--text-secondary)]">
            Menu
          </span>
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Tutup menu"
            className="rounded-full p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
        {content}
      </aside>
    </>
  );

}
