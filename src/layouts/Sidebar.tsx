/**
==========================================================
AURA Trade OS
Dashboard Sidebar
Version : 0.0.2 Alpha
==========================================================
*/
import Link from "next/link";
import { useRouter } from "next/router";

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
  { name: "ML Lab (Eksperimental)", path: "/dashboard/ml-lab" },
  { name: "Settings", path: "/dashboard/settings" },
];

export default function Sidebar() {
  const router = useRouter();
  return (
    <aside className="glass-nav hidden md:block w-64 min-h-[calc(100vh-64px)] p-4 border-r">
      <nav className="space-y-1.5">
        {menus.map((menu) => {
          const isActive =
            menu.path === "/dashboard"
              ? router.pathname === menu.path
              : router.pathname.startsWith(menu.path);
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
