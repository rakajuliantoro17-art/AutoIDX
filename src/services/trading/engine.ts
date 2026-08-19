/**
==========================================================
AURA Trade OS
Trading Engine
Version : 0.2.0 Alpha
(Gabungan perubahan:
1. Validasi risk sebelum eksekusi - emergency stop, batas rugi
   harian, cooldown, max exposure, max open position, dan
   stop-loss/take-profit paksa yang jalan terpisah dari sinyal
   strategi.
2. BOT_MODE sekarang benar-benar jadi switch paper/live. Live
   trading TIDAK akan pernah jalan kecuali DUA syarat terpenuhi:
   BOT_MODE=live DAN BOT_LIVE_CONFIRM=true.
3. Emergency Stop HANYA memblokir BUY baru, TIDAK PERNAH
   memblokir SELL/stop-loss/take-profit paksa.
4. updateBotState dipanggil SETIAP siklus.
5. Sinyal BUY/SELL dari services/strategy/* (strategyManager,
   default mode BALANCED -> AURA_TREND) sebagai sumber UTAMA.
6. SANITY CHECK RINGAN (bukan AND-gate berlapis) sebelum BUY
   diteruskan ke risk gate:
   - Tolak HANYA kalau strategi lain (EMA_CROSSOVER, MOMENTUM)
     KOMPAK bilang SELL (kontradiksi kuat terhadap AURA_TREND).
   - Tolak HANYA kalau MomentumRule+VolatilityRule (ScoreEngine)
     menghasilkan SELL, atau HOLD dengan confidence sangat rendah.
   Keduanya sengaja LONGGAR (bukan mewajibkan semua setuju) --
   supaya BUY tidak jadi nyaris-selalu-HOLD lagi seperti masalah
   awal DecisionEngine dulu, tapi tetap ada jaring pengaman kalau
   sinyal utama jelas-jelas bertentangan dengan pembacaan lain.
   TrendRule & VolumeRule (butuh SMA/OBV dari candle penuh) TIDAK
   dipakai di sini karena kontrak input sekarang cuma `features`
   ringkas, bukan candle OHLCV -- lihat catatan di confirmBuyWithAI.
7. AI (ai/providers/*, lewat marketContextEngine + prompt.ts +
   responseParser.ts) dipanggil sebagai ADVISORY ONLY -- hasilnya
   dicatat ke log untuk dipelajari/dikalibrasi nanti, TAPI TIDAK
   memblokir eksekusi BUY. Ini supaya latency/biaya panggilan API
   eksternal tidak jadi titik gagal yang menghentikan trading.
   Fail-safe kalau AI gagal/tidak ada key: cuma tidak ada log
   tambahan, tidak mempengaruhi keputusan sama sekali.
==========================================================
*/

import type {
  DecisionResult,
} from "./decision";

import strategyManager from "@/services/strategy/manager";
import type { StrategyManagerResult } from "@/services/strategy/manager";
import type { IndicatorFeatureVector } from "@/services/indicators";
import type { StrategyContext, RuleResult, StrategyDecision } from "@/services/strategy/types";

import { MomentumRule } from "@/services/strategy/rules/momentumRule";
import { VolatilityRule } from "@/services/strategy/rules/volatilityRule";
import { ScoreEngine } from "@/services/strategy/scoring/scoreEngine";

import marketContextEngine from "@/services/intelligence/context/marketContext";
import aiPrompt from "@/services/intelligence/ai/prompt";
import { parseAIResponse } from "@/services/intelligence/ai/responseParser";
import openAIProvider from "@/services/intelligence/ai/providers/openai";
import geminiProvider from "@/services/intelligence/ai/providers/gemini";
import claudeProvider from "@/services/intelligence/ai/providers/claude";
import deepSeekProvider from "@/services/intelligence/ai/providers/deepseek";
import type { AIAnalysis } from "@/services/intelligence/types";
import aiConsensus from "@/services/intelligence/ai/consensus";
import type { AIConsensusInput } from "@/services/intelligence/ai/consensus";

import PaperTradingService from "./paper";
import LiveTradingService from "./live";

