/**
==========================================================
AURA Trade OS
Paper Trading Service
Version : 0.0.6 Alpha
==========================================================
*/

import {
  BOT_CONFIG,
} from "@/config/bot";

import {
  getBotState,
  updateBotState,
} from "@/services/firebase/botState";

import {
  recordTrade,
  recordLog,
} from "@/services/firebase/logService";

export interface PaperTradeRequest {
  pair: string;
  price: number;
  amount?: number;
}

export interface PaperTradeResult {
  success: boolean;
  orderId: string;
  pair: string;
  side: "BUY" | "SELL";
  price: number;
  amount: number;
  total: number;
  timestamp: string;
}

class PaperTradingService {

  /**
   * Simulasi BUY
   */
  async buy(
    request: PaperTradeRequest
  ): Promise<PaperTradeResult> {

    const state =
      await getBotState(request.pair);

    if (state.inPosition) {
      throw new Error(
        "Position already opened."
      );
    }

    const amount =
      request.amount ??
      BOT_CONFIG.defaultTradeAmount /
        request.price;

    const total =
      amount * request.price;

    await updateBotState({

      pair: request.pair,

      inPosition: true,

      entryPrice: request.price,

      coinAmount: amount,

    });

    await recordTrade({

      pair: request.pair,

      type: "BUY",

      price: request.price,

      amount,

      totalIdr: total,

      reason: "Paper Trading BUY",

      mode: "paper",

    });

    await recordLog(
      "BOT",
      "success",
      `BUY ${request.pair.toUpperCase()} @ ${request.price.toLocaleString(
        "id-ID"
      )}`
    );

    return {

      success: true,

      orderId:
        `PAPER-BUY-${Date.now()}`,

      pair: request.pair,

      side: "BUY",

      price: request.price,

      amount,

      total,

      timestamp:
        new Date().toISOString(),

    };

  }

  /**
   * Simulasi SELL
   */
  async sell(
    request: PaperTradeRequest
  ): Promise<PaperTradeResult> {

    const state =
      await getBotState(request.pair);

    if (!state.inPosition) {
      throw new Error(
        "No open position."
      );
    }

    const amount =
      request.amount ??
      state.coinAmount;

    const total =
      amount * request.price;

    await updateBotState({

      pair: request.pair,

      inPosition: false,

      entryPrice: 0,

      coinAmount: 0,

    });

    await recordTrade({

      pair: request.pair,

      type: "SELL",

      price: request.price,

      amount,

      totalIdr: total,

      reason: "Paper Trading SELL",

      mode: "paper",

    });

    await recordLog(
      "BOT",
      "success",
      `SELL ${request.pair.toUpperCase()} @ ${request.price.toLocaleString(
        "id-ID"
      )}`
    );

    return {

      success: true,

      orderId:
        `PAPER-SELL-${Date.now()}`,

      pair: request.pair,

      side: "SELL",

      price: request.price,

      amount,

      total,

      timestamp:
        new Date().toISOString(),

    };

  }

  /**
   * Hitung unrealized P/L (%)
   */
  calculateProfitPercent(
    buyPrice: number,
    currentPrice: number
  ): number {

    if (buyPrice <= 0) {
      return 0;
    }

    return Number(
      (
        ((currentPrice - buyPrice) /
          buyPrice) *
        100
      ).toFixed(2)
    );

  }

  /**
   * Hitung unrealized P/L (IDR)
   */
  calculateProfitValue(
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

}

const paperTradingService =
  new PaperTradingService();

export default paperTradingService;
