/**
==========================================================
AURA Trade OS
Portfolio Service
Version : 0.0.6 Alpha
==========================================================
*/

import { getBotState } from "@/services/firebase/botState";

export interface PortfolioSummary {
  pair: string;

  inPosition: boolean;

  buyPrice: number;

  currentPrice: number;

  coinAmount: number;

  investedValue: number;

  currentValue: number;

  profitLoss: number;

  profitLossPercent: number;

  updatedAt: string;
}

class PortfolioService {

  /**
   * Menghitung kondisi portfolio saat ini
   */
  async getSummary(
    pair: string,
    currentPrice: number
  ): Promise<PortfolioSummary> {

    const state = await getBotState(pair);

    const investedValue =
      state.entryPrice * state.coinAmount;

    const currentValue =
      currentPrice * state.coinAmount;

    const profitLoss =
      currentValue - investedValue;

    const profitLossPercent =
      investedValue > 0
        ? (profitLoss / investedValue) * 100
        : 0;

    return {

      pair: state.pair,

      inPosition: state.inPosition,

      buyPrice: state.entryPrice,

      currentPrice,

      coinAmount: state.coinAmount,

      investedValue,

      currentValue,

      profitLoss,

      profitLossPercent: Number(
        profitLossPercent.toFixed(2)
      ),

      updatedAt: new Date().toISOString(),

    };

  }

  /**
   * Nilai investasi awal
   */
  calculateInvestedValue(
    buyPrice: number,
    amount: number
  ): number {

    return Number(
      (buyPrice * amount).toFixed(2)
    );

  }

  /**
   * Nilai portfolio saat ini
   */
  calculateCurrentValue(
    currentPrice: number,
    amount: number
  ): number {

    return Number(
      (currentPrice * amount).toFixed(2)
    );

  }

  /**
   * Profit / Loss nominal
   */
  calculateProfitLoss(
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
   * Profit / Loss (%)
   */
  calculateProfitLossPercent(
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
   * Status portfolio
   */
  getPositionStatus(
    inPosition: boolean
  ): "OPEN" | "CLOSED" {

    return inPosition
      ? "OPEN"
      : "CLOSED";

  }

  /**
   * Warna indikator dashboard
   */
  getPerformanceColor(
    profitLoss: number
  ): "success" | "danger" | "neutral" {

    if (profitLoss > 0) {

      return "success";

    }

    if (profitLoss < 0) {

      return "danger";

    }

    return "neutral";

  }

}

const portfolioService =
  new PortfolioService();

export default portfolioService;
