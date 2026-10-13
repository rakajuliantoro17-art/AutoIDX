# Runbook insiden kritis - AURA Trade OS

Dibuat untuk Phase 47. Setiap insiden: gejala -> penyebab umum -> tindakan. Semua tindakan di bawah sudah ada di kode; yang belum teruji di live ditandai.
Aturan umum: ragu = biarkan Emergency Stop AKTIF dan tetap/kembali ke mode Paper. SELL/exit tidak pernah diblokir oleh pengaman mana pun.

## 1. Emergency Stop menyala sendiri (`updatedBy: reconciliation-guard`)
- Gejala: kartu merah di dashboard, lonceng "Peringatan darurat" berisi "Penyebab: ...".
- Penyebab umum: posisi di `bot_state` tidak cocok dengan saldo koin Indodax (mis. sisa mode paper = "posisi hantu"), atau ada order terbuka tak dikenal.
- Tindakan: Settings -> "Cek Posisi vs Saldo Indodax" -> Periksa. HANTU = bot mencatat posisi yang tidak ada di Indodax -> "Bersihkan posisi hantu" (diverifikasi ulang server, tercatat di audit). SELISIH = jangan dibersihkan otomatis; cek riwayat order Indodax dulu. Setelah bersih, matikan Emergency Stop; reconcile berikutnya (:00/:30) harus "Konsisten".

## 2. [ALERT:ORDER_UNCERTAIN] Status order tidak pasti
- Gejala: lonceng/log danger; lock pair+sisi ditahan (status UNCERTAIN), order baru untuk pair itu diblokir.
- Penyebab: koneksi putus sebelum respons Indodax diterima; order MUNGKIN sudah tereksekusi.
- Tindakan: buka riwayat order + saldo di Indodax. Bila order terbukti tidak ada: lepas lock (`POST /api/live-order-locks/resolve`, perlu login pemilik; belum ada tombol UI). Bila order ada: biarkan, reconcile akan menyamakan posisi; jangan kirim ulang manual. Flag `uncertainOrderReconcile` bisa menyelesaikan otomatis hanya bila bursa membuktikan order tidak tereksekusi (default mati).

## 3. [ALERT:ORDER_BREAKER] Pemutus order aktif
- Gejala: BUY ditolak "pemutus order aktif"; 3 kegagalan kirim order beruntun.
- Tindakan: cek status Indodax dan koneksi API key. Pemutus membuka sendiri setelah 10 menit (satu percobaan); sukses menutupnya. SELL tidak terpengaruh. Jangan paksa; perbaiki penyebabnya dulu.

## 4. [ALERT:DAILY_LOSS_LIMIT] Batas rugi harian tercapai
- Gejala: BUY baru diblokir; akumulasi rugi hari berjalan <= -batas% dari modal.
- Tindakan: tidak perlu apa-apa; hitungan reset otomatis pada pergantian tanggal UTC (07.00 WIB). Tinjau kenapa rugi sebelum hari berikutnya. Bila status rugi tidak terbaca (Firestore bermasalah), BUY di live diblokir (fail-closed).

## 5. Kuota Firestore habis (Spark: 50rb baca / 20rb tulis / 20rb hapus per hari)
- Gejala: cron 503 "Dilewati: Firestore sedang bermasalah/kuota habis" (atau timeout), dashboard error, akun Indodax gagal dimuat.
- Reset: sekitar 14.00 WIB (tengah malam Pasifik). Pemutus kuota membuat cron gagal cepat dan pulih sendiri.
- Tindakan: tunggu reset; kurangi membuka dashboard. Lihat Firebase -> Usage dan Query Insights untuk pemakai terbesar. Opsi permanen: upgrade ke Blaze (keputusan pemilik).
- Selama kuota habis BUY di live tidak jalan (status risiko tak terbaca = diblokir); posisi terbuka tidak dikelola sampai pulih. Jangan biarkan posisi besar saat kuota diperkirakan habis.

## 6. Scan/reconcile cron gagal atau basi
- Cek cron-job.org: scan (tiap menit-an), reconcile (:00/:30), agen (06.30). Reconcile membunyikan notifikasi bila heartbeat scan basi.
- Timeout 30 dtk = batas keras cron-job.org; scan normal ~18 dtk. Bila konsisten >25 dtk: kurangi `MAX_CANDIDATE_PAIRS_PER_CYCLE` (scanCycle.ts).
- Bila BUY diblokir "rekonsiliasi basi": jalankan reconcile manual (GET /api/cron/reconcile dengan CRON_SECRET) atau tunggu :00/:30.

## 7. Kembali ke live setelah insiden (daftar periksa)
1. Reconcile terakhir "Konsisten", Emergency Stop mati, "Cek Posisi" tidak ada HANTU/SELISIH.
2. `BOT_LIVE_CONFIRM=true`, `BOT_OWNER_UID` terisi, Max Open Position 1 di hari pertama.
3. Tidak ada lock UNCERTAIN (GET /api/live-order-locks), pemutus order tertutup.
4. Reads Firestore hari ini wajar (bukan mendekati 50rb).
5. Nominal canary kecil dulu (lihat docs/paper-soak-canary.md).
