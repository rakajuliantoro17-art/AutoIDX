/**
==========================================================
AURA Trade OS
Indodax Service Index
Version : 0.0.5 Alpha
==========================================================
*/

// TODO: client.ts dan trades.ts masih stub kosong, belum
// diimplementasikan -- sengaja tidak di-export di sini supaya
// build tidak gagal karena file kosong dianggap "not a module".
// Import langsung dari path spesifik (mis. "@/services/indodax/client")
// setelah file-nya diisi implementasi aslinya.

export * from "./ticker";
export * from "./market";
export * from "./candles";
export * from "./orderbook";
export * from "./parser";

// Default exports
export { default as indodaxTickerService } from "./ticker";
export { default as indodaxMarketService } from "./market";
export { default as indodaxOrderbookService } from "./orderbook";
export { default as indodaxCandlesService } from "./candles";
