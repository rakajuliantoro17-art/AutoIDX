/**
==========================================================
AURA Trade OS
Risk Management Service
Version : 0.0.6 Alpha
==========================================================
*/

import { RISK_CONFIG } from "@/config/risk";

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
  evaluate(
    input: RiskEvaluationInput
  ): RiskEvaluationResult {

    const {
      buyPrice,
      currentPrice,
      inPosition,
    } = input;

    if (!inPosition || buyPrice <= 0) {

      return {

        shouldStopLoss: false,

        shouldTakeProfit: false,

        profitLossPercent: 0,

        action: "HOLD",

        reason: "Tidak ada posisi yang sedang dibuka.",

      };

    }

    const pnl = this.calculatePnLPercent(
      buyPrice,
      currentPrice
    );

    if (
      pnl <=
      -RISK_CONFIG.stopLossPercent
    ) {

      return {

        shouldStopLoss: true,

        shouldTakeProfit: false,

        profitLossPercent: pnl,

        action: "STOP_LOSS",

        reason: `Stop Loss ${RISK_CONFIG.stopLossPercent}% tercapai.`,

      };

    }

    if (
      pnl >=
      RISK_CONFIG.targetProfitPercent
    ) {

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

  /**
   * Hitung Profit/Loss (%)
   */
  calculatePnLPercent(
    buyPrice: number,
    currentPrice: number
  ): number {

    if (buyPrice <= 0) {

      return 0;

    }

    return Number(
      (
        (
          (currentPrice - buyPrice) /
          buyPrice
        ) * 100
      ).toFixed(2)
    );

  }

  /**
   * Hitung Profit/Loss nominal
   */
  calculatePnLValue(
    buyPrice: number,
    currentPrice: number,
    amount: number
  ): number {

    return Number(
      (
        (currentPrice - buyPrice) *
        amount
      ).toFixed(2)
    );

  }

  /**
   * Validasi ukuran trade
   */
  validateTradeAmount(
    amount: number
  ): boolean {

    return (
      amount > 0 &&
      amount <= RISK_CONFIG.maxOpenPosition
    );

  }

  /**
   * Apakah posisi boleh dibuka?
   */
  canOpenPosition(
    currentOpenPositions: number
  ): boolean {

    return (
      currentOpenPositions <
      RISK_CONFIG.maxOpenPosition
    );

  }

  /**
   * Rasio Risk : Reward
   */
  calculateRiskRewardRatio(): number {

    if (
      RISK_CONFIG.stopLossPercent <= 0
    ) {

      return 0;

    }

    return Number(
      (
        RISK_CONFIG.targetProfitPercent /
        RISK_CONFIG.stopLossPercent
      ).toFixed(2)
    );

  }

}

const riskManager = new RiskManager();

export default riskManager;
