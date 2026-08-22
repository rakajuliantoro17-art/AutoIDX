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

UPDATE (integrasi config/limits.ts): sebelumnya modul ini cuma
clamp ke BOT_CONFIG.maxTradeAmount / RISK_CONFIG.maxOpenPosition
(env var Vercel, BISA salah ketik/salah nilai). Sekarang DITAMBAH
lapisan kedua: MAX_ORDER_VALUE & MAX_OPEN_POSITIONS dari
config/limits.ts -- batas keamanan mutlak yang cuma bisa berubah
lewat edit kode + redeploy, bukan cuma env var. TIDAK mengubah
perilaku saat ini sama sekali (BOT_CONFIG.maxTradeAmount sekarang
cuma Rp10.000, jauh di bawah MAX_ORDER_VALUE Rp100 juta) -- murni
jaring pengaman tambahan kalau suatu saat env var di Vercel
ke-set ke angka yang salah.
==========================================================
*/

import { getSettings } from "@/api/settings/service";
import type { BotSettings } from "@/api/settings/types";
import { BOT_CONFIG } from "@/config/bot";
import { RISK_CONFIG } from "@/config/risk";
import {
  MIN_ORDER_VALUE,
  MAX_ORDER_VALUE,
  MAX_OPEN_POSITIONS,
} from "@/config/limits";
import type { StrategyMode } from "@/services/strategy/manager";

/**
 * Batas bawah trade amount = minimum transaksi Indodax (Rp10.000).
 * Diambil dari config/limits.ts (satu-satunya sumber angka ini
 * sekarang -- sebelumnya nilai yang sama di-hardcode ulang di
 * sini). Catatan: Rp10.000-24.999 diproses lewat "Indodax Lite",
 * >=Rp25.000 lewat "Indodax Pro" (help.indodax.com) -- keduanya
 * sama-sama valid.
 */
const MIN_TRADE_AMOUNT_IDR = MIN_ORDER_VALUE;

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
    // Dua batas atas sekaligus: BOT_CONFIG.maxTradeAmount (bisa
    // diubah operator lewat env var Vercel) DAN MAX_ORDER_VALUE
    // dari config/limits.ts (batas keamanan mutlak, TIDAK bisa
    // diubah tanpa redeploy+edit kode). Kalau env var Vercel
    // ke-set salah/kelewat besar, MAX_ORDER_VALUE tetap jadi
    // jaring pengaman terakhir. Dipilih yang PALING KETAT.
    Math.min(BOT_CONFIG.maxTradeAmount, MAX_ORDER_VALUE)
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
    // Sama polanya dengan tradeAmountIdr di atas: RISK_CONFIG.
    // maxOpenPosition (env var) DAN MAX_OPEN_POSITIONS dari
    // config/limits.ts (batas mutlak) -- dipilih yang paling ketat.
    Math.min(RISK_CONFIG.maxOpenPosition, MAX_OPEN_POSITIONS)
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
