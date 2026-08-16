/**
==========================================================
AURA Trade OS
Trading Engine
Version : 0.0.9 Alpha
(Gabungan perubahan:
1. Validasi risk sebelum eksekusi - emergency stop, batas rugi
   harian, cooldown, max exposure, max open position, dan
   stop-loss/take-profit paksa yang jalan terpisah dari sinyal
   strategi.
2. BOT_MODE sekarang benar-benar jadi switch paper/live. Live
   trading TIDAK akan pernah jalan kecuali DUA syarat terpenuhi:
   BOT_MODE=live DAN BOT_LIVE_CONFIRM=true. Ini sengaja dibuat
   dua gerbang terpisah supaya tidak ada yang "kepencet" masuk
   mode live tanpa sadar - salah satu env var saja tidak cukup.
3. Emergency Stop HANYA memblokir BUY baru, TIDAK PERNAH
   memblokir SELL/stop-loss/take-profit paksa - supaya posisi
   terbuka tidak "nyangkut" kalau emergency stop aktif saat
   harga turun.
4. updateBotState dipanggil SETIAP siklus (bukan cuma saat
   BUY/SELL) supaya currentPrice/lastSignal di dashboard selalu
   segar walau hasil siklusnya HOLD.)
==========================================================
*/

import DecisionEngine, {
  DecisionInput,
  DecisionResult,
} from "./decision";

import PaperTradingService from "./paper";
import LiveTradingService from "./live";

import RiskManager from "./risk";

import type { Candle } from "@/services/indodax/candles";

import indicatorManager from "@/services/indicator/manager";
import type { IndicatorCandle } from "@/services/indicator/types";

import strategyManager from "@/services/strategy/manager";
import type { StrategyDecision } from "@/services/strategy/types";

import {
  getBotState,
  updateBotState,
  getOpenPositionsCount,
} from "@/services/firebase/botState";

import {
  recordLog,
} from "@/services/firebase/logService";

import {
  getRiskState,
  recordRealizedPnl,
} from "@/services/firebase/riskState";

import {
  getBotControl,
} from "@/services/firebase/botControl";

import {
  getPaperPortfolio,
} from "@/services/firebase/paperTradingStore";

import { BOT_CONFIG } from "@/config/bot";
import { RISK_CONFIG } from "@/config/risk";

export interface TradingEngineInput {

  pair: string;

  price: number;

  rsi: number;

  emaFast: number;

  emaSlow: number;

  /**
   * Candle OHLCV lengkap (opsional). Dipakai HANYA untuk filter
   * konfirmasi strategi orphan (src/services/strategy/*) sebelum
   * BUY dari DecisionEngine dieksekusi -- lihat
   * confirmBuyWithOrphanStrategies() di bawah. Kalau tidak
   * disuplai, filter otomatis fail-safe (BUY diturunkan ke HOLD).
   */
  candles?: Candle[];

}

export interface TradingEngineResult {

  success: boolean;

  signal: "BUY" | "SELL" | "HOLD";

  confidence: number;

  reason: string;

  actionExecuted: boolean;

  riskBlocked?: boolean;

  mode?: "paper" | "live";

  timestamp: string;

}

function toMillis(value: any): number {

  if (!value) return 0;

  if (typeof value.toMillis === "function") return value.toMillis();

  if (typeof value.toDate === "function") return value.toDate().getTime();

  if (value instanceof Date) return value.getTime();

  return 0;

}

/**
 * Live trading HANYA aktif kalau DUA syarat terpenuhi:
 * bot_control.mode === "live" (bisa diubah real-time dari
 * dashboard, tanpa redeploy) DAN process.env.BOT_LIVE_CONFIRM
 * === "true" (cuma bisa diubah lewat Vercel env var + redeploy).
 * Salah satu saja tidak cukup - ini sengaja jadi dua gerbang
 * terpisah supaya tidak ada yang "kepencet" masuk live tanpa
 * sadar lewat toggle dashboard saja.
 */
function isLiveModeActive(

  control: { mode: "paper" | "live" }

): boolean {

  return (
    control.mode === "live" &&
    process.env.BOT_LIVE_CONFIRM === "true"
  );

}

/**
 * Ambang konfirmasi filter strategi orphan.
 * - Minimal 2 dari 3 strategi (AURA_TREND, EMA_CROSSOVER, MOMENTUM)
 *   harus searah BUY.
 * - Confidence tiap strategi (skala 0..1 dari core/evaluator.ts)
 *   minimal 0.60 supaya dihitung "setuju".
 */
const STRATEGY_CONFIRM_MIN_AGREE = 2;
const STRATEGY_CONFIRM_MIN_CONFIDENCE = 0.6;

