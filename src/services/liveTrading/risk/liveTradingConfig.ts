/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 8 (diaktifkan sesi audit orphan)
 * Live Trading Safety Configuration (Canary Phase)
 * ==========================================================
 *
 * FIX PENTING sebelum disambungkan: env var aslinya
 * (`BOT_MAX_TRADE_AMOUNT`, `BOT_MAX_DAILY_LOSS`) SUDAH dipakai
 * untuk hal LAIN dengan arti/satuan BERBEDA:
 * - `BOT_MAX_TRADE_AMOUNT` -> `config/bot.ts` BOT_CONFIG.maxTradeAmount
 *   (default 50.000, dipakai risk-gate umum di engine.ts)
 * - `BOT_MAX_DAILY_LOSS` -> DUA arti berbeda yang SUDAH ada:
 *   `config/bot.ts` BOT_CONFIG.maxDailyLoss (PERSENTASE, default 5)
 *   dan `config/risk.ts` RISK_CONFIG.maxDailyLossPercent (PERSENTASE,
 *   default 5) -- sedangkan file ini aslinya baca angka yang sama
 *   sebagai RUPIAH ABSOLUT (default 50.000). Kalau dipakai apa
 *   adanya, orang yang set BOT_MAX_DAILY_LOSS=5 (maksudnya "5%",
 *   sesuai config yang sudah ada) akan diam-diam ditafsirkan file
 *   ini sebagai "batas rugi Rp5" -- praktis melumpuhkan live trading
 *   tanpa error apapun. SEMUA env var di bawah sudah diganti nama
 *   dengan prefix BOT_CANARY_ supaya tidak pernah tertukar dengan
 *   config lain yang sudah ada.
 */

export interface LiveTradingConfig {
  readonly enabled: boolean;
  readonly canaryOnly: boolean;
  readonly maxTradeAmount: number;
  readonly maxDailyLossIdr: number;
  readonly maxOpenOrders: number;
  readonly maxConsecutiveFailures: number;
  readonly requireReconciliation: boolean;
}

const numberEnv = (
  key: string,
  fallback: number,
): number => {

  const value =
    Number(
      process.env[key],
    );

  return Number.isFinite(value)
    ? value
    : fallback;
};

export function getLiveTradingConfig():
  LiveTradingConfig {

  return {
    // Default FALSE dengan sengaja (fail-closed) - konsisten dengan
    // filosofi dua-syarat BOT_MODE=live + BOT_LIVE_CONFIRM=true yang
    // sudah ada di engine.ts. Ini gerbang TAMBAHAN khusus fase
    // canary/testing skala kecil, terpisah dari dua syarat itu.
    enabled:
      process.env.BOT_CANARY_ENABLED ===
      "true",

    // Default TRUE (canary-only) kecuali eksplisit di-set "false" -
    // fail-safe: kalau operator lupa set env var ini sama sekali,
    // sistem tetap membatasi ke mode canary (aman), bukan diam-diam
    // full live tanpa batas.
    canaryOnly:
      process.env.BOT_CANARY_ONLY !==
      "false",

    maxTradeAmount:
      numberEnv(
        "BOT_CANARY_MAX_TRADE_AMOUNT",
        25000,
      ),

    maxDailyLossIdr:
      numberEnv(
        "BOT_CANARY_MAX_DAILY_LOSS_IDR",
        50000,
      ),

    maxOpenOrders:
      numberEnv(
        "BOT_CANARY_MAX_OPEN_ORDERS",
        1,
      ),

    maxConsecutiveFailures:
      numberEnv(
        "BOT_CANARY_MAX_CONSECUTIVE_FAILURES",
        3,
      ),

    // BELUM DITEGAKKAN oleh kode manapun (lihat live.ts) - field ini
    // disimpan untuk kelengkapan config tapi butuh implementasi
    // reconciliation (bandingkan posisi tercatat vs saldo/posisi
    // asli di Indodax) yang belum ada. Jangan asumsikan aktif.
    requireReconciliation:
      process.env.BOT_CANARY_REQUIRE_RECONCILIATION !==
      "false",
  };
}

export default getLiveTradingConfig;
