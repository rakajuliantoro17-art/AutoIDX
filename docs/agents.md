# Agen AURA Trade OS

## 1. Agen Operasional (di dalam aplikasi)
- Kode: `src/services/agents/*`, cron `GET/POST /api/cron/agent` (Bearer `CRON_SECRET`), UI `/dashboard/agent`.
- Peran: HRD (kinerja tim AI dari rapor shadow), Manajer (kesehatan operasional, usulan setting), Trader (posisi & sikap konsensus AI), Analis Pair (pair potensial dari scanner).
- Aktif bila flag Firestore `bot_control/flags.opsAgent = true`. Jadwalkan 1x/hari di cron-job.org.
- Menulis hanya ke `agent_reports` dan `agent_recommendations` (status `pending`).
- Hanya pemilik (`BOT_OWNER_UID`) dapat menyetujui/menolak. Persetujuan menerapkan lewat jalur settings biasa (validasi + `audit_logs`).
- Whitelist yang boleh diusulkan: `maxOpenPositions`, `stopLossPercent`, `targetProfitPercent`, `priorityPairs`. Mode live, emergency stop, API key, dan kode TIDAK bisa disentuh agen.

## 2. Agen Pengembang (di luar aplikasi, peran kedua)
Tujuan: pemeliharaan dan pengembangan agar sistem optimal dan tidak crash. Aturan:
1. Bekerja di branch terpisah; TIDAK pernah push ke `main` (push ke `main` memicu deploy Vercel). Push/merge menunggu arahan pemilik.
2. Sebelum mengusulkan perubahan: `npx tsc --noEmit` dan `next build` harus exit 0 (periksa exit code, jangan dirantai).
3. Fokus: perbaikan error dari log, pembaruan dependensi, perapian, uji; bukan mengubah logika trading tanpa persetujuan.
4. Tidak memegang secret (API key Indodax, Firebase admin, BOT_LIVE_CONFIRM).
5. Perubahan jalur live hanya di balik feature flag dan diuji di mode paper dulu.
