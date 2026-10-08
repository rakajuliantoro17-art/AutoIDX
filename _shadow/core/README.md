# Shadow: core (kernel proses)

Dipindah dari `src/services/core/` pada 2026-10-08. Di luar build (`exclude: _shadow`). Nol importer aktif.

| File | Alasan di shadow |
|---|---|
| `kernel.ts`, `shutdown.ts` | siklus boot/shutdown/restart proses; tidak bermakna di serverless (instance dibekukan, bukan dimatikan). Bergantung ke `bootstrap/*` yang juga orphan |
| `applicationContext.ts` | flag maintenance disimpan di memori instance -> tidak dibagi antar instance Vercel (maintenance sebenarnya harus di Firestore `bot_control`) |
| `health.ts` | tumpang tindih dengan `services/health` + `/api/health/status` |
| `version.ts`, `metadata.ts` | versi di-hardcode (0.2.0 alpha); sumber kebenaran: `package.json` / `VERCEL_GIT_COMMIT_SHA` |

`_shadow/maintenance/maintenanceManager.ts` ikut dipindah karena satu-satunya pemakai `applicationContext`.

## Berguna di server fisik
Kernel boot/shutdown + handler SIGTERM (graceful shutdown) bernilai bila bot jalan sebagai proses panjang. Syarat: hubungkan ke `bootstrap/*`, pasang `process.on("SIGTERM")`, ganti versi hardcode dengan `package.json`.
