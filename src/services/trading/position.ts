/**
==========================================================
AURA Trade OS
Position Management Service
Version : 0.0.6 Alpha
==========================================================
*/

import {
  getBotState,
  updateBotState,
  BotState,
} from "@/services/firebase/botState";

export interface PositionSummary {
  pair: string;

  isOpen: boolean;

  buyPrice: number;

  currentPrice: number;

  coinAmount: number;

  investedValue: number;

  currentValue: number;

  profitLoss: number;

  profitLossPercent: number;

  openedAt?: string;

  updatedAt: string;
}

class PositionService {

  /**
   * Mengambil posisi aktif
   */
  async getPosition(
    pair: string
  ): Promise<BotState> {

    return await getBotState(pair);

  }

  /**
   * Membuka posisi baru
   */
  async openPosition(
    pair: string,
    buyPrice: number,
    coinAmount: number
  ): Promise<boolean> {

    return updateBotState({

      pair,

      inPosition: true,

      entryPrice: buyPrice,

      coinAmount,

    });

  }

  /**
   * Menutup posisi
   */
  async closePosition(
    pair: string
  ): Promise<boolean> {

    return updateBotState({

      pair,

      inPosition: false,

      entryPrice: 0,

      coinAmount: 0,

    });

  }

  /**
   * Cek apakah sedang memiliki posisi
   */
  async hasOpenPosition(
    pair: string
  ): Promise<boolean> {

    const state =
      await getBotState(pair);

    return state.inPosition;

  }

  /**
   * Ringkasan posisi saat ini
   */
  async getSummary(
    pair: string,
    currentPrice: number
  ): Promise<PositionSummary> {

    const state =
      await getBotState(pair);

    const investedValue =
      state.entryPrice *
      state.coinAmount;

    const currentValue =
      currentPrice *
      state.coinAmount;

    const profitLoss =
      currentValue -
      investedValue;

    const profitLossPercent =
      investedValue > 0
        ? (profitLoss /
            investedValue) *
          100
        : 0;

    return {

      pair: state.pair,

      isOpen:
        state.inPosition,

      buyPrice:
        state.entryPrice,

      currentPrice,

      coinAmount:
        state.coinAmount,

      investedValue,

      currentValue,

      profitLoss,

      profitLossPercent:
        Number(
          profitLossPercent.toFixed(2)
        ),

      updatedAt:
        state.updatedAt,

    };

  }

  /**
   * Profit / Loss nominal
   */
  calculatePnL(
    buyPrice: number,
    currentPrice: number,
    amount: number
  ): number {

    return Number(
      (
        (currentPrice -
          buyPrice) *
        amount
      ).toFixed(2)
    );

  }

  /**
   * Profit / Loss (%)
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
          (currentPrice -
            buyPrice) /
          buyPrice
        ) * 100
      ).toFixed(2)
    );

  }

  /**
   * Nilai posisi saat ini
   */
  calculatePositionValue(
    currentPrice: number,
    amount: number
  ): number {

    return Number(
      (
        currentPrice *
        amount
      ).toFixed(2)
    );

  }

  /**
   * Status posisi
   */
  getStatus(
    state: BotState
  ): "OPEN" | "CLOSED" {

    return state.inPosition
      ? "OPEN"
      : "CLOSED";

  }

}

const positionService =
  new PositionService();

export default positionService;
