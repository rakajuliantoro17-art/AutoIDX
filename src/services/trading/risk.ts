/**
==========================================================
AURA Trade OS
Risk Management Service
Version : 0.0.7 Alpha

Perubahan dari 0.0.6:
- validateTradeAmount() diperbaiki: bandingkan dengan
  BOT_CONFIG.maxTradeAmount (nominal), bukan
  RISK_CONFIG.maxOpenPosition (jumlah posisi) - bug lama.
- Tambah isEmergencyStopped() dan isCooldownActive().
- Tambah calculateAtrStopLevels() dan evaluateWithLevels():
  SL/TP sekarang berbasis ATR per pair (lihat komentar di
  masing-masing method), bukan lagi persentase statis yang
  sama untuk semua pair.
==========================================================
*/
import { RISK_CONFIG } from "@/config/risk";
import { BOT_CONFIG } from "@/config/bot";

export interface RiskEvaluationInput {
  buyPrice: number;
  currentPrice: number;
  inPosition: boolean;
}

export interface RiskEvaluationResult {
  shouldStopLoss: boolean;
  shouldTakeProfit: boolean;
  profitLossPercent: number;
  action: "STOP_LOSS" | "TAKE_PROFIT" | "HOLD";
  reason: string;
}

export interface AtrStopLevels {
  stopLossPrice: number;
  takeProfitPrice: number;
  stopLossPercent: number;
  takeProfitPercent: number;
}

/**
 * Batas aman (%) supaya level ATR tidak pernah jadi ekstrem --
 * ATR mendekati nol (pair nyaris tidak bergerak / data candle
 * kurang) tidak akan bikin SL nyaris nol persen (SL kena oleh
 * noise sekecil apa pun), dan ATR yang sangat besar (pair super
 * liar) tidak akan bikin SL puluhan persen.
 */
const MIN_STOP_LOSS_PERCENT = 0.5;
const MAX_STOP_LOSS_PERCENT = 8;

/**
 * Kelipatan ATR untuk jarak stop-loss. 1.5x ATR adalah nilai
 * umum dipakai di strategi ATR-based stop (cukup lebar untuk
 * menghindari noise normal, cukup ketat untuk membatasi rugi).
 */
const ATR_STOP_LOSS_MULTIPLIER = 1.5;

class RiskManager {

  /**
   * Hitung level stop-loss/take-profit berbasis ATR (volatilitas
   * ASLI pair itu), bukan persentase statis yang sama untuk
   * semua pair. Rasio risk:reward mengikuti
   * targetProfitPercent/stopLossPercent -- default dari
   * RISK_CONFIG (3:1 dari 3%/1%), TAPI bisa di-override lewat
   * baseStopLossPercent/baseTargetProfitPercent (dipakai
   * trading/engine.ts, dipasok dari getEffectiveTradingConfig()
   * -- gabungan BotSettings+RISK_CONFIG, lihat
   * services/trading/effectiveConfig.ts) supaya operator bisa
   * atur rasio risk:reward dari dashboard tanpa redeploy, TETAP
   * kena lebar-pita ATR (MIN/MAX_STOP_LOSS_PERCENT) yang sama.
   *
   * Dipanggil SEKALI saat BUY (services/trading/engine.ts), hasil
   * price-nya disimpan ke bot_state -- BUKAN dihitung ulang tiap
   * siklus, supaya level SL/TP tetap konsisten selama posisi
   * terbuka walau ATR pair berubah setelah entry.
   */
  calculateAtrStopLevels(
    entryPrice: number,
    atr: number,
    baseStopLossPercent: number = RISK_CONFIG.stopLossPercent,
    baseTargetProfitPercent: number = RISK_CONFIG.targetProfitPercent
  ): AtrStopLevels {

    const fallbackRatio =
      baseStopLossPercent > 0
        ? baseTargetProfitPercent / baseStopLossPercent
        : 3;

    if (entryPrice <= 0 || atr <= 0) {

      // Data ATR tidak valid -- fallback ke persentase statis
      // (baseStopLossPercent/baseTargetProfitPercent) supaya
      // posisi tetap punya perlindungan.
      return {
        stopLossPercent: baseStopLossPercent,
        takeProfitPercent: baseTargetProfitPercent,
        stopLossPrice: entryPrice * (1 - baseStopLossPercent / 100),
        takeProfitPrice: entryPrice * (1 + baseTargetProfitPercent / 100),
      };

    }

    const atrPercent = (atr / entryPrice) * 100;

    const rawStopLossPercent = atrPercent * ATR_STOP_LOSS_MULTIPLIER;

    const stopLossPercent = Math.min(
      MAX_STOP_LOSS_PERCENT,
      Math.max(MIN_STOP_LOSS_PERCENT, rawStopLossPercent)
    );

    const takeProfitPercent = stopLossPercent * fallbackRatio;

    return {
      stopLossPercent: Number(stopLossPercent.toFixed(2)),
      takeProfitPercent: Number(takeProfitPercent.toFixed(2)),
      stopLossPrice: entryPrice * (1 - stopLossPercent / 100),
      takeProfitPrice: entryPrice * (1 + takeProfitPercent / 100),
    };

  }

