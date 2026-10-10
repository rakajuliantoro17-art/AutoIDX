# Shadow: indodax (klien TypeScript paralel)

Dipindah dari `src/services/indodax/` pada 2026-10-10 (nol importer aktif). Aktif: `api.js` + `market.js` (data publik scanner/kalibrasi), `candles.ts`, `limiter.ts`, `cache.ts`. Order live memakai `services/liveTrading/exchange/indodaxClient.ts`; ada juga stack ketiga `services/exchange/`.

Alasan utama TIDAK dipasang: `auth.ts` menandatangani dengan **nonce** (skema lama), sedangkan klien live memakai **timestamp + recvWindow** (skema API Indodax terkini). Memasangnya ke jalur order berisiko request ditolak atau, lebih buruk, perilaku order tak terduga. `client/private/order/balance/depth/trades/summaries/public/orderbook/parser` bergantung pada auth itu atau menduplikasi `api.js`/`indodaxClient`.

`history.js`, `ticker.js`, `accountTypes.ts`, `index.ts`: tak dipakai.

## Syarat aktif kembali
Satu klien saja untuk seluruh bot. Bila ingin konsolidasi: perbarui auth ke timestamp+recvWindow, uji di sandbox API dengan dana kecil, lalu migrasikan satu endpoint per langkah.
