/**
==========================================================
AURA Trade OS
Trading Engine
Version : 0.2.1 Alpha
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

PERBAIKAN v0.2.1 (2 bug dari penempelan notifikasi Telegram):
- Blok stop-loss/take-profit paksa sebelumnya TIDAK PERNAH ditutup
  dengan benar -- recordRealizedPnl, updateBotState(inPosition:
  false), dan `return` awal HILANG, jadi eksekusi SL/TP akan
  lanjut mengevaluasi sinyal strategi lagi dengan status posisi
  yang sudah usang (berisiko double-sell/state korup). Sudah
  dikembalikan.
- Notifikasi "BUY Tereksekusi" yang salah nyasar ke dalam
  `case "SELL"` (referensi `atrLevels` di luar scope -- error
  compile) sudah dihapus, cuma tersisa notifikasi "SELL
  Tereksekusi" yang benar.
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
import { explainDecision } from "@/services/intelligence/ai/decisionExplainer";

import PaperTradingService from "./paper";
import LiveTradingService from "./live";

import RiskManager from "./risk";

import automationNotifier from "@/services/automation/notifier";

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

import { getPaperPortfolio } from "@/services/firebase/paperTradingStore";
import { getActiveIndodaxAccount } from "@/services/firebase/indodaxAccountsAdmin";
import { IndodaxClient } from "@/services/liveTrading/exchange/indodaxClient";

import { BOT_CONFIG } from "@/config/bot";
import { RISK_CONFIG } from "@/config/risk";
import { getEffectiveTradingConfig } from "./effectiveConfig";
import positionSizing from "@/services/execution/risk/positionSizing";
import { TradingError } from "@/errors";
import type { Candle } from "@/services/indodax/candles";
import { getTrendVolumeAdvisory } from "@/services/strategy/trendVolumeAdvisor";
import mlAdvisor from "@/services/intelligence/ml/mlAdvisor";

export interface TradingEngineInput {

  pair: string;

  price: number;

  features: IndicatorFeatureVector;

  /**
   * Opsional -- candle mentah (limit 100, sama yang dipakai cron.ts
   * untuk hitung features). Optional supaya non-breaking untuk
   * caller lama. Dipakai HANYA oleh trendVolumeAdvisor (advisory,
   * tidak memblokir eksekusi) untuk hitung SMA(20)/OBV real yang
   * butuh candle penuh, bukan cuma scalar features.
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
  features: IndicatorFeatureVector,
  candles?: Candle[]
): Promise<void> {

  // Trend+Volume Advisory (observability only) -- lihat catatan
  // lengkap di services/strategy/trendVolumeAdvisor.ts. Sengaja
  // BUKAN gate/sanity-check tambahan: project ini pernah mencoba
  // gerbang berlapis dan DIBATALKAN pemilik project sendiri karena
  // BUY jadi terlalu jarang. Kalau dihapus total, tidak ada
  // perilaku BUY/SELL yang berubah -- cuma log yang hilang.
  try {
    const trendVolumeResult = getTrendVolumeAdvisory(pair, price, features, candles);

    if (trendVolumeResult) {
      await recordLog("BOT", "info", trendVolumeResult.logLine);
    }
  } catch (tvError) {
    console.error("[Trend+Volume Advisory]", tvError);
  }

  // ML Advisory (observability only) -- lihat catatan lengkap di
  // services/intelligence/ml/mlAdvisor.ts. Sengaja TERPISAH dari
  // blok AI provider di bawah (tidak butuh env key LLM apapun) dan
  // dibungkus try/catch sendiri supaya kegagalan di sini (paling
  // umum: belum ada model terlatih) TIDAK PERNAH mempengaruhi AI
  // Advisory/Consensus di bawahnya maupun keputusan BUY/SELL/HOLD.
  try {
    const mlResult = await mlAdvisor.getMLAdvisory(pair, features);

    if (mlResult) {
      await recordLog("BOT", "info", mlResult.logLine);
    }
  } catch (mlError) {
    console.error("[ML Advisory]", mlError);
  }

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

      // Observability only -- lihat catatan di decisionExplainer.ts.
      // Tidak mempengaruhi consensusInputs / keputusan apapun di bawah ini.
      try {
        const explain = explainDecision(features, context, {
          signal: analysis.signal,
          confidence: analysis.confidence,
          summary: analysis.summary,
        });

        await recordLog(
          "BOT",
          "info",
          `[AI Explainability ${pair.toUpperCase()}] ${candidate.name}: ${explain.logLine}`
        );
      } catch (explainError) {
        // Fail-safe: kegagalan di lapisan explainability TIDAK PERNAH
        // mengganggu jalur advisory/consensus di atas maupun di bawah.
        console.error("[AI Explainability]", explainError);
      }

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

    // Observability only -- lihat catatan di decisionExplainer.ts.
    // Tidak mempengaruhi keputusan BUY/SELL/HOLD manapun.
    try {
      const explain = explainDecision(features, context, {
        signal: consensus.signal,
        confidence: consensus.confidence,
        summary: consensus.explanation,
      });

      await recordLog(
        "BOT",
        "info",
        `[AI Explainability ${pair.toUpperCase()}] Consensus: ${explain.logLine}`
      );
    } catch (explainError) {
      console.error("[AI Explainability]", explainError);
    }

  } catch (error) {

    // Fail-safe: error di jalur advisory TIDAK PERNAH melempar ke
    // atas / menghentikan siklus trading.
    console.error("[AI Advisory]", error);

  }

}

/**
 * BUG FIX (live BUY selalu diblokir): SEBELUMNYA engine.ts selalu
 * pakai getPaperPortfolio() (saldo SIMULASI di Firestore
 * paper_portfolio/default) untuk risk-gate exposure/saldo-cukup,
 * TERMASUK saat mode live. Kalau saldo simulasi paper itu menipis
 * (sangat mungkin setelah paper trading jalan beberapa waktu),
 * BUY di LIVE ikut diblokir -- walau saldo IDR asli di Indodax
 * cukup, karena risk-gate membandingkan ke angka simulasi yang
 * sama sekali tidak berhubungan dengan uang asli.
 *
 * Sekarang: mode live ambil saldo ASLI dari Indodax (IndodaxClient.
 * getInfo(), cara yang sama dipakai LiveTradingService.buy() untuk
 * pengecekan internalnya). Fail-safe: kalau gagal ambil saldo asli
 * (akun tidak aktif/API error), availableBalance dikembalikan 0 --
 * ini akan memblokir BUY (aman/fail-closed), BUKAN meloloskannya
 * begitu saja.
 *
 * equityIdr didekati dengan saldo IDR saja (tidak menghitung nilai
 * pasar posisi koin yang sedang terbuka) -- ini sengaja
 * KONSERVATIF: maxExposurePercent jadi dihitung dari basis yang
 * lebih kecil/aman daripada seharusnya, bukan lebih besar.
 */
