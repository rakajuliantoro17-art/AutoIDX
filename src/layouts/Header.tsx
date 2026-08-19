/**
==========================================================
AURA Trade OS
Dashboard Header
Version : 0.1.0 Alpha

Perubahan dari 0.0.2: badge "SYSTEM ACTIVE" sebelumnya hardcode
dengan titik hijau animate-pulse yang SELALU menyala hijau, tidak
peduli mode paper/live atau emergency stop sedang aktif atau
tidak. Sekarang pakai SystemStatusBadge (komponen yang sama
dipakai App Router layout.tsx) supaya konsisten menampilkan mode
ASLI dari bot_control, termasuk di halaman Settings tempat mode
ini di-toggle.
==========================================================
*/

import SystemStatusBadge from "@/components/SystemStatusBadge";

export default function Header() {
  return (
    <header className="glass-nav sticky top-0 z-40 border-b">
      <div className="h-16 px-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            Auto<span className="brand-gradient">IDX</span>
          </h1>
          <p className="text-xs text-slate-500">Automated Trading Engine</p>
        </div>

        <SystemStatusBadge />
      </div>
    </header>
  );
}
