/**
==========================================================
AURA Trade OS
Trade Executor
Version : 0.0.6 Alpha
==========================================================
*/

import PaperTradingService from "./paper";
import type { ExecutionMode } from "./types";

export interface ExecuteTradeRequest {

  pair: string;

  side: "BUY" | "SELL";

  price: number;

  amount?: number;

}

export interface ExecuteTradeResult {

  success: boolean;

  orderId: string;

  executedPrice: number;

  executedAmount: number;

  executedAt: string;

  mode: ExecutionMode;

  message: string;

}

export class TradeExecutor {

  /**
   * Execute BUY / SELL
   */
  static async execute(
    request: ExecuteTradeRequest
  ): Promise<ExecuteTradeResult> {

    const mode: ExecutionMode =
      (process.env.BOT_MODE as ExecutionMode) ??
      "paper";

    switch (mode) {

      case "paper":

        return this.executePaper(
          request
        );

      case "live":

        return this.executeLive(
          request
        );

      default:

        throw new Error(
          `Unsupported BOT_MODE: ${mode}`
        );

    }

  }

  /**
   * Paper Trading
   */
  private static async executePaper(
    request: ExecuteTradeRequest
  ): Promise<ExecuteTradeResult> {

    if (request.side === "BUY") {

      await PaperTradingService.buy({

        pair: request.pair,

        price: request.price,

        amount: request.amount,

      });

    } else {

      await PaperTradingService.sell({

        pair: request.pair,

        price: request.price,

        amount: request.amount,

      });

    }

    return {

      success: true,

      orderId:
        `PAPER-${Date.now()}`,

      executedPrice:
        request.price,

      executedAmount:
        request.amount ?? 0,

      executedAt:
        new Date().toISOString(),

      mode: "paper",

      message:
        `${request.side} executed (Paper Trading).`,

    };

  }

  /**
   * Live Trading
   * Akan dihubungkan ke
   * Indodax Private API
   * pada v0.1.x
   */
  private static async executeLive(
    request: ExecuteTradeRequest
  ): Promise<ExecuteTradeResult> {

    throw new Error(
      "Live Trading is not implemented yet."
    );

  }

}

export default TradeExecutor;