import RiskManager from "./risk";

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

  features: IndicatorFeatureVector;

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

const scoreEngine = new ScoreEngine();

function toMillis(value: any): number {

  if (!value) return 0;

  if (typeof value.toMillis === "function") return value.toMillis();

  if (typeof value.toDate === "function") return value.toDate().getTime();

  if (value instanceof Date) return value.getTime();

  return 0;

}

/**
 * Live trading HANYA aktif kalau DUA syarat terpenuhi:
 * bot_control.mode === "live" DAN process.env.BOT_LIVE_CONFIRM
 * === "true".
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
 * Adaptor: StrategyManagerResult -> DecisionResult (bentuk lama
 * yang dipakai alur risk-gate/eksekusi di bawah).
 */
function mapStrategyResultToDecision(
  result: StrategyManagerResult
): DecisionResult {

  if (!result.decision) {

    return {
      signal: "HOLD",
      confidence: 0,
      reason: `Strategi "${result.strategy}" tidak menghasilkan keputusan.`,
    };

  }

  const reasonText =
    result.decision.reasons.length > 0
      ? result.decision.reasons.join(", ")
      : "Tidak ada rule yang terpenuhi.";

  return {

    signal: result.decision.action,

    confidence: result.decision.confidence,

    reason: `[${result.strategy}] ${reasonText}`,

  };

}

interface SanityCheckResult {
  passed: boolean;
  auditLog: string;
}

/**
 * Sanity check #1: tolak BUY HANYA kalau strategi lain di luar
 * strategi utama (AURA_TREND) KOMPAK bilang SELL. Kalau cuma
 * campur/beda pendapat, tetap lolos -- ini sengaja longgar.
 */
function checkStrategyContradiction(
  features: IndicatorFeatureVector,
  primaryStrategyName: string
): SanityCheckResult {

  const others: StrategyDecision[] = strategyManager
    .compare(features)
    .filter((d) => d.strategy !== primaryStrategyName);

  const strongContradiction =
    others.length >= 2 &&
    others.every((d) => d.action === "SELL");

  return {
    passed: !strongContradiction,
    auditLog: strongContradiction
      ? `Ditolak -- strategi lain kompak SELL: ${others.map((d) => `${d.strategy}=${d.action}`).join(", ")}.`
      : `Lolos -- tidak ada kontradiksi kuat: ${others.map((d) => `${d.strategy}=${d.action}`).join(", ")}.`,
  };

}

/**
 * Sanity check #2: MomentumRule + VolatilityRule (via ScoreEngine).
 * TrendRule & VolumeRule tidak dipakai di sini (butuh SMA/OBV dari
 * candle penuh, tidak tersedia di kontrak input `features` yang
 * ringkas). Tolak HANYA kalau hasilnya SELL, atau HOLD dengan
 * confidence sangat rendah (<30) -- bukan mewajibkan BUY tegas.
 */
function checkRuleScoreContradiction(
  pair: string,
  price: number,
  features: IndicatorFeatureVector,
  position: "NONE" | "LONG",
  balance: number
): SanityCheckResult {

  const context: StrategyContext = {

    pair,

    features,

    indicators: {
      macd: features.macd,
      histogram: features.macdHistogram,
      rsi: features.rsi,
      ema: features.emaSlow,
      sma: 0,
      atr: features.atr,
      bollingerUpper: features.bollingerUpper,
      bollingerMiddle: features.bollingerMiddle,
      bollingerLower: features.bollingerLower,
      obv: 0,
    },

    snapshot: { close: price },

    mode: "BALANCED",

    position,

    balance,

    timestamp: Date.now(),

  };

  const ruleResults: RuleResult[] = [
    new MomentumRule().evaluate(context),
    new VolatilityRule().evaluate(context),
  ];

  const score = scoreEngine.evaluate(ruleResults);

  const rejected =
    score.signal === "SELL" ||
    (score.signal === "HOLD" && score.confidence < 30);

  return {
    passed: !rejected,
    auditLog: rejected
      ? `Ditolak -- Momentum+Volatility ScoreEngine: signal=${score.signal}, confidence=${score.confidence}. ${score.reasons.join("; ")}`
      : `Lolos -- Momentum+Volatility ScoreEngine: signal=${score.signal}, confidence=${score.confidence}.`,
  };

}

