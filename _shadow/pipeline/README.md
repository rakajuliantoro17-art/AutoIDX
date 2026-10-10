# Shadow: pipeline (kerangka stage generik)

Dipindah dari `src/services/pipeline/` pada 2026-10-10: 9 file (~800 baris), nol importer aktif, tidak ada stage nyata yang terdaftar. Alur nyata bot sudah berurutan eksplisit di `scheduler/cron.ts` -> `trading/engine.ts` (scan -> fitur -> strategi -> risk gate -> eksekusi), lebih mudah diaudit daripada eksekutor stage generik.

## Syarat aktif kembali
Ada alur multi-tahap baru yang butuh retry/skip per stage (mis. job offline ML: kumpul data -> label -> latih -> evaluasi). Pasang di sana (di luar jalur order), bukan menggantikan engine.
