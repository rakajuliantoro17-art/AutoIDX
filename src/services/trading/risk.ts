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

class RiskManager {

  /**
   * Evaluasi kondisi posisi terhadap
   * Stop Loss & Take Profit
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