const AI_CALL_TIMEOUT_MS = 20_000;

interface AIProviderCandidate {
  name: string;
  envKey: string;
  query: (prompt: string) => Promise<{ success: boolean; content: string | null }>;
}

const AI_PROVIDER_CANDIDATES: AIProviderCandidate[] = [
  { name: "openai", envKey: "OPENAI_API_KEY", query: (p) => openAIProvider.query(p) },
  { name: "gemini", envKey: "GEMINI_API_KEY", query: (p) => geminiProvider.query(p) },
  { name: "claude", envKey: "CLAUDE_API_KEY", query: (p) => claudeProvider.query(p) },
  { name: "deepseek", envKey: "DEEPSEEK_API_KEY", query: (p) => deepSeekProvider.query(p) },
];

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

/**
 * AI ADVISORY (tidak memblokir). Dipanggil setelah kedua sanity
 * check lolos, tapi hasilnya cuma dicatat ke log -- TIDAK
 * mempengaruhi apakah BUY jadi dieksekusi atau tidak. Ini supaya
 * latency (sampai 20 detik) dan biaya panggilan API eksternal
 * tidak menghentikan alur trading, sambil tetap mengumpulkan data
 * untuk dievaluasi/dikalibrasi nanti (mis. dijadikan gerbang wajib
 * kalau setelah beberapa minggu terbukti akurat).
 *
 * Update: sebelumnya cuma memanggil SATU provider (yang pertama
 * ketemu API key-nya). Sekarang memanggil SEMUA provider yang
 * API key-nya tersedia SECARA PARALEL (bukan sekuensial -- jadi
 * total latency tetap dibatasi ~AI_CALL_TIMEOUT_MS, tidak
 * berkali-lipat), lalu hasilnya digabung lewat aiConsensus
 * (weighted voting) supaya satu LLM yang halusinasi/salah tidak
 * mendominasi. Kalau cuma 1 provider yang valid, consensus
 * dilewati (tidak ada gunanya voting dengan 1 suara).
 */