export interface StrategyConfirmationResult {

  confirmed: boolean;

  agreeCount: number;

  totalCount: number;

  auditLog: string;

}

/**
 * Filter konfirmasi di atas DecisionEngine, KHUSUS untuk sinyal BUY.
 *
 * SELL/exit dari DecisionEngine SENGAJA tidak melewati filter ini,
 * konsisten dengan prinsip yang sudah ada di TradingEngine.run()
 * (emergency stop hanya blokir BUY, tidak pernah blokir SELL) --
 * plus strategyManager.compare() saat ini tidak meneruskan parameter
 * `position`, jadi rule exit di strategi orphan tidak reliable
 * dipakai untuk konfirmasi SELL.
 *
 * Fail-safe: kalau data candle tidak ada/tidak cukup, dianggap TIDAK
 * terkonfirmasi (BUY diturunkan ke HOLD), bukan sebaliknya.
 */
async function confirmBuyWithOrphanStrategies(
  pair: string,
  candles: Candle[] | undefined
): Promise<StrategyConfirmationResult> {

  if (!candles || candles.length === 0) {

    return {
      confirmed: false,
      agreeCount: 0,
      totalCount: 0,
      auditLog:
        "Data candle tidak tersedia untuk filter strategi orphan -- BUY diturunkan ke HOLD (fail-safe).",
    };

  }

  const mappedCandles: IndicatorCandle[] = candles.map((c) => ({
    symbol: pair.toUpperCase(),
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
    volume: c.volume,
    timestamp: c.time,
  }));

  const calc = indicatorManager.calculate(mappedCandles, pair);

  if (!calc) {

    return {
      confirmed: false,
      agreeCount: 0,
      totalCount: 0,
      auditLog:
        "Candle kurang dari minimum (30) untuk indicatorManager -- BUY diturunkan ke HOLD (fail-safe).",
    };

  }

  const results: StrategyDecision[] = strategyManager.compare(calc.features);

  const agreeing = results.filter(
    (r) =>
      r.action === "BUY" &&
      r.confidence >= STRATEGY_CONFIRM_MIN_CONFIDENCE
  );

  const confirmed =
    results.length > 0 &&
    agreeing.length >= STRATEGY_CONFIRM_MIN_AGREE;

  const detail = results
    .map((r) => `${r.strategy}=${r.action}(${r.confidence.toFixed(2)})`)
    .join(", ");

  return {
    confirmed,
    agreeCount: agreeing.length,
    totalCount: results.length,
    auditLog: confirmed
      ? `Terkonfirmasi ${agreeing.length}/${results.length} strategi orphan setuju BUY [${detail}].`
      : `Ditolak filter -- hanya ${agreeing.length}/${results.length} strategi orphan setuju BUY (butuh minimal ${STRATEGY_CONFIRM_MIN_AGREE}, confidence>=${STRATEGY_CONFIRM_MIN_CONFIDENCE}) [${detail}].`,
  };

}

export class TradingEngine {