  /**
   * Evaluasi posisi terhadap level HARGA ABSOLUT yang sudah
   * dihitung & disimpan saat entry (lihat calculateAtrStopLevels)
   * -- ini yang dipakai untuk posisi BARU (setelah ATR SL/TP
   * dipasang). Kalau stopLossPrice/takeProfitPrice yang tersimpan
   * masih 0 (posisi lama dari sebelum fitur ini ada), otomatis
   * fallback ke evaluate() versi persentase statis di bawah --
   * supaya posisi yang sudah terbuka sebelum deploy ini TETAP
   * punya perlindungan SL/TP, bukan tiba-tiba tanpa proteksi.
   */
  evaluateWithLevels(
    buyPrice: number,
    currentPrice: number,
    inPosition: boolean,
    stopLossPrice: number,
    takeProfitPrice: number
  ): RiskEvaluationResult {

    if (!inPosition || buyPrice <= 0) {
      return {
        shouldStopLoss: false,
        shouldTakeProfit: false,
        profitLossPercent: 0,
        action: "HOLD",
        reason: "Tidak ada posisi yang sedang dibuka.",
      };
    }

    if (stopLossPrice <= 0 || takeProfitPrice <= 0) {
      // Posisi lama belum punya level ATR tersimpan -- fallback.
      return this.evaluate({ buyPrice, currentPrice, inPosition });
    }

    const pnl = this.calculatePnLPercent(buyPrice, currentPrice);

    if (currentPrice <= stopLossPrice) {
      return {
        shouldStopLoss: true,
        shouldTakeProfit: false,
        profitLossPercent: pnl,
        action: "STOP_LOSS",
        reason: `Stop Loss (ATR) tercapai di harga ${stopLossPrice.toFixed(2)}.`,
      };
    }

    if (currentPrice >= takeProfitPrice) {
      return {
        shouldStopLoss: false,
        shouldTakeProfit: true,
        profitLossPercent: pnl,
        action: "TAKE_PROFIT",
        reason: `Target Profit (ATR) tercapai di harga ${takeProfitPrice.toFixed(2)}.`,
      };
    }

    return {
      shouldStopLoss: false,
      shouldTakeProfit: false,
      profitLossPercent: pnl,
      action: "HOLD",
      reason: "Posisi masih berada dalam batas risiko (ATR).",
    };

  }

  /**
   * Evaluasi kondisi posisi terhadap
   * Stop Loss & Take Profit -- versi persentase statis
   * (RISK_CONFIG). Dipertahankan sebagai fallback untuk posisi
   * lama yang belum punya level ATR tersimpan (lihat
   * evaluateWithLevels di atas).
   */
  evaluate(input: RiskEvaluationInput): RiskEvaluationResult {
    const { buyPrice, currentPrice, inPosition } = input;

    if (!inPosition || buyPrice <= 0) {
      return {
        shouldStopLoss: false,
        shouldTakeProfit: false,
        profitLossPercent: 0,
        action: "HOLD",
        reason: "Tidak ada posisi yang sedang dibuka.",
      };
    }

    const pnl = this.calculatePnLPercent(buyPrice, currentPrice);

    if (pnl <= -RISK_CONFIG.stopLossPercent) {
      return {
        shouldStopLoss: true,
        shouldTakeProfit: false,
        profitLossPercent: pnl,
        action: "STOP_LOSS",
        reason: `Stop Loss ${RISK_CONFIG.stopLossPercent}% tercapai.`,
      };
    }

    if (pnl >= RISK_CONFIG.targetProfitPercent) {
      return {
        shouldStopLoss: false,
        shouldTakeProfit: true,
        profitLossPercent: pnl,
        action: "TAKE_PROFIT",
        reason: `Target Profit ${RISK_CONFIG.targetProfitPercent}% tercapai.`,
      };
    }

    return {
      shouldStopLoss: false,
      shouldTakeProfit: false,
      profitLossPercent: pnl,
      action: "HOLD",
      reason: "Posisi masih berada dalam batas risiko.",
    };
  }

  calculatePnLPercent(buyPrice: number, currentPrice: number): number {
    if (buyPrice <= 0) {
      return 0;
    }
    return Number((((currentPrice - buyPrice) / buyPrice) * 100).toFixed(2));
  }

  calculatePnLValue(buyPrice: number, currentPrice: number, amount: number): number {
    return Number(((currentPrice - buyPrice) * amount).toFixed(2));
  }

  /**
   * Validasi ukuran trade terhadap batas nominal
   * (BOT_CONFIG.maxTradeAmount).
   */
  validateTradeAmount(amount: number): boolean {
    return amount > 0 && amount <= BOT_CONFIG.maxTradeAmount;
  }

  /**
   * Apakah posisi baru boleh dibuka?
   * (dibandingkan dengan jumlah posisi lintas-pair
   * yang sedang terbuka, RISK_CONFIG.maxOpenPosition)
   */
  canOpenPosition(currentOpenPositions: number): boolean {
    return currentOpenPositions < RISK_CONFIG.maxOpenPosition;
  }

  /**
   * Kill switch darurat -- kalau true, BUY baru
   * harus diblokir (SELL/exit tetap diizinkan).
   */
  isEmergencyStopped(): boolean {
    return RISK_CONFIG.emergencyStop;
  }

  /**
   * Cek apakah masih dalam periode cooldown
   * sejak trade terakhir.
   */
  isCooldownActive(lastTradeAt?: number): boolean {
    if (!lastTradeAt) {
      return false;
    }
    const elapsedSeconds = (Date.now() - lastTradeAt) / 1000;
    return elapsedSeconds < RISK_CONFIG.cooldownSeconds;
  }

  calculateRiskRewardRatio(): number {
    if (RISK_CONFIG.stopLossPercent <= 0) {
      return 0;
    }
    return Number((RISK_CONFIG.targetProfitPercent / RISK_CONFIG.stopLossPercent).toFixed(2));
  }

}

const riskManager = new RiskManager();
export default riskManager;
