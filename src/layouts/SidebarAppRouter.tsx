"use client";

/**
==========================================================
AURA Trade OS
Dashboard Sidebar (App Router)
Version : 0.0.2 Alpha

Perubahan dari 0.0.1: menu di sini sebelumnya TERTINGGAL dari
Sidebar.tsx (dipakai halaman Pages Router) -- Risk Analytics,
Canary Monitor, ML Lab, dan Transaction History sudah jadi
halaman yang berfungsi, tapi TIDAK ADA LINK ke sana sama sekali
di sidebar ini. Akibatnya begitu user pindah dari /dashboard
(Pages Router, pakai Sidebar.tsx) ke /scanner atau /backtest
(App Router, pakai sidebar INI), menu-menu itu seolah hilang.
Sekarang disamakan supaya konsisten di mana pun halaman dibuka.
==========================================================
*/

import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  name: string;
  path: string;
}

const menus: MenuItem[] = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Scanner", path: "/scanner" },
  { name: "Paper Trading", path: "/dashboard/paper-trading" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Activity", path: "/activity" },
  { name: "Transaction History", path: "/dashboard/history" },
  { name: "Backtest", path: "/backtest" },
  { name: "Risk Analytics", path: "/dashboard/analytics" },
  { name: "Canary Monitor", path: "/dashboard/canary-monitor" },
  { name: "ML Lab (Eksperimental)", path: "/dashboard/ml-lab" },
  { name: "Settings", path: "/dashboard/settings" },
];

export default function SidebarAppRouter() {

  const pathname = usePathname();

  return (
    <aside className="glass-nav hidden md:block w-64 min-h-[calc(100vh-64px)] p-4 border-r">
      <nav className="space-y-1.5">
        {menus.map((menu) => {

          const isActive =
            menu.path === "/dashboard"
              ? pathname === menu.path
              : pathname?.startsWith(menu.path) ?? false;

          return (
            <Link
              key={menu.path}
              href={menu.path}
              aria-current={isActive ? "page" : undefined}
              className={`nav-pill ${isActive ? "active" : ""}`}
            >
              {menu.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
