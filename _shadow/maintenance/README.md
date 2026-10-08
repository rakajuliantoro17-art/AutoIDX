# Shadow: maintenance
Dipindah dari `src/services/maintenance/` pada 2026-10-08 (5 file). Nol importer aktif.
- `cleanup.ts`, `optimize.ts`, `databaseMaintenance.ts`: operasi atas cache/log **di memori** -> tak bermakna di serverless.
- `maintenanceManager.ts`: flag maintenance di memori (`core/applicationContext`); seharusnya di Firestore `bot_control`.
- `versionChecker.ts`: membaca `npm_package_version` (tidak ada saat runtime Vercel); gunakan `VERCEL_GIT_COMMIT_SHA` (sudah ada di `/api/health/status` -> `build`).
Aktifkan kembali hanya di server fisik, atau tulis ulang sebagai route cron berbasis Firestore (retensi data).
