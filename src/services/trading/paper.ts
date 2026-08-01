/**
==========================================================
AURA Trade OS
Paper Trading Service
Version : 0.0.7 Alpha
(Ditambahkan: sinkronisasi ke paperTradingStore.ts / Firestore
supaya dashboard /dashboard/paper-trading menampilkan data asli,
bukan selalu kosong)
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

import {
  getPaperPortfolio,
  savePaperPortfolio,
  savePaperPosition,
  logPaperTrade,
} from "@/services/firebase/paperTradingStore";

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

    // --- Sinkronisasi ke paperTradingStore (Firestore, dibaca dashboard) ---
    try {

      const portfolio =
        await getPaperPortfolio(BOT_CONFIG.startingBalance);

      const newAvailableBalance =
        portfolio.availableBalance - total;

      await savePaperPortfolio({

        ...portfolio,

        availableBalance: newAvailableBalance,

        equityIdr: newAvailableBalance + total,

        updatedAt: Date.now(),

      });

      const entryTime = Date.now();

      await savePaperPosition({

        pair: request.pair,

        inPosition: true,

        entryPrice: request.price,

        coinAmount: amount,

        entryValue: total,

        entryTime,

        stopLossPrice:
          request.price * (1 - BOT_CONFIG.stopLoss / 100),

        takeProfitPrice:
          request.price * (1 + BOT_CONFIG.targetProfit / 100),

        updatedAt: entryTime,

      });

      await logPaperTrade({

        pair: request.pair,

        side: "BUY",

        price: request.price,

        quantity: amount,

        idrValue: total,

        timestamp: entryTime,

        executedAt: entryTime,

      });

    } catch (error) {

      console.error(
        "[PAPER TRADING STORE SYNC ERROR - BUY]",
        error
      );

    }

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

    // --- Sinkronisasi ke paperTradingStore (Firestore, dibaca dashboard) ---
    try {

      const pnlIdr =
        (request.price - state.entryPrice) * amount;

      const pnlPercent =
        state.entryPrice > 0
          ? ((request.price - state.entryPrice) / state.entryPrice) * 100
          : 0;

      const portfolio =
        await getPaperPortfolio(BOT_CONFIG.startingBalance);

      const newAvailableBalance =
        portfolio.availableBalance + total;

      await savePaperPortfolio({

        ...portfolio,

        availableBalance: newAvailableBalance,

        equityIdr: newAvailableBalance,

        updatedAt: Date.now(),

      });

      const closedAt = Date.now();

      await savePaperPosition({

        pair: request.pair,

        inPosition: false,

        entryPrice: 0,

        coinAmount: 0,

        entryValue: 0,

        entryTime: 0,

        stopLossPrice: 0,

        takeProfitPrice: 0,

        updatedAt: closedAt,

      });

      await logPaperTrade({

        pair: request.pair,

        side: "SELL",

        price: request.price,

        quantity: amount,

        idrValue: total,

        pnlIdr,

        pnlPercent,

        timestamp: closedAt,

        executedAt: closedAt,

      });

    } catch (error) {

      console.error(
        "[PAPER TRADING STORE SYNC ERROR - SELL]",
        error
      );

    }

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
