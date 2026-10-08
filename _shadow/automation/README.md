# Shadow: automation (runner proses panjang)
Dipindah dari `src/services/automation/` pada 2026-10-08 (8 file, 1762 baris). Nol importer aktif.
**Tetap aktif di `src/`:** `dispatcher.ts` (dipakai webhook) dan `notifier.ts` (Telegram; dipakai `trading/engine` dan `cron/reconcile`).

| File | Alasan di shadow |
|---|---|
| `queue.ts` | antrean di array memori; hilang saat instance dibekukan/di-recycle |
| `scheduler.ts` | `setInterval`; Vercel tidak menjalankan timer di antara request (penjadwalan nyata = cron-job.org) |
| `worker.ts`, `lifecycle.ts` | state mesin proses panjang |
| `engine.ts`, `monitor.ts`, `health.ts` | orkestrasi/pemantauan di atas komponen di atas; health sudah tercakup `services/health` + `/api/health/status` |
| `index.ts` | barrel lama |

Syarat aktif kembali: server fisik/proses panjang; queue dibuat persisten (Firestore) bila perlu lintas instance.
