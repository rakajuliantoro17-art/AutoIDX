/**
==========================================================
AURA Trade OS
Recent Activity Widget (migrated from App Router)
Version : 0.1.0 Alpha

Perubahan dari 0.0.1: sebelumnya `logs` array statis hardcode
3 baris contoh, tidak pernah berubah -- komponen ini juga
orphan total (tidak diimpor siapa pun). Sekarang `logs` diterima
sebagai PROP (data asli dari /api/logs/recent, sumber yang sama
dipakai src/app/activity/page.tsx), dipakai
DashboardOverview.tsx sebagai widget ringkas "sekilas info" di
dashboard utama -- BUKAN pengganti halaman /activity yang detail
(tabel penuh + breakdown success/warning/danger + histori
transaksi), yang tetap jadi tempat rujukan lengkap.
==========================================================
*/
export interface ActivityLog {
  id: string;
  time: string;
  level: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  message: string;
}

interface RecentActivityProps {
  logs: ActivityLog[];
  loading?: boolean;
}

function badgeColor(level: ActivityLog["level"]) {
  switch (level) {
    case "SUCCESS":
      return "bg-emerald-500/20 text-emerald-400";
    case "WARNING":
      return "bg-yellow-500/20 text-yellow-400";
    case "ERROR":
      return "bg-red-500/20 text-red-400";
    default:
      return "bg-sky-500/20 text-sky-400";
  }
}

export default function RecentActivity({ logs, loading = false }: RecentActivityProps) {
  return (
    <section className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <span className="text-xs text-slate-500">
          {loading ? "Memuat..." : `Last ${logs.length} events`}
        </span>
      </div>
      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-slate-500">Memuat aktivitas terbaru...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada aktivitas.</p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between border-b border-white/5 pb-3"
            >
              <div>
                <p className="font-medium">{log.message}</p>
                <p className="text-xs text-slate-500 mt-1">{log.time}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColor(log.level)}`}>
                {log.level}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
