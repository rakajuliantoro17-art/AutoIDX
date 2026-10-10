# Shadow: execution (mesin eksekusi paralel)

Dipindah dari `src/services/execution/` pada 2026-10-11 (20 file, nol importer aktif). Aktif: `risk/positionSizing.ts` (dipakai `trading/engine.ts`). Order nyata mengalir lewat `trading/{live,paper,liveOrderValidator,liveSellValidator}` dan `liveTrading/exchange/indodaxClient` (dengan `liveOrderLock`, client_order_id, timeout, rekonsiliasi).

| File | Alasan |
|---|---|
| `executionEngine`, `manager`, `registry`, `index`, `executionLogger`, `types` | mesin eksekusi kedua; dua jalur order = risiko order ganda |
| `adapters/*` (exchange, indodax, mock) | klien bursa paralel; `mockAdapter` berguna sebagai ide uji, tapi paper mode sudah ada |
| `orders/*` (limit, market, stop, takeProfit, builder) | pembangun order; live hanya memakai market order via `indodaxClient.trade` |
| `validation/*` | duplikat `liveOrderValidator`/`liveSellValidator` yang sudah menjadi jalur utama |
| `risk/{stopLoss,takeProfit}` | duplikat `trading/risk.ts` (ATR SL/TP) |
| `risk/exposure.ts` | KONSEPNYA dipakai: `trading/exposure.ts` (batas exposure TOTAL, flag `portfolioExposureLimit`) |

## Syarat aktif kembali
Order limit/stop diperlukan strategi baru; pasang sebagai satu jalur di atas `liveOrderLock`, bukan mesin kedua. Uji paper dulu.
