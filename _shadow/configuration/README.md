# Shadow: configuration
Dipindah dari `src/services/configuration/` pada 2026-10-08 (9 file, 1663 baris). Nol importer aktif.
Konfigurasi yang aktif: `src/config/*` (env.ts 485 baris, risk, limits, trading) + Firestore `bot_control`. Modul ini duplikat yang menyimpan config & `FeatureFlags` di **memori instance** (flag di-hardcode), sehingga ubahan tidak dibagi antar instance Vercel; `configWatcher` hanya bermakna di proses panjang.
Nilai masa depan (prioritas tinggi): **feature flag berbasis Firestore** (mis. dokumen `bot_control/flags`) untuk menyalakan shadow AI/ML, messaging, dsb. tanpa redeploy. Rancangan: ambil `FeatureFlags` API dari sini, ganti `Map` dengan baca Firestore ber-cache pendek (TTL 30-60 dtk) agar hemat read. `configValidator`/`configSchema` bisa dipakai memvalidasi `env.ts`.

## Status (2026-10-08)
Versi aktif ada di `src/services/firebase/featureFlags.ts` (Firestore `bot_control/flags`, default semua mati, TTL 60 dtk). Modul shadow ini tidak lagi dibutuhkan untuk flag.
