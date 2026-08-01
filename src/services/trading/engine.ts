/**
==========================================================
AURA Trade OS
Trading Engine
Version : 0.0.7 Alpha

Perubahan dari 0.0.6: RiskManager (stop loss / take profit)
sekarang divalidasi SEBELUM DecisionEngine, dan bisa memaksa
SELL kapan saja posisi terbuka menyentuh batas risiko -
terlepas dari sinyal indikator (EMA/RSI) DecisionEngine.
==========================================================
*/

import DecisionEngine, {
  DecisionInput,
  DecisionResult,
} from "./decision";

import PaperTradingService from "./paper";

import riskManager from "./risk";

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

  riskTriggered: boolean;

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

      /*
      ==========================================
      RISK CHECK (Stop Loss / Take Profit)
      Dijalankan LEBIH DULU, sebelum DecisionEngine.
      Kalau posisi terbuka menyentuh batas risiko,
      ini memaksa SELL - tidak peduli sinyal indikator.
      ==========================================
      */
      let decision: DecisionResult;
      let riskTriggered = false;

      if (state.inPosition) {

        const riskEval = riskManager.evaluate({
          buyPrice: state.entryPrice,
          currentPrice: input.price,
          inPosition: state.inPosition,
        });

        if (riskEval.shouldStopLoss || riskEval.shouldTakeProfit) {

          riskTriggered = true;

          decision = {
            signal: "SELL",
            confidence: 1,
            reason: riskEval.reason,
          };

        } else {

          const decisionInput: DecisionInput = {
            price: input.price,
            rsi: input.rsi,
            emaFast: input.emaFast,
            emaSlow: input.emaSlow,
            inPosition: state.inPosition,
          };

          decision = DecisionEngine.evaluate(decisionInput);

        }

      } else {

        const decisionInput: DecisionInput = {
          price: input.price,
          rsi: input.rsi,
          emaFast: input.emaFast,
          emaSlow: input.emaSlow,
          inPosition: state.inPosition,
        };

        decision = DecisionEngine.evaluate(decisionInput);

      }

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

            entryPrice: input.price,

          });

          await recordLog(
            "BOT",
            "success",
            `BUY ${input.pair.toUpperCase()} @ ${input.price} - ${decision.reason}`
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

            entryPrice: 0,

            coinAmount: 0,

          });

          await recordLog(
            "BOT",
            riskTriggered ? "warning" : "success",
            `SELL ${input.pair.toUpperCase()} @ ${input.price} - ${decision.reason}${
              riskTriggered ? " (RISK MANAGER)" : ""
            }`
          );

          actionExecuted = true;

          break;

        default:

          await recordLog(
            "BOT",
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

        riskTriggered,

        timestamp: new Date().toISOString(),

      };

    } catch (error) {

      console.error(
        "[Trading Engine]",
        error
      );

      await recordLog(
        "SYSTEM",
        "danger",
        "Trading Engine Error"
      );

      return {

        success: false,

        signal: "HOLD",

        confidence: 0,

        reason: "Trading engine failed.",

        actionExecuted: false,

        riskTriggered: false,

        timestamp: new Date().toISOString(),

      };

    }

  }

}

export default TradingEngine;
