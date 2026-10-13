# Paper Soak & Canary Live - rencana pengujian (Phase 49)

STATUS: DISETUJUI pemilik dan Tahap A DIMULAI 2026-10-14 (mode Paper, Emergency Stop mati, posisi hantu xrp_idr sudah bersih). Paling cepat selesai 2026-10-21. Durasi dan toleransi di bawah tidak diubah di tengah jalan.

Tujuan: membuktikan, dengan bukti terukur, bahwa bot stabil dan aman sebelum dana nyata diperbesar. Lulus soak tidak menjamin untung; ini uji keselamatan dan kestabilan, bukan uji profit.

## Tahap A - Paper soak (mode Paper, tanpa dana nyata)
Durasi: 7 hari berturut-turut. Hitung ulang dari nol bila ada kegagalan kriteria wajib (A1-A4) karena kode/konfigurasi (bukan karena kuota reset terjadwal).

| Kode | Kriteria wajib | Cara mengukur |
|---|---|---|
| A1 | Cron scan dan reconcile Successful >= 99% eksekusi, tanpa jeda gagal berturut-turut > 30 menit | riwayat cron-job.org |
| A2 | 0 Emergency Stop otomatis yang tidak terjelaskan; 0 peringatan `[ALERT:...]` | lonceng notifikasi / audit_logs |
| A3 | Pemakaian Firestore harian: Reads <= 35.000, Writes <= 14.000, Deletes <= 14.000 (70% batas Spark) tiap hari | Firebase -> Usage |
| A4 | Minimal 10 trade paper tertutup, semuanya tercatat lengkap (entri, keluar, fee) tanpa error pencatatan | halaman Riwayat Trade, log RISK/BOT |
| A5 (informasi) | PnL paper, win rate, drawdown dicatat; tidak menjadi syarat lulus | dashboard portofolio |

## Tahap B - Canary live (dana nyata, skala sangat kecil)
Prasyarat: Tahap A lulus; hantu posisi bersih; reconcile Konsisten; daftar periksa runbook bagian 7 terpenuhi.
Konfigurasi tetap selama tahap B: nominal Rp10.000 per order (minimum Indodax; `BOT_DEFAULT_TRADE_AMOUNT = BOT_MAX_TRADE_AMOUNT = 10000`), Max Open Position = 1, `BOT_LIVE_CONFIRM=true`, `BOT_OWNER_UID` terisi, watchlist kecil. Durasi: 14 hari. Pantau tiap hari: lonceng, `/api/canary/status`, `reconciliation_history`, saldo Indodax vs dashboard.

| Kode | Kriteria wajib | Cara mengukur |
|---|---|---|
| B1 | 0 order ganda (satu sinyal = paling banyak satu order) | riwayat order Indodax vs `trades` |
| B2 | Setelah setiap order, reconcile berikutnya Konsisten (selisih posisi <= 1%); 0 posisi hantu baru | `reconciliation_history`, Cek Posisi |
| B3 | Semua order berstatus tidak pasti (UNCERTAIN) terselesaikan dengan bukti riwayat Indodax; 0 yang berakhir "order ada tapi tidak tercatat" | audit_logs, lock order |
| B4 | Tingkat error order <= 5% dari percobaan; pemutus order tidak pernah aktif lebih dari 1 kali | canary snapshot, `[ALERT:ORDER_BREAKER]` |
| B5 | Drawdown canary <= 3% dari modal canary; batas rugi harian tidak tercapai lebih dari 1 kali | canary snapshot, `[ALERT:DAILY_LOSS_LIMIT]` |
| B6 | Fee + slippage nyata per order dicatat dan dibandingkan dengan asumsi backtest (fee 0,3%, slippage 0,1%); selisih dijelaskan | trades vs riwayat Indodax |

## Syarat HENTI segera (kembali ke Paper + Emergency Stop AKTIF)
- Satu order ganda yang tidak disengaja.
- Selisih saldo/posisi dengan Indodax yang tidak bisa dijelaskan setelah pemeriksaan.
- Order UNCERTAIN yang tidak bisa dibuktikan statusnya dalam 24 jam.
- Batas rugi harian tercapai 2 kali dalam tahap B.
- Tindakan: ikuti runbook; catat insiden; perbaiki; ulang tahap B dari nol.

## Memperbesar skala (hanya setelah tahap B lulus)
Naik bertahap Rp10.000 -> Rp25.000 -> Rp50.000; tiap tingkat butuh 7 hari bersih (B1-B5 tetap berlaku) sebelum naik. Batas atas mengikuti `bot.ts` (Rp500.000) dan hanya dengan persetujuan pemilik. Max Open Position naik ke 2 hanya setelah dua tingkat nominal lulus.

## Rollback
Emergency Stop AKTIF + mode Paper (Settings). SELL/exit tidak pernah diblokir, jadi posisi terbuka bisa ditutup manual di Indodax kapan saja. Sebelum memulai, pastikan Anda bisa login ke Indodax dan menutup posisi manual.

## Tabel bukti (diisi selama pengujian)
| Tanggal | Tahap | A1/B1 | A2/B2 | A3/B3 | A4/B4 | B5 | B6 | Catatan/insiden |
|---|---|---|---|---|---|---|---|---|
| 2026-10-14 | A (hari 1) |  |  |  |  |  |  | Mulai soak; Paper, Emergency Stop mati |
