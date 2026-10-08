# Shadow: jobs (pembungkus job terjadwal)

Dipindah dari `src/services/jobs/` pada 2026-10-08 (5 file, 910 baris). Di luar build (`exclude: _shadow`). Nol importer aktif.

Tidak ada penjadwal di dalam repo: penjadwalan nyata dilakukan cron-job.org -> `/api/cron/scan` dan `/api/cron/reconcile`. Job di sini hanya kelas pembungkus dengan flag `running` di memori.

| File | Catatan |
|---|---|
| `heartbeatJob.ts` | hanya menyimpan `lastHeartbeat` di memori; digantikan `services/health/cronHeartbeat` (Firestore, terbaca lintas instance) -> aman dihapus |
| `cleanupJob.ts` | memanggil `maintenance/cleanup` = bersih-bersih cache & rotasi log **di memori**; tak bermakna di serverless |
| `optimizationJob.ts` | membungkus `maintenance/optimize` (orphan) |
| `metricsJob.ts` | membungkus `analytics/analyticsEngine` (orphan) |
| `reportJob.ts` | membungkus `health/healthReport` |

## Syarat sebelum dipakai lagi
1. Server fisik: butuh penjadwal proses (node-cron / systemd timer) yang memanggil `execute()`; flag `running` baru bermakna di proses panjang.
2. Vercel: jangan pakai kelas ini; buat route `/api/cron/<nama>` + entri cron-job.org dan simpan hasilnya di Firestore.
3. Kebutuhan nyata yang belum ada: retensi data Firestore (hapus `scan_history`/log lama) lewat route cron, bukan cache memori.
