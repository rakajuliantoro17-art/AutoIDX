/**
==========================================================
AURA Trade OS
Effective Trading Config
Version : 0.1.0 Alpha
==========================================================
Menggabungkan DUA sumber konfigurasi bot yang sebelumnya
berjalan sendiri-sendiri dan TIDAK sinkron:

1. `BOT_CONFIG` / `RISK_CONFIG` (src/config/*, env var Vercel)
   -- BATAS AMAN. Tidak bisa diubah tanpa redeploy. Ini yang
   membuat operator tidak bisa "kepencet" set trade amount atau
   max open position ke angka gila-gilaan cuma lewat dashboard.

2. `BotSettings` (Firestore `bot_settings/default`, diedit
   lewat dashboard /settings/*) -- NILAI OPERASIONAL yang
   operator mau, bisa diubah kapan saja tanpa redeploy.

SEBELUM modul ini ada: `services/trading/engine.ts` (risk-gate)
memvalidasi pakai `BOT_CONFIG.defaultTradeAmount` (statis),
tapi `trading/paper.ts` (eksekusi) fallback ke
`BotSettings.tradeAmountIdr` (Firestore) kalau tidak dikirim
eksplisit -- dua angka yang bisa BERBEDA. Modul ini menutup
celah itu: `BotSettings` jadi nilai yang dipakai, TAPI selalu
di-clamp ke batas `BOT_CONFIG`/`RISK_CONFIG` di SATU tempat ini
saja -- lalu hasil clamp inilah yang dipakai BAIK oleh risk-gate
MAUPUN oleh pemanggilan eksekusi (lihat trading/engine.ts),
supaya keduanya SELALU melihat angka yang identik.

Kalau Firestore gagal diakses, getBotSettings() sendiri sudah
fallback ke DEFAULT_SETTINGS (lihat api/settings/service.ts) --
jadi modul ini tetap dapat nilai yang valid untuk di-clamp,
bot tidak pernah berhenti berfungsi cuma karena Firestore down.
==========================================================
*/

import { getSettings } from "@/api/settings/service";
import type { BotSettings } from "@/api/settings/types";
import { BOT_CONFIG } from "@/config/bot";
import { RISK_CONFIG } from "@/config/risk";
import type { StrategyMode } from "@/services/strategy/manager";

/**
 * Batas bawah trade amount = minimum order value Indodax
 * (Rp25.000, terverifikasi dari dokumentasi resmi Indodax).
 * SEBELUMNYA cuma Rp1.000 -- jauh di bawah minimum asli, artinya
 * kalau BotSettings.tradeAmountIdr diisi rendah, order live bisa
 * lolos semua gerbang internal tapi tetap ditolak/gagal di sisi
 * Indodax karena di bawah minimum mereka.
 */
const MIN_TRADE_AMOUNT_IDR = 25_000;

const MIN_STOP_LOSS_PERCENT = 0.1;
const MAX_STOP_LOSS_PERCENT = 20;

const MIN_TARGET_PROFIT_PERCENT = 0.1;
const MAX_TARGET_PROFIT_PERCENT = 50;

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export interface EffectiveTradingConfig {

  mode: "paper" | "live";

  enabled: boolean;

  tradeAmountIdr: number;

  stopLossPercent: number;

  targetProfitPercent: number;

  maxOpenPositions: number;

  scanIntervalMinutes: number;

  pairs: string[];

  strategyMode: StrategyMode;

  /**
   * true kalau nilai dari BotSettings (Firestore) sempat
   * di-clamp karena melebihi/kurang dari batas BOT_CONFIG/
   * RISK_CONFIG -- berguna buat log, supaya operator tahu
   * kalau input dashboard mereka sebenarnya tidak dipakai
   * apa adanya.
   */
  clamped: {
    tradeAmountIdr: boolean;
    stopLossPercent: boolean;
    targetProfitPercent: boolean;
    maxOpenPositions: boolean;
  };

}

export async function getEffectiveTradingConfig(): Promise<EffectiveTradingConfig> {

  const settings: BotSettings = await getSettings();

  const rawTradeAmount = settings.tradeAmountIdr;
  const tradeAmountIdr = clamp(
    rawTradeAmount,
    MIN_TRADE_AMOUNT_IDR,
    BOT_CONFIG.maxTradeAmount
  );

  const rawStopLoss = settings.stopLossPercent;
  const stopLossPercent = clamp(
    rawStopLoss,
    MIN_STOP_LOSS_PERCENT,
    MAX_STOP_LOSS_PERCENT
  );

  const rawTargetProfit = settings.targetProfitPercent;
  const targetProfitPercent = clamp(
    rawTargetProfit,
    MIN_TARGET_PROFIT_PERCENT,
    MAX_TARGET_PROFIT_PERCENT
  );

  const rawMaxOpenPositions = settings.maxOpenPositions;
  const maxOpenPositions = clamp(
    rawMaxOpenPositions,
    1,
    RISK_CONFIG.maxOpenPosition
  );

  return {

    mode: settings.mode,

    enabled: settings.enabled,

    tradeAmountIdr,

    stopLossPercent,

    targetProfitPercent,

    maxOpenPositions,

    scanIntervalMinutes: settings.scanIntervalMinutes,

    pairs: settings.pairs,

    strategyMode: settings.strategyMode ?? "BALANCED",

    clamped: {
      tradeAmountIdr: tradeAmountIdr !== rawTradeAmount,
      stopLossPercent: stopLossPercent !== rawStopLoss,
      targetProfitPercent: targetProfitPercent !== rawTargetProfit,
      maxOpenPositions: maxOpenPositions !== rawMaxOpenPositions,
    },

  };

}
