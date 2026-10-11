/**
==========================================================
AURA Trade OS
Activity View (sub-component)
Version : 0.1.0 Alpha

Perubahan dari 0.0.1: sebelumnya cuma <ActivityLogs logs={[]}/>
hardcode -- orphan total, array kosong SELAMANYA. Sekarang
`logs` diterima sebagai prop (data ASLI yang sama dipakai
RecentActivity di DashboardOverview.tsx, TIDAK fetch ulang) dan
dipakai sebagai varian tampilan "daftar penuh" (list flat, beda
dari kartu ringkas RecentActivity) di bagian bawah dashboard
utama -- pelengkap, bukan pengganti halaman /activity yang
py tabel+breakdown lebih detail.
==========================================================
*/
import ActivityLogs from "@/components/ActivityLogs";
import type { ActivityLog } from "@/components/RecentActivity";

interface ActivityViewProps {
  logs: ActivityLog[];
}

export default function ActivityView({ logs }: ActivityViewProps) {
  const mapped = logs.map((log) => ({
    id: log.id,
    timestamp: log.time,
    message: log.message,
    type:
      log.level === "SUCCESS"
        ? ("success" as const)
        : log.level === "WARNING"
          ? ("warning" as const)
          : log.level === "ERROR"
            ? ("danger" as const)
            : ("info" as const),
  }));

  return <ActivityLogs logs={mapped} />;
}
