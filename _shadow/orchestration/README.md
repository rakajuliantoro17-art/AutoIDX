# Shadow: orchestration (workflow engine generik)

Dipindah dari `src/services/orchestration/` pada 2026-10-11 (20 file, nol importer aktif). Workflow engine (step, middleware, scheduler, recovery, persistence) yang berjalan di proses. Alur bot nyata: `scheduler/cron.ts` -> `trading/engine.ts` dipicu cron eksternal; Vercel serverless tidak menahan scheduler/proses panjang. Bagian `workflowPersistence`/`workflowRecovery` mengulang fungsi Firestore + reconcile yang sudah ada.

## Syarat aktif kembali
Worker berumur panjang (VPS) dan alur multi-tahap yang butuh retry per langkah (mis. job offline ML). Lihat juga `_shadow/pipeline`, `_shadow/runtime`.
