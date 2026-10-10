/**
==========================================================
AURA Trade OS
Market Data Service Entry Point
Version : 0.2.0

Hanya yang dipakai jalur live: tipe, agregator volume/candle, dan
filter spread/liquidity (dipakai services/scanner/marketQuality).
Lapisan streaming (websocket, ticker, orderbook live, feeds,
snapshots, manager, registry) dipindah ke `_shadow/market/`
karena butuh proses berumur panjang (tidak cocok di Vercel).
==========================================================
*/

export * from "./types";
