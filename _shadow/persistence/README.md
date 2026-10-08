# Shadow: persistence (port repository)
Dipindah dari `src/services/persistence/` pada 2026-10-08 (5 file, 161 baris). Nol importer aktif (hanya di-re-export barrel `services/index.ts`, ikut dibersihkan).
Hanya **interface** (OrderRepository, PositionRepository, ExecutionRepository, PersistenceManager) tanpa implementasi Firestore; penyimpanan nyata sudah ada di `services/trading`, `reconciliation`, dll.
Nilai masa depan: pola port/adapter. Bila kelak ingin mengganti Firestore (mis. Postgres di server fisik) atau menguji tanpa DB, jadikan ini kontrak dan buat adapter `FirestoreOrderRepository`. Jangan diaktifkan sebelum ada implementasi dan pemakai; menyentuh jalur order -> tunggu mode paper.
