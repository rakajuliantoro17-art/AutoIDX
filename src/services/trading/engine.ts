/**
==========================================================
AURA Trade OS
Trading Engine
Version : 0.0.6 Alpha
==========================================================
*/

import DecisionEngine, {
  DecisionInput,
  DecisionResult,
} from "./decision";

import PaperTradingService from "./paper";

import {
  getBotState,
  updateBotState,
} from "@/services/firebase/botState";

import {
  recordLog,
} from "@/services/firebase/logService";

export interface TradingEngineInput {

  pair: string;

  price: number;

  rsi: number;

  emaFast: number;

  emaSlow: number;

}

export interface TradingEngineResult {

  success: boolean;

  signal: "BUY" | "SELL" | "HOLD";

  confidence: number;

  reason: string;

  actionExecuted: boolean;

  timestamp: string;

}

export class TradingEngine {

  /**
   * Menjalankan satu siklus trading
   */
  static async run(
    input: TradingEngineInput
  ): Promise<TradingEngineResult> {

    try {

      const state =
        await getBotState(input.pair);

      const decisionInput: DecisionInput = {

        price: input.price,

        rsi: input.rsi,

        emaFast: input.emaFast,

        emaSlow: input.emaSlow,

        inPosition: state.inPosition,

      };

      const decision: DecisionResult =
        DecisionEngine.evaluate(
          decisionInput
        );

      let actionExecuted = false;

      switch (decision.signal) {

        case "BUY":

          await PaperTradingService.buy({

            pair: input.pair,

            price: input.price,

          });

          await updateBotState({

            pair: input.pair,

            inPosition: true,

            buyPrice: input.price,

          });

          await recordLog(
            "success",
            `BUY ${input.pair.toUpperCase()} @ ${input.price}`
          );

          actionExecuted = true;

          break;

        case "SELL":

          await PaperTradingService.sell({

            pair: input.pair,

            price: input.price,

          });

          await updateBotState({

            pair: input.pair,

            inPosition: false,

            buyPrice: 0,

            coinAmount: 0,

          });

          await recordLog(
            "success",
            `SELL ${input.pair.toUpperCase()} @ ${input.price}`
          );

          actionExecuted = true;

          break;

        default:

          await recordLog(
            "info",
            `HOLD ${input.pair.toUpperCase()}`
          );

      }

      return {

        success: true,

        signal: decision.signal,

        confidence: decision.confidence,

        reason: decision.reason,

        actionExecuted,

        timestamp: new Date().toISOString(),

      };

    } catch (error) {

      console.error(
        "[Trading Engine]",
        error
      );

      await recordLog(
        "danger",
        "Trading Engine Error"
      );

      return {

        success: false,

        signal: "HOLD",

        confidence: 0,

        reason: "Trading engine failed.",

        actionExecuted: false,

        timestamp: new Date().toISOString(),

      };

    }

  }

}

export default TradingEngine;
