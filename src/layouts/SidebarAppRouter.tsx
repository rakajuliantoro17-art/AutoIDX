"use client";

/**
==========================================================
AURA Trade OS
Dashboard Sidebar (App Router)
Version : 0.0.1 Alpha
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
  { name: "Backtest", path: "/backtest" },
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
