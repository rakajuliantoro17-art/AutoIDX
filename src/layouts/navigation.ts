/**
==========================================================
AURA Trade OS
Shared Navigation Config
Version : 0.1.0 Alpha
==========================================================
Sumber tunggal daftar menu, dipakai baik oleh App Router
maupun Pages Router. Sebelumnya menu didefinisikan terpisah
di Sidebar.tsx dan SidebarAppRouter.tsx dan sudah pernah
"drift" (item baru ditambah di satu tempat tapi lupa di
tempat lain) -- lihat catatan di riwayat SidebarAppRouter.tsx.
Sekarang keduanya memakai file ini.
==========================================================
*/

import type { ComponentType, SVGProps } from "react";
import {
  IconActivity,
  IconBacktest,
  IconCanary,
  IconDashboard,
  IconHistory,
  IconLab,
  IconPaper,
  IconPortfolio,
  IconRisk,
  IconScanner,
  IconSettings,
  IconStrategy,
} from "@/components/icons";

export interface NavItem {
  name: string;
  shortName?: string;
  path: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
  /** Grup sekunder ditampilkan sebagai dropdown yang bisa dilipat. */
  collapsible?: boolean;
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "trading",
    label: "Trading",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: IconDashboard },
      { name: "Scanner", path: "/scanner", icon: IconScanner },
      {
        name: "Paper Trading",
        shortName: "Paper",
        path: "/dashboard/paper-trading",
        icon: IconPaper,
      },
      { name: "Portfolio", path: "/portfolio", icon: IconPortfolio },
    ],
  },
  {
    id: "activity",
    label: "Aktivitas",
    items: [
      { name: "Activity", path: "/activity", icon: IconActivity },
      {
        name: "Transaction History",
        shortName: "History",
        path: "/dashboard/history",
        icon: IconHistory,
      },
      { name: "Backtest", path: "/backtest", icon: IconBacktest },
    ],
  },
  {
    id: "system",
    label: "Sistem",
    collapsible: true,
    items: [
      {
        name: "Risk Analytics",
        shortName: "Risk",
        path: "/dashboard/analytics",
        icon: IconRisk,
      },
      {
        name: "Strategy Control",
        shortName: "Strategy",
        path: "/dashboard/strategy-control",
        icon: IconStrategy,
      },
      {
        name: "Canary Monitor",
        shortName: "Canary",
        path: "/dashboard/canary-monitor",
        icon: IconCanary,
      },
      {
        name: "ML Lab (Eksperimental)",
        shortName: "ML Lab",
        path: "/dashboard/ml-lab",
        icon: IconLab,
      },
      { name: "Settings", path: "/dashboard/settings", icon: IconSettings },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap(
  (group) => group.items,
);

export function isNavItemActive(
  itemPath: string,
  pathname: string | null,
): boolean {
  if (!pathname) return false;

  if (itemPath === "/dashboard") {
    return pathname === itemPath;
  }

  return pathname.startsWith(itemPath);
}
