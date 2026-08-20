/**
==========================================================
AURA Trade OS
Settings Overview
Version : 0.1.0 Alpha

SEBELUMNYA stub kosong, tidak tersambung ke sub-halaman
manapun. Sekarang jadi hub yang menautkan ke bot/risk/
strategy/api -- keempatnya sekarang fungsional (lihat
masing-masing file).
==========================================================
*/

import Link from "next/link";
import DashboardLayout from "@/layouts/DashboardLayout";

const SECTIONS = [
  {
    href: "/settings/bot",
    title: "Bot Configuration",
    description: "Mode paper/live, emergency stop, scan interval, pairs.",
  },
  {
    href: "/settings/risk",
    title: "Risk Management",
    description: "Trade amount, stop loss, take profit, max open position.",
  },
  {
    href: "/settings/strategy",
    title: "Strategy Mode",
    description: "Conservative / Balanced / Aggressive -- sumber sinyal utama.",
  },
  {
    href: "/settings/api",
    title: "API & Account",
    description: "Kelola akun Indodax untuk live trading.",
  },
];

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi AutoIDX Trading Engine
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="card block hover:border-sky-500/40 transition"
            >
              <p className="font-semibold text-slate-100">{section.title}</p>
              <p className="text-xs text-slate-400 mt-1">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