  /**
   * Menjalankan satu siklus trading
   */
  static async run(
    input: TradingEngineInput
  ): Promise<TradingEngineResult> {

    const control =
      await getBotControl();

    const liveActive = isLiveModeActive(control);

    const tradingService = liveActive
      ? LiveTradingService
      : PaperTradingService;

    const modeLabel: "paper" | "live" =
      liveActive ? "live" : "paper";

    // Peringatan kalau mode="live" (dashboard maupun env var)
    // tapi BOT_LIVE_CONFIRM belum - supaya user tahu kenapa
    // masih paper trading.
    if (
      control.mode === "live" &&
      !liveActive
    ) {

      await recordLog(
        "SYSTEM",
        "warning",
        `Mode live diminta (dashboard/env) tapi BOT_LIVE_CONFIRM belum "true" - tetap jalan PAPER trading sebagai fail-safe.`
      );

    }

    try {

      // CATATAN PENTING: emergencyStop HANYA memblokir BUY baru
      // (dicek di bawah, di dalam case "BUY"). Emergency stop
      // TIDAK PERNAH memblokir SELL, stop-loss, maupun take-profit
      // paksa — supaya posisi terbuka tidak "nyangkut" kalau
      // emergency stop sedang aktif saat harga turun.

      const state =
        await getBotState(input.pair);

      const portfolio =
        await getPaperPortfolio(BOT_CONFIG.startingBalance);

      const riskState =
        await getRiskState();

      // --- 1. Cek stop-loss / take-profit paksa (kalau sedang posisi) ---
      // Ini dicek TERPISAH dari sinyal strategi, supaya posisi tetap
      // ditutup walau EMA/RSI belum kasih sinyal SELL. TIDAK diblokir
      // emergency stop (lihat catatan di atas).
      if (state.inPosition) {

        const riskEval = RiskManager.evaluate({

          buyPrice: state.entryPrice,

          currentPrice: input.price,

          inPosition: true,

        });

        if (riskEval.shouldStopLoss || riskEval.shouldTakeProfit) {

          const result = await tradingService.sell({

            pair: input.pair,

            price: input.price,

            amount: state.coinAmount,

          });

          const pnlIdr =
            (input.price - state.entryPrice) * state.coinAmount;

          await recordRealizedPnl(pnlIdr);

          await updateBotState({

            pair: input.pair,

            inPosition: false,

            entryPrice: 0,

            coinAmount: 0,

            currentPrice: input.price,

            lastSignal: "SELL",

          });

          await recordLog(
            "RISK",
            riskEval.shouldStopLoss ? "warning" : "success",
            `[${modeLabel.toUpperCase()}] ${riskEval.reason} ${input.pair.toUpperCase()} @ ${input.price}`
          );

          return {

            success: true,

            signal: "SELL",

            confidence: 1,

            reason: riskEval.reason,

            actionExecuted: result.success,

            mode: modeLabel,

            timestamp: new Date().toISOString(),

          };

        }

      }

      // --- 2. Evaluasi sinyal strategi seperti biasa ---
      const decisionInput: DecisionInput = {

        price: input.price,

        rsi: input.rsi,

        emaFast: input.emaFast,

        emaSlow: input.emaSlow,

        inPosition: state.inPosition,

      };

      let decision: DecisionResult =
        DecisionEngine.evaluate(
          decisionInput
        );

      // --- 2b. Filter konfirmasi strategi orphan (KHUSUS BUY) ---
      // DecisionEngine tetap sumber sinyal utama. Strategi orphan
      // (src/services/strategy/*) di sini hanya menolak/mengonfirmasi,
      // TIDAK PERNAH mengubah HOLD jadi BUY/SELL, dan TIDAK PERNAH
      // mengubah arah BUY jadi SELL atau sebaliknya.
      if (decision.signal === "BUY") {

        const confirmation =
          await confirmBuyWithOrphanStrategies(
            input.pair,
            input.candles
          );

        await recordLog(
          "BOT",
          confirmation.confirmed ? "success" : "warning",
          `[Filter Konfirmasi ${input.pair.toUpperCase()}] ${confirmation.auditLog}`
        );

        if (!confirmation.confirmed) {

          decision = {

            signal: "HOLD",

            confidence: decision.confidence,

            reason: `BUY (${decision.reason}) ditolak filter konfirmasi strategi orphan: ${confirmation.auditLog}`,

          };

        }

      }

      // --- Persist currentPrice/lastSignal SETIAP siklus ---
      // (sebelumnya cuma di-update saat BUY/SELL, jadi nilai ini
      // nyangkut di lama/default kalau hasil siklus HOLD - yang
      // paling sering terjadi. Dashboard butuh nilai ini selalu
      // segar untuk tampilkan harga/sinyal terkini.)
      await updateBotState({

        pair: input.pair,

        currentPrice: input.price,

        lastSignal: decision.signal,

      });

      let actionExecuted = false;

      switch (decision.signal) {

        case "BUY": {

          // --- Emergency Stop: blokir BUY baru saja ---
          // Dicek dari DUA sumber -- env var (RISK_CONFIG, butuh
          // redeploy) dan dashboard toggle (bot_control, real-time).
          // Mana saja yang aktif akan memblokir BUY.
          if (RISK_CONFIG.emergencyStop || control.emergencyStop) {

            await recordLog(
              "RISK",
              "warning",
              `Emergency stop aktif — BUY ${input.pair.toUpperCase()} diblokir (SELL tetap diizinkan).`
            );

            return {

              success: true,

              signal: "HOLD",

              confidence: decision.confidence,

              reason: "Emergency stop aktif — BUY baru diblokir, posisi terbuka tetap bisa SELL.",

              actionExecuted: false,

              riskBlocked: true,

              mode: modeLabel,

              timestamp: new Date().toISOString(),

            };

          }

          const tradeAmountIdr =
            BOT_CONFIG.defaultTradeAmount;

          // --- Batas jumlah posisi terbuka (lintas semua pair) ---
          const openPositionsCount =
            await getOpenPositionsCount();

          if (openPositionsCount >= RISK_CONFIG.maxOpenPosition) {

            await recordLog(
              "RISK",
              "warning",
              `Batas posisi terbuka tercapai (${openPositionsCount}/${RISK_CONFIG.maxOpenPosition}) — BUY ${input.pair.toUpperCase()} diblokir.`
            );

            return {

              success: true,

              signal: "HOLD",

              confidence: decision.confidence,

              reason: "Jumlah posisi terbuka sudah mencapai batas maksimum (RISK_CONFIG.maxOpenPosition).",

              actionExecuted: false,

              riskBlocked: true,

              mode: modeLabel,

              timestamp: new Date().toISOString(),

            };

          }

          // --- Batas rugi harian ---
          const maxDailyLossIdr =
            (RISK_CONFIG.maxDailyLossPercent / 100) *
            portfolio.startingBalance;

          if (riskState.dailyPnlIdr <= -maxDailyLossIdr) {

            await recordLog(
              "RISK",
              "warning",
              `Batas rugi harian tercapai (${riskState.dailyPnlIdr.toFixed(
                0
              )} IDR) — BUY ${input.pair.toUpperCase()} diblokir.`
            );

            return {

              success: true,

              signal: "HOLD",

              confidence: decision.confidence,

              reason: "Batas rugi harian tercapai — BUY baru diblokir sampai besok.",

              actionExecuted: false,

              riskBlocked: true,

              mode: modeLabel,

              timestamp: new Date().toISOString(),

            };

          }

          // --- Cooldown antar trade ---
          const lastUpdatedMs = toMillis(state.updatedAt);

          const secondsSinceLastUpdate =
            lastUpdatedMs > 0
              ? (Date.now() - lastUpdatedMs) / 1000
              : Infinity;

          if (secondsSinceLastUpdate < RISK_CONFIG.cooldownSeconds) {

            await recordLog(
              "RISK",
              "info",
              `Cooldown aktif — BUY ${input.pair.toUpperCase()} ditunda (${Math.round(
                RISK_CONFIG.cooldownSeconds - secondsSinceLastUpdate
              )} detik lagi).`
            );

            return {

              success: true,

              signal: "HOLD",

              confidence: decision.confidence,

              reason: "Cooldown antar trade masih berjalan.",

              actionExecuted: false,

              riskBlocked: true,

              mode: modeLabel,

              timestamp: new Date().toISOString(),

            };

          }

          // --- Max exposure per trade ---
          const maxExposureIdr =
            (RISK_CONFIG.maxExposurePercent / 100) *
            portfolio.equityIdr;

          if (
            tradeAmountIdr > BOT_CONFIG.maxTradeAmount ||
            tradeAmountIdr > maxExposureIdr ||
            tradeAmountIdr > portfolio.availableBalance
          ) {

            await recordLog(
              "RISK",
              "warning",
              `Exposure/saldo tidak cukup — BUY ${input.pair.toUpperCase()} diblokir.`
            );

            return {

              success: true,

              signal: "HOLD",

              confidence: decision.confidence,

              reason: "Nominal trade melebihi batas exposure atau saldo tidak cukup.",

              actionExecuted: false,

              riskBlocked: true,

              mode: modeLabel,

              timestamp: new Date().toISOString(),

            };

          }

          const result = await tradingService.buy({

            pair: input.pair,

            price: input.price,

          });

          await updateBotState({

            pair: input.pair,

            inPosition: true,

            entryPrice: result.price,

            coinAmount: result.amount,

          });

          await recordLog(
            "BOT",
            "success",
            `[${modeLabel.toUpperCase()}] BUY ${input.pair.toUpperCase()} @ ${result.price}`
          );

          actionExecuted = true;

          break;

        }

        case "SELL": {

          const result = await tradingService.sell({

            pair: input.pair,

            price: input.price,

            amount: state.coinAmount,

          });

          const pnlIdr =
            (input.price - state.entryPrice) * state.coinAmount;

          await recordRealizedPnl(pnlIdr);

          await updateBotState({

            pair: input.pair,

            inPosition: false,

            entryPrice: 0,

            coinAmount: 0,

          });

          await recordLog(
            "BOT",
            "success",
            `[${modeLabel.toUpperCase()}] SELL ${input.pair.toUpperCase()} @ ${result.price}`
          );

          actionExecuted = result.success;

          break;

        }

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

        mode: modeLabel,

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
        `Trading Engine Error (${modeLabel}): ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );

      return {

        success: false,

        signal: "HOLD",

        confidence: 0,

        reason: "Trading engine failed.",

        actionExecuted: false,

        mode: modeLabel,

        timestamp: new Date().toISOString(),

      };

    }

  }

}

export default TradingEngine;
