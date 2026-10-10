# Shadow: backtest (mesin paralel)

Dipindah dari `src/services/backtest/` pada 2026-10-10 (nol importer aktif). Jalur aktif: `runner`, `simulator`, `metrics`, `report`, `benchmark`, `types`, `execution/{fillSimulator,orderSimulator}`, `portfolio/{position,virtualPortfolio}` (dipakai `/api/backtest/run|batch`; fee 0,3% + slippage 0,1% sudah dimodelkan).

| File | Alasan |
|---|---|
| `engine.ts`, `engine/*`, `run.ts`, `index.ts` | mesin backtest kedua; dua mesin = dua hasil berbeda untuk strategi yang sama |
| `market/*` (historicalCandle/Dataset, marketReplay, priceResolver) | pemutar data historis; runner aktif sudah menerima candle langsung dari `getCandles` |
| `execution/{executionSimulator,simulatedFill,simulatedOrder,slippageModel}` | duplikat fillSimulator/orderSimulator aktif |
| `portfolio/{simulatedPortfolio,simulatedPosition,portfolioSnapshot}` | duplikat virtualPortfolio/position aktif |
| `metrics/{performanceMetrics,tradeStatistics,drawdownAnalyzer}` | menambah Sortino dan analisis drawdown; Sharpe aktif sudah diperbaiki (dianualisasi) |

## Syarat aktif kembali
Butuh Sortino/analisis drawdown: ambil fungsinya ke `metrics.ts` aktif (jangan menjalankan mesin kedua). Uji silang hasil dengan `/api/backtest/run` sebelum mengganti.
