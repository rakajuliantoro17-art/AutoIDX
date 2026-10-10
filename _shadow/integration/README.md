# Shadow: integration (gate & kerangka integrasi)

Dipindah dari `src/services/integration/` pada 2026-10-11 (27 file, nol importer aktif). `productionGate`, `liveTradingGate`, `productionReadiness` hanya menggabungkan boolean dengan AND; tidak ada sumber data yang mengisi boolean itu. Padanan nyata sudah ada: gerbang live (`bot_control.mode=live` + `BOT_LIVE_CONFIRM`), `services/health/readiness.ts`, kanari (`/api/canary/status`), gerbang rekonsiliasi segar, dan flag fitur Firestore. `riskIntegration`/`tradingIntegration` (besar) adalah lapisan adaptor di atas Risk Engine yang tidak dipakai engine.ts.

## Syarat aktif kembali
Checklist go-live nyata diperlukan (env, koneksi Indodax, rekonsiliasi segar, kanari lulus, verdict paper): bangun di `health/readiness.ts` dengan data nyata, bukan menghidupkan gerbang boolean ini.
