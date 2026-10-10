# Shadow: analytics (kelas in-memory)

Dipindah dari `src/services/analytics/` pada 2026-10-10: `analyticsEngine`, `performanceAnalytics`, `portfolioAnalytics`, `strategyAnalytics`, `tradingAnalytics`. Aktif: `aiCalibration` (tiap scan), `riskAnalytics` (`/api/analytics/risk`).

Fungsi volume/fee dan breakdown per strategi sudah dihitung inline di `/api/analytics/risk` langsung dari trade tertutup (kelas-kelas ini butuh `.record()` satu-satu dengan state in-memory yang hilang tiap invocation serverless).

## Syarat aktif kembali
Ada kebutuhan analitik baru yang tak muat di endpoint; ambil rumusnya sebagai fungsi murni, jangan kelas bernegara.