async function getRiskGatePortfolio(
  liveActive: boolean
): Promise<{ startingBalance: number; availableBalance: number; equityIdr: number }> {

  if (!liveActive) {
    return getPaperPortfolio(BOT_CONFIG.startingBalance);
  }

  try {

    const account = await getActiveIndodaxAccount();

    if (!account) {

      await recordLog(
        "RISK",
        "danger",
        "Mode live: tidak ada akun Indodax aktif -- saldo dianggap 0 (fail-safe, BUY akan diblokir)."
      );

      return {
        startingBalance: BOT_CONFIG.startingBalance,
        availableBalance: 0,
        equityIdr: 0,
      };

    }

    const client = new IndodaxClient({
      apiKey: account.apiKey,
      secretKey: account.secretKey,
    });

    const info = await client.getInfo();

    if (!info.success) {

      await recordLog(
        "RISK",
        "danger",
        `Mode live: gagal ambil saldo Indodax asli (${info.message}) -- saldo dianggap 0 (fail-safe, BUY akan diblokir).`
      );

      return {
        startingBalance: BOT_CONFIG.startingBalance,
        availableBalance: 0,
        equityIdr: 0,
      };

    }

    const idrBalance = Number(info.data.balance?.idr ?? 0);

    return {
      startingBalance: BOT_CONFIG.startingBalance,
      availableBalance: idrBalance,
      equityIdr: idrBalance,
    };

  } catch (error) {

    await recordLog(
      "RISK",
      "danger",
      `Mode live: error ambil saldo Indodax asli (${
        error instanceof Error ? error.message : "unknown"
      }) -- saldo dianggap 0 (fail-safe, BUY akan diblokir).`
    );

    return {
      startingBalance: BOT_CONFIG.startingBalance,
      availableBalance: 0,
      equityIdr: 0,
    };

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
        await getRiskGatePortfolio(liveActive);

      const riskState =
        await getRiskState();

      // --- Config gabungan BotSettings (Firestore, operator-
      // adjustable) + BOT_CONFIG/RISK_CONFIG (env, batas aman) --
      // SATU sumber ini dipakai baik untuk validasi risk-gate
      // MAUPUN untuk eksekusi (tradingService.buy), supaya
      // keduanya tidak pernah melihat angka yang berbeda. Lihat
      // services/trading/effectiveConfig.ts.
      const effectiveConfig = await getEffectiveTradingConfig();

      if (
        effectiveConfig.clamped.tradeAmountIdr ||
        effectiveConfig.clamped.maxOpenPositions ||
        effectiveConfig.clamped.stopLossPercent ||
        effectiveConfig.clamped.targetProfitPercent
      ) {

        await recordLog(
          "BOT",
          "info",
          `[Effective Config ${input.pair.toUpperCase()}] Nilai dari dashboard Settings di-clamp ke batas aman BOT_CONFIG/RISK_CONFIG: ${JSON.stringify(effectiveConfig.clamped)}`
        );

      }

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

          // Notifikasi best-effort tapi TETAP di-await -- di
          // lingkungan serverless (Vercel), promise yang tidak
          // di-await bisa hilang begitu saja kalau function
          // selesai duluan sebelum promise-nya resolve. notify()
          // sudah menangani error-nya sendiri secara internal
          // (tidak pernah throw), jadi aman di-await tanpa risiko
          // mengganggu alur trading.
          await automationNotifier[riskEval.shouldStopLoss ? "warning" : "success"](
            riskEval.shouldStopLoss ? "Stop Loss Tereksekusi" : "Take Profit Tereksekusi",
            `[${modeLabel.toUpperCase()}] ${input.pair.toUpperCase()} @ Rp${input.price.toLocaleString("id-ID")}\nPnL: ${riskEval.profitLossPercent}%\n${riskEval.reason}`
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

      // Mode strategi (CONSERVATIVE/BALANCED/AGGRESSIVE) sekarang
      // bisa diatur dari dashboard Settings -> Strategy (BotSettings.
      // strategyMode via effectiveConfig), bukan hardcode BALANCED
      // lagi. strategyManager singleton -- aman dipanggil di sini
      // walau banyak pair diproses berurutan/paralel karena semua
      // pair memang pakai mode global yang sama.
      strategyManager.setMode(effectiveConfig.strategyMode);

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
            await logAIAdvisory(input.pair, input.price, input.features, input.candles);

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

          let tradeAmountIdr =
            effectiveConfig.tradeAmountIdr;

          if (RISK_CONFIG.sizingMode === "RISK_BASED") {

            try {

              const stopLossPrice =
                input.price * (1 - RISK_CONFIG.stopLossPercent / 100);

              const sizing = positionSizing.calculate({
                accountBalance: portfolio.availableBalance,
                riskPercent: RISK_CONFIG.riskPercentPerTrade,
                entryPrice: input.price,
                stopLossPrice,
              });

              tradeAmountIdr = sizing.positionValue;

              await recordLog(
                "RISK",
                "info",
                `Risk-based sizing ${input.pair.toUpperCase()}: risk ${RISK_CONFIG.riskPercentPerTrade}% dari saldo (Rp${Math.round(sizing.riskAmount)}) -> posisi Rp${Math.round(sizing.positionValue)}.`
              );

            } catch (sizingError) {

              // Fail-safe: kalau perhitungan risk-based gagal (mis.
              // saldo 0, stopLossPercent 0), JANGAN gagalkan siklus
              // trading -- fallback ke tradeAmountIdr tetap seperti
              // mode FIXED.
              console.error("[Position Sizing]", sizingError);

              await recordLog(
                "RISK",
                "warning",
                `Risk-based sizing gagal (${sizingError instanceof Error ? sizingError.message : "unknown"}), fallback ke tradeAmountIdr tetap.`
              );

            }

          }

          const openPositionsCount =
            await getOpenPositionsCount();

          if (openPositionsCount >= effectiveConfig.maxOpenPositions) {

            await recordLog(
              "RISK",
              "warning",
              `Batas posisi terbuka tercapai (${openPositionsCount}/${effectiveConfig.maxOpenPositions}) — BUY ${input.pair.toUpperCase()} diblokir.`
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

            // Klasifikasi error TERSTRUKTUR (services/errors -> src/errors,
            // sebelumnya orphan) supaya rejection ini bisa di-filter
            // di log Firestore (mis. cari semua "[EXPOSURE_LIMIT]" atau
            // "[INSUFFICIENT_FUNDS]"), bukan cuma teks bebas. Kontrak
            // return TradingEngine.run() TIDAK berubah -- reason tetap
            // string seperti sebelumnya, kodenya cuma disisipkan sebagai
            // prefix.
            const exposureError = new TradingError({
              message: "Nominal trade melebihi batas exposure atau saldo tidak cukup.",
              code:
                tradeAmountIdr > portfolio.availableBalance
                  ? "INSUFFICIENT_FUNDS"
                  : "EXPOSURE_LIMIT",
              symbol: input.pair,
              details: {
                tradeAmountIdr,
                maxExposureIdr,
                maxTradeAmount: BOT_CONFIG.maxTradeAmount,
                availableBalance: portfolio.availableBalance,
              },
            });

            await recordLog(
              "RISK",
              "warning",
              `[${exposureError.code}] ${exposureError.message} (${input.pair.toUpperCase()})`
            );

            return {

              success: true,

              signal: "HOLD",

              confidence: decision.confidence,

              reason: `[${exposureError.code}] ${exposureError.message}`,

              actionExecuted: false,

              riskBlocked: true,

              mode: modeLabel,

              timestamp: new Date().toISOString(),

            };

          }

          const result = await tradingService.buy({

            pair: input.pair,

            price: input.price,

            // Eksplisit -- ini yang memperbaiki bug divergensi lama:
            // sebelumnya di sini TIDAK dikirim, jadi trading/paper.ts
            // diam-diam fallback ke getBotSettings().tradeAmountIdr
            // (Firestore, bisa beda dari yang divalidasi risk-gate di
            // atas). Sekarang keduanya SELALU pakai effectiveConfig
            // yang sama persis.
            tradeAmountIdr: effectiveConfig.tradeAmountIdr,

          });

          // Hitung level SL/TP dari ATR pair ini SEKALI di sini
          // (saat entry) -- disimpan sebagai harga absolut, BUKAN
          // dihitung ulang tiap siklus. input.features.atr sudah
          // tersedia dari featureBuilder.ts (dihitung dari candle
          // OHLC asli), jadi tidak perlu request tambahan.
          // baseStopLossPercent/baseTargetProfitPercent dari
          // effectiveConfig (BotSettings, di-clamp) -- operator bisa
          // atur rasio risk:reward dari dashboard tanpa redeploy.
          const atrLevels = RiskManager.calculateAtrStopLevels(
            result.price,
            input.features.atr,
            effectiveConfig.stopLossPercent,
            effectiveConfig.targetProfitPercent
          );

          await updateBotState({

            pair: input.pair,

            inPosition: true,

            entryPrice: result.price,

            coinAmount: result.amount,

            stopLossPrice: atrLevels.stopLossPrice,

            takeProfitPrice: atrLevels.takeProfitPrice,

          });

          await recordLog(
            "RISK",
            "info",
            `[${modeLabel.toUpperCase()}] SL/TP (ATR) ${input.pair.toUpperCase()}: SL ${atrLevels.stopLossPrice.toFixed(2)} (-${atrLevels.stopLossPercent}%), TP ${atrLevels.takeProfitPrice.toFixed(2)} (+${atrLevels.takeProfitPercent}%).`
          );

          await recordLog(
            "BOT",
            "success",
            `[${modeLabel.toUpperCase()}] BUY ${input.pair.toUpperCase()} @ ${result.price}`
          );

          await automationNotifier.success(
            "BUY Tereksekusi",
            `[${modeLabel.toUpperCase()}] ${input.pair.toUpperCase()} @ Rp${result.price.toLocaleString("id-ID")}\nSL: Rp${atrLevels.stopLossPrice.toFixed(0)} | TP: Rp${atrLevels.takeProfitPrice.toFixed(0)}`
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

          await automationNotifier.success(
            "SELL Tereksekusi",
            `[${modeLabel.toUpperCase()}] ${input.pair.toUpperCase()} @ Rp${result.price.toLocaleString("id-ID")}\nPnL: Rp${pnlIdr.toLocaleString("id-ID")}`
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
