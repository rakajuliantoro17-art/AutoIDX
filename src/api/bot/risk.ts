/**
==========================================================
AutoIDX
Risk Management Engine
Version : 0.0.1 Alpha
==========================================================
*/

import { RISK } from "./constants";

export interface RiskRequest {
  pair: string;

  tradeAmountIdr: number;

  availableBalanceIdr: number;

  currentPrice: number;

  entryPrice?: number;

  openPositions: number;
}

export interface RiskResult {
  approved: boolean;

  reason: string;

  stopLossPercent: number;

  takeProfitPercent: number;

  riskRewardRatio: number;

  recommendedTradeAmount: number;
}

/**
 * ==========================================
 * Validate Trade
 * ==========================================
 */

export function validateTrade(
  request: RiskRequest
): RiskResult {

  /**
   * Balance Check
   */

  if (
    request.availableBalanceIdr <
    request.tradeAmountIdr
  ) {

    return {

      approved: false,

      reason:
        "Insufficient IDR balance.",

      stopLossPercent:
        RISK.DEFAULT_STOP_LOSS_PERCENT,

      takeProfitPercent:
        RISK.DEFAULT_TARGET_PROFIT_PERCENT,

      riskRewardRatio:
        calculateRiskReward(),

      recommendedTradeAmount: 0,

    };

  }

  /**
   * Maximum Open Position
   */

  if (
    request.openPositions >=
    RISK.MAX_OPEN_POSITIONS
  ) {

    return {

      approved: false,

      reason:
        "Maximum open positions reached.",

      stopLossPercent:
        RISK.DEFAULT_STOP_LOSS_PERCENT,

      takeProfitPercent:
        RISK.DEFAULT_TARGET_PROFIT_PERCENT,

      riskRewardRatio:
        calculateRiskReward(),

      recommendedTradeAmount: 0,

    };

  }

  /**
   * Trade Amount Validation
   */

  const recommended =
    Math.min(
      request.tradeAmountIdr,
      request.availableBalanceIdr
    );

  return {

    approved: true,

    reason: "Trade approved.",

    stopLossPercent:
      RISK.DEFAULT_STOP_LOSS_PERCENT,

    takeProfitPercent:
      RISK.DEFAULT_TARGET_PROFIT_PERCENT,

    riskRewardRatio:
      calculateRiskReward(),

    recommendedTradeAmount:
      recommended,

  };

}

/**
 * ==========================================
 * Stop Loss Trigger
 * ==========================================
 */

export function shouldStopLoss(
  entryPrice: number,
  currentPrice: number
): boolean {

  const lossPercent =
    (
      (entryPrice - currentPrice) /
      entryPrice
    ) * 100;

  return (
    lossPercent >=
    RISK.DEFAULT_STOP_LOSS_PERCENT
  );

}

/**
 * ==========================================
 * Take Profit Trigger
 * ==========================================
 */

export function shouldTakeProfit(
  entryPrice: number,
  currentPrice: number
): boolean {

  const profitPercent =
    (
      (currentPrice - entryPrice) /
      entryPrice
    ) * 100;

  return (
    profitPercent >=
    RISK.DEFAULT_TARGET_PROFIT_PERCENT
  );

}

/**
 * ==========================================
 * Risk Reward Ratio
 * ==========================================
 */

export function calculateRiskReward() {

  return (
    RISK.DEFAULT_TARGET_PROFIT_PERCENT /
    RISK.DEFAULT_STOP_LOSS_PERCENT
  );

}
