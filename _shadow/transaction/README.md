# Shadow: transaction (kerangka transaksi in-memory)

Dipindah dari `src/services/transaction/` pada 2026-10-11 (20 file, nol importer aktif, tidak ada folder aktif tersisa). Kerangka koordinator/executor/lifecycle transaksi generik dengan penyimpanan in-memory. Kebutuhan nyata ditangani lebih tepat oleh: `liveOrderLock` (idempotensi + UNCERTAIN lock di Firestore), `client_order_id`, dan `uncertainOrderReconciler`. Menjalankan dua mekanisme idempotensi berisiko order ganda.

## Syarat aktif kembali
Butuh operasi multi-langkah atomik lintas koleksi yang tidak cukup dengan Firestore transaction/batch; rancang langsung di atas Firestore.
