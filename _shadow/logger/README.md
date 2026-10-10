# Shadow: logger (sink file/remote/rotasi)

Dipindah dari `src/services/logger/` pada 2026-10-10. Aktif: `index.ts` (logger -> console + Firestore lewat `logService.recordLog`), `formatter.ts`, `types.ts` (dipakai 17 file, termasuk health checks dan latencyMonitor).

| File | Alasan |
|---|---|
| `fileLogger`, `logRotation` | menulis file lokal; filesystem Vercel read-only/efemer |
| `remoteLogger` | kirim ke layanan log eksternal; belum ada tujuan. Vercel sudah menyimpan stdout (Runtime Logs) |
| `consoleLogger`, `logger.ts` | duplikat `index.ts` aktif |

Catatan operasional: log aktivitas Firestore (`activity_logs`) ditulis ±4x per pair per siklus dan tidak pernah dihapus. Retensi 30 hari tersedia lewat flag `logRetention` (default mati; dijalankan `/api/cron/reconcile`).

## Syarat aktif kembali
Bot pindah ke VPS/worker (file log + rotasi bermakna), atau ada tujuan log eksternal yang dipilih.
