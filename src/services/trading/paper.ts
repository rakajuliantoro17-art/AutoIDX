/**
==========================================================
AURA Trade OS
Paper Trading Service
Version : 0.0.8 Alpha

Perubahan dari 0.0.7: buy() sekarang menerima tradeAmountIdr
eksplisit (opsional) dari caller (TradingEngine). Kalau
diberikan, dipakai APA ADANYA -- tidak fetch ulang
getBotSettings() sendiri -- supaya risk-gate validation di
TradingEngine dan eksekusi aktual di sini selalu memakai
angka yang SAMA PERSIS (sebelumnya bisa beda kalau caller
memvalidasi terhadap satu angka tapi service ini diam-diam
fetch angka lain dari Firestore).
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
  getBotSettings,
} from "@/services/firebase/settingsService";

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
  /**
   * Nominal IDR eksplisit dari caller (TradingEngine).
   * Kalau diisi, dipakai apa adanya -- tidak fetch ulang
   * getBotSettings() sendiri, supaya konsisten dengan
   * validasi risk-gate yang sudah dilakukan caller.
   */
  tradeAmountIdr?: number;
  /**
   * Nama strategi yang menghasilkan sinyal ini - lihat komentar
   * yang sama di trading/live.ts LiveTradeRequest.strategy.
   */
  strategy?: string;
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

    let tradeAmountIdr = request.tradeAmountIdr;
    let stopLossPercent = BOT_CONFIG.stopLoss;
    let targetProfitPercent = BOT_CONFIG.targetProfit;

    if (tradeAmountIdr === undefined) {
      const settings = await getBotSettings();
      tradeAmountIdr = settings.tradeAmountIdr;
      stopLossPercent = settings.stopLossPercent;
      targetProfitPercent = settings.targetProfitPercent;
    }

    const amount =
      request.amount ??
      tradeAmountIdr /
        request.price;

    const total =
      amount * request.price;

    await updateBotState({

      pair: request.pair,

      inPosition: true,

      entryPrice: request.price,

      coinAmount: amount,

      lastTradeAt: Date.now(),

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
          request.price * (1 - stopLossPercent / 100),

        takeProfitPrice:
          request.price * (1 + targetProfitPercent / 100),

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

        strategy: request.strategy,

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

      lastTradeAt: Date.now(),

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

        strategy: request.strategy,

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
