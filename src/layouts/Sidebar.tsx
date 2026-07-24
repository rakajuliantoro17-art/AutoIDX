/**
==========================================================
AURA Trade OS
Dashboard Sidebar
Version : 0.0.1 Alpha
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
  { name: "Scanner", path: "/dashboard/scanner" },
  { name: "Portfolio", path: "/dashboard/portfolio" },
  { name: "Activity", path: "/dashboard/activity" },
  { name: "Backtest", path: "/dashboard/backtest" },
  { name: "Settings", path: "/dashboard/settings" },
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <aside className="hidden md:block w-64 border-r border-white/10 min-h-[calc(100vh-64px)] p-4">
      <nav className="space-y-2">
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
              className={`
                block
                px-4
                py-3
                rounded-xl
                text-sm
                transition
                ${
                  isActive
                    ? "bg-sky-500/10 text-sky-400 font-medium"
                    : "text-slate-300 hover:bg-white/10"
                }
              `}
            >
              {menu.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
