# _shadow: indeks & arah pengembangan

Kode di sini **di luar build** (`tsconfig.json` -> `exclude`), tersimpan untuk masa depan. Tiap folder punya README berisi alasan dan syarat aktivasi.

| Area | Nilai masa depan | Tergantung |
|---|---|---|
| observability, resilience | tracing/retry-recovery lanjut | batas memori, konteks per request |
| runtime, core, bootstrap, maintenance, jobs | server fisik / proses panjang | penjadwal proses, DI per siklus |
| messaging (events+commands) | memisahkan log/notifikasi/metrik dari jalur trade | bus per siklus, timeout handler, mode paper |
| network | proxy IP tetap bila kunci Indodax di-whitelist | keputusan infrastruktur |
| plugins | strategi sinyal yang dapat dipasang | isolasi nyata |
| persistence | kontrak repository (port/adapter) bila ganti DB | adapter nyata + mode paper |
| configuration | feature flag Firestore (nyalakan shadow tanpa redeploy) | TTL cache baca Firestore |
| validation | pipeline aturan | dipakai saat validator live disatukan |

## Arah (urutan nilai/risiko)
1. Pertahankan jalur aktif kecil dan stateless (Vercel). 2. Tambah nilai lewat AI/ML shadow mode (`docs/ai-ml-integration-map.md`). 3. Retensi data Firestore via route cron. 4. Baru setelah mode paper: messaging di jalur non-kritis. 5. Server fisik: aktifkan kelompok proses-panjang sekaligus, bukan satu-satu.
