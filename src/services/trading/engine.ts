/**
==========================================================
AURA Trade OS
Trading Engine
Version : 0.0.8 Alpha

Perubahan dari 0.0.7: Risk gate ditambahkan SEBELUM eksekusi
BUY - emergencyStop, allowAutoTrade, cooldown, maxOpenPosition,
dan validateTradeAmount sekarang benar-benar dicek (sebelumnya
logic-nya ada di risk.ts tapi tidak pernah dipanggil).

Prinsip desain: emergencyStop/allowAutoTrade/cooldown/
maxOpenPosition HANYA memblokir BUY baru. SELL (baik dari
DecisionEngine maupun stop-loss/take-profit RiskManager)
TIDAK PERNAH diblokir -- supaya bot tetap bisa keluar dari
posisi yang sudah terbuka untuk melindungi modal, bahkan
saat emergency stop aktif atau auto-trade dimatikan.
==========================================================
*/

import DecisionEngine, {
  DecisionInput,
  DecisionResult,
} from "./decision";

import PaperTradingService from "./paper";

import riskManager from "./risk";

import { RISK_CONFIG } from "@/config/risk";
import { BOT_CONFIG } from "@/config/bot";

import {
  getBotState,
  updateBotState,
  getOpenPositionsCount,
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
  /**
   * True kalau sinyal BUY sebenarnya muncul dari
   * DecisionEngine, tapi diblokir oleh risk gate
   * (emergency stop / auto-trade off / cooldown /
   * max open position / trade amount invalid).
   */
  riskBlocked: boolean;
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

      /*
      ==========================================
      RISK GATE (khusus BUY baru)
      ==========================================
      */
      let riskBlocked = false;

      if (decision.signal === "BUY") {

        let blockReason = "";

        if (riskManager.isEmergencyStopped()) {
          riskBlocked = true;
          blockReason = "Emergency stop aktif - BUY baru diblokir.";
        }
        else if (!BOT_CONFIG.allowAutoTrade) {
          riskBlocked = true;
          blockReason = "Auto trade dinonaktifkan (BOT_AUTO_TRADE=false).";
        }
        else if (riskManager.isCooldownActive(state.lastTradeAt)) {
          riskBlocked = true;
          blockReason = `Masih dalam cooldown (${RISK_CONFIG.cooldownSeconds} detik sejak trade terakhir).`;
        }
        else if (!riskManager.validateTradeAmount(BOT_CONFIG.defaultTradeAmount)) {
          riskBlocked = true;
          blockReason = `Trade amount (${BOT_CONFIG.defaultTradeAmount}) melebihi batas maksimum (${BOT_CONFIG.maxTradeAmount}).`;
        }
        else {

          const openPositions = await getOpenPositionsCount();

          if (!riskManager.canOpenPosition(openPositions)) {
            riskBlocked = true;
            blockReason = `Batas maksimum posisi terbuka (${RISK_CONFIG.maxOpenPosition}) tercapai.`;
          }

        }

        if (riskBlocked) {

          await recordLog(
            "RISK",
            "warning",
            `BUY ${input.pair.toUpperCase()} diblokir - ${blockReason}`
          );

          decision = {
            signal: "HOLD",
            confidence: decision.confidence,
            reason: blockReason,
          };

        }

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
            lastTradeAt: Date.now(),
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
            lastTradeAt: Date.now(),
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
            `HOLD ${input.pair.toUpperCase()}${
              riskBlocked ? " (RISK BLOCKED)" : ""
            }`
          );

      }

      return {
        success: true,
        signal: decision.signal,
        confidence: decision.confidence,
        reason: decision.reason,
        actionExecuted,
        riskTriggered,
        riskBlocked,
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
        riskBlocked: false,
        timestamp: new Date().toISOString(),
      };

    }

  }

}

export default TradingEngine;