async function logAIAdvisory(
  pair: string,
  price: number,
  features: IndicatorFeatureVector
): Promise<void> {

  const availableCandidates = AI_PROVIDER_CANDIDATES.filter(
    (c) => !!process.env[c.envKey]
  );

  if (availableCandidates.length === 0) {
    return;
  }

  try {

    const context = marketContextEngine.build({ pair, features });

    const prompt = aiPrompt.build({ pair, featureVector: features, context });

    const responses = await Promise.all(
      availableCandidates.map(async (candidate) => ({
        candidate,
        response: await withTimeout(candidate.query(prompt), AI_CALL_TIMEOUT_MS),
      }))
    );

    const consensusInputs: AIConsensusInput[] = [];

    for (const { candidate, response } of responses) {

      if (!response || !response.success) {

        await recordLog(
          "BOT",
          "info",
          `[AI Advisory ${pair.toUpperCase()}] Panggilan ${candidate.name} gagal/timeout -- tidak mempengaruhi keputusan.`
        );

        continue;

      }

      const analysis: AIAnalysis | null = parseAIResponse(response.content);

      if (!analysis) {

        await recordLog(
          "BOT",
          "info",
          `[AI Advisory ${pair.toUpperCase()}] Balasan ${candidate.name} tidak valid JSON -- tidak mempengaruhi keputusan.`
        );

        continue;

      }

      await recordLog(
        "BOT",
        "info",
        `[AI Advisory ${pair.toUpperCase()}] ${candidate.name}: signal=${analysis.signal}, confidence=${analysis.confidence}. ${analysis.summary}`
      );

      consensusInputs.push({
        provider: candidate.name as AIConsensusInput["provider"],
        signal: analysis.signal,
        confidence: analysis.confidence,
        weight: 20,
        explanation: analysis.summary,
      });

    }

    // Consensus cuma bermakna kalau ada 2+ provider yang jawabannya
    // valid -- kalau cuma 1 (atau 0), hasil per-provider di atas
    // sudah cukup, tidak perlu "voting" dengan 1 suara.
    if (consensusInputs.length < 2) {
      return;
    }

    const consensus = aiConsensus.evaluate(consensusInputs);

    await recordLog(
      "BOT",
      "info",
      `[AI Consensus ${pair.toUpperCase()}] signal=${consensus.signal}, agreement=${consensus.agreement}%, providers=${consensus.providers.join(", ")}. ${consensus.explanation}`
    );

  } catch (error) {

    // Fail-safe: error di jalur advisory TIDAK PERNAH melempar ke
    // atas / menghentikan siklus trading.
    console.error("[AI Advisory]", error);

  }

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

      const state =
        await getBotState(input.pair);

      const portfolio =
        await getPaperPortfolio(BOT_CONFIG.startingBalance);

      const riskState =
        await getRiskState();

            // --- 1. Cek stop-loss / take-profit paksa (kalau sedang posisi) ---
      // Sekarang pakai level HARGA ABSOLUT (state.stopLossPrice/
      // takeProfitPrice) yang dihitung dari ATR SEKALI saat BUY --
      // bukan lagi persentase statis RISK_CONFIG yang dihitung ulang
      // tiap siklus dan sama untuk semua pair (lihat risk.ts,
      // calculateAtrStopLevels). Posisi lama yang belum punya level
      // ATR tersimpan (stopLossPrice=0) otomatis fallback ke
      // persentase statis di dalam evaluateWithLevels().
      if (state.inPosition) {

        const riskEval = RiskManager.evaluateWithLevels(

          state.entryPrice,

          input.price,

          true,

          state.stopLossPrice,

          state.takeProfitPrice

        );

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

      // --- 2. Evaluasi sinyal strategi (sumber UTAMA) ---
      const position: "NONE" | "LONG" =
        state.inPosition ? "LONG" : "NONE";

      const strategyResult: StrategyManagerResult =
        strategyManager.evaluate(
          input.features,
          position
        );

      let decision: DecisionResult =
        mapStrategyResultToDecision(strategyResult);

      // --- 2b. Sanity check ringan (KHUSUS BUY, longgar -- lihat
      //     komentar di atas file & checkStrategyContradiction /
      //     checkRuleScoreContradiction) ---
      if (decision.signal === "BUY") {

        const check1 = checkStrategyContradiction(
          input.features,
          strategyResult.strategy
        );

        await recordLog(
          "BOT",
          check1.passed ? "success" : "warning",
          `[Sanity Check 1 - Konsensus ${input.pair.toUpperCase()}] ${check1.auditLog}`
        );

        if (!check1.passed) {

          decision = {
            signal: "HOLD",
            confidence: decision.confidence,
            reason: `BUY (${decision.reason}) ditolak sanity check konsensus: ${check1.auditLog}`,
          };

        } else {

          const check2 = checkRuleScoreContradiction(
            input.pair,
            input.price,
            input.features,
            position,
            portfolio.availableBalance ?? 0
          );

          await recordLog(
            "BOT",
            check2.passed ? "success" : "warning",
            `[Sanity Check 2 - ScoreEngine ${input.pair.toUpperCase()}] ${check2.auditLog}`
          );

          if (!check2.passed) {

            decision = {
              signal: "HOLD",
              confidence: decision.confidence,
              reason: `BUY (${decision.reason}) ditolak sanity check ScoreEngine: ${check2.auditLog}`,
            };

          } else {

            // Lolos kedua sanity check -- AI dipanggil ADVISORY ONLY,
            // tidak menunggu/menggantungkan keputusan BUY padanya.
            await logAIAdvisory(input.pair, input.price, input.features);

          }

        }

      }

      // --- Persist currentPrice/lastSignal SETIAP siklus ---
      await updateBotState({

        pair: input.pair,

        currentPrice: input.price,

        lastSignal: decision.signal,

      });

      let actionExecuted = false;

      switch (decision.signal) {

        case "BUY": {

          // --- Emergency Stop: blokir BUY baru saja ---
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
