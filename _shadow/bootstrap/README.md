# Shadow: bootstrap
Dipindah dari `src/services/bootstrap/` pada 2026-10-08 (6 file, 1755 baris). Nol importer aktif.
`dependencyContainer` (DI), `serviceRegistry`, `application`, `lifecycle`, `bootstrap`, `startup`: perakitan aplikasi untuk **proses panjang**. Next.js tidak punya satu titik start; di Vercel tiap request bisa instance baru, jadi container singleton tidak membawa nilai.
Syarat aktif: (a) server fisik/proses panjang, atau (b) pakai hook resmi `src/instrumentation.ts` -> `register()` dan buat container **per request/siklus**. Pasangannya `_shadow/core/` (kernel, shutdown).
