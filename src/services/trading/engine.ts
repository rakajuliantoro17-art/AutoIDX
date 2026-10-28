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
import { BelowMinimumOrderError, checkSellableAtStop } from "./minOrder";

import RiskManager from "./risk";

import automationNotifier from "@/services/automation/notifier";
import { isFeatureEnabled } from "@/services/firebase/featureFlags";
import { calculateTrailingStop } from "@/services/trading/trailingStop";
import { checkPortfolioExposure } from "@/services/trading/exposure";
import { MAX_EXPOSURE_PERCENT as ABSOLUTE_MAX_EXPOSURE_PERCENT } from "@/config/limits";

import { auditLogger } from "@/services/audit/firestoreAudit";
import { handleError } from "@/services/errors/errorHandler";
import { RiskError } from "@/services/errors/riskError";

import {
  getBotState,
  updateBotState,
  getOpenPositionsCount,
  getOpenExposureIdr,
} from "@/services/firebase/botState";

import {
  recordLog,
} from "@/services/firebase/logService";

import {
  getRiskState,
  recordRealizedPnl,
  latchLossLimit,
} from "@/services/firebase/riskState";
import { evaluateDailyLoss } from "@/services/safety/dailyLossGuard";
import { raiseAlert } from "@/services/alerts/raiseAlert";

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
import type { Candle } from "@/services/indodax/candles";
import { getTrendVolumeAdvisory } from "@/services/strategy/trendVolumeAdvisor";
import mlAdvisor from "@/services/intelligence/ml/mlAdvisor";
import { recordShadowPrediction } from "@/services/ml/shadow/shadowStore";
import type { PredictionLabel } from "@/services/ml/types";


/** Throttle log SELL di bawah minimum (best-effort, per instance). */
const belowMinLogAt = new Map<string, number>();

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

function isLiveModeActive(

  control: { mode: "paper" | "live" }

): boolean {

  return (
    control.mode === "live" &&
    process.env.BOT_LIVE_CONFIRM === "true"
  );

}

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

/**
 * PENTING (root cause cron/scan.ts sempat DEAD): sebelumnya 20
 * detik -- terlalu besar untuk panggilan yang PURNA ADVISORY
 * (logAIAdvisory dipanggil setelah keputusan BUY sudah final,
 * hasilnya cuma dicatat ke log, TIDAK PERNAH mempengaruhi
 * keputusan trading). Kalau provider AI lambat/timeout (pernah
 * terjadi di production -- log "[AI Advisory BTC_IDR] Panggilan
 * gemini gagal/timeout"), 20 detik dikali beberapa pair yang
 * qualified BUY di siklus yang sama bisa gampang melebihi
 * maxDuration:60 di pages/api/cron/scan.ts -- Vercel membunuh
 * function SEBELUM recordHeartbeat() di akhir siklus sempat
 * jalan, bikin cronHeartbeat.ts mendeteksi status DEAD walau
 * sebenarnya bukan scan.ts yang "berhenti", cuma kehabisan waktu
 * nunggu AI yang hasilnya toh tidak dipakai.
 *
 * Diturunkan LAGI dari 6 detik ke 4 detik: trigger UTAMA sekarang
 * cron-job.org, yang punya batas keras request timeout 30 DETIK
 * (tidak bisa dinaikkan lewat pengaturan mereka -- jauh lebih
 * ketat dari maxDuration:60 Vercel yang jadi acuan sebelumnya).
 * Lihat juga MAX_CANDIDATE_PAIRS_PER_CYCLE di
 * services/scheduler/scanCycle.ts (diturunkan 15->8 bersamaan)
 * untuk penjelasan lengkap perhitungan budget waktunya.
 */
const AI_CALL_TIMEOUT_MS = 4_000;

interface AIProviderCandidate {
  name: string;
  envKey: string;
  query: (prompt: string) => Promise<{ success: boolean; content: string | null }>;
}

const AI_PROVIDER_CANDIDATES: AIProviderCandidate[] = [
  { name: "openai", envKey: "OPENAI_API_KEY", query: (p) => openAIProvider.query(p) },
  { name: "gemini", envKey: "GEMINI_API_KEY", query: (p) => geminiProvider.query(p) },
  { name: "claude", envKey: process.env.CLAUDE_API_KEY ? "CLAUDE_API_KEY" : "ANTHROPIC_API_KEY", query: (p) => claudeProvider.query(p) },
  { name: "deepseek", envKey: "DEEPSEEK_API_KEY", query: (p) => deepSeekProvider.query(p) },
];

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

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

      // Shadow mode: simpan prediksi untuk dinilai terhadap harga nyata
      // belakangan (flag `aiShadowPrediction`, default MATI). Best-effort.
      if (await isFeatureEnabled("aiShadowPrediction")) {
        await recordShadowPrediction({
          pair,
          price: features.price,
          label: mlResult.label,
          confidence: mlResult.confidence,
          modelId: mlResult.modelId,
        });
      }
    }
  } catch (mlError) {
    console.error("[ML Advisory]", mlError);
  }

  const availableCandidates = AI_PROVIDER_CANDIDATES.filter(
    (c) => !!process.env[c.envKey]
  );
  const recordLlmShadow = availableCandidates.length > 0 && (await isFeatureEnabled("aiShadowPrediction"));

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
        console.error("[AI Explainability]", explainError);
      }

      if (recordLlmShadow) {
        // Shadow: nilai tiap LLM terhadap harga nyata (flag aiShadowPrediction).
        try {
          await recordShadowPrediction({
            pair,
            price: features.price,
            label: analysis.signal as PredictionLabel,
            confidence: analysis.confidence / 100,
            modelId: candidate.name,
            source: `llm:${candidate.name}`,
          });
        } catch (shadowError) {
          console.error("[AI Shadow]", shadowError);
        }
      }
      consensusInputs.push({
        provider: candidate.name as AIConsensusInput["provider"],
        signal: analysis.signal,
        confidence: analysis.confidence,
        weight: 20,
        explanation: analysis.summary,
      });

    }

    if (consensusInputs.length < 2) {
      return;
    }

    const consensus = aiConsensus.evaluate(consensusInputs);
    if (recordLlmShadow) {
      try {
        await recordShadowPrediction({
          pair,
          price: features.price,
          label: consensus.signal as PredictionLabel,
          confidence: consensus.confidence / 100,
          modelId: "consensus",
          source: "llm:consensus",
        });
      } catch (shadowError) {
        console.error("[AI Shadow]", shadowError);
      }
    }

    await recordLog(
      "BOT",
      "info",
      `[AI Consensus ${pair.toUpperCase()}] signal=${consensus.signal}, agreement=${consensus.agreement}%, providers=${consensus.providers.join(", ")}. ${consensus.explanation}`
    );

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

    console.error("[AI Advisory]", error);

  }

}

/**
 * Cache 30 detik untuk hasil getRiskGatePortfolio() mode LIVE.
 *
 * BUG FIX (kontributor timeout cron/scan.ts): fungsi ini
 * dipanggil TANPA SYARAT di awal setiap run() -- dan run()
 * dipanggil SEKALI PER PAIR oleh cron.ts. Dengan ~15-20 pair per
 * siklus (full-market scan + open position + watchlist), itu
 * artinya client.getInfo() (API PRIVAT Indodax, perlu HMAC
 * signing, lebih lambat dari endpoint publik) terpanggil 15-20x
 * per siklus untuk DATA YANG SAMA PERSIS (saldo akun tidak
 * berubah dalam hitungan detik antar pair). Redundansi ini
 * kemungkinan kontributor signifikan ke timeout maxDuration:60
 * yang terkonfirmasi terjadi di production.
 *
 * Cache 30 detik: cukup untuk menaungi satu siklus cron penuh
 * (durasi umum jauh di bawah itu bahkan dengan concurrency),
 * TAPI otomatis basi jauh sebelum siklus BERIKUTNYA (jarak antar
 * siklus cron/GitHub Actions >= beberapa menit) -- tidak berisiko
 * menyajikan saldo basi lintas siklus, cuma menghindari panggilan
 * ulang REDUNDAN dalam satu siklus yang sama. Aman dari masalah
 * "warm container reuse" Vercel karena TTL jauh lebih pendek dari
 * jarak antar invocation cron manapun.
 */
let cachedLivePortfolio:
  | { value: { startingBalance: number; availableBalance: number; equityIdr: number }; fetchedAt: number }
  | null = null;

const LIVE_PORTFOLIO_CACHE_TTL_MS = 30_000;

async function getRiskGatePortfolio(
  liveActive: boolean
): Promise<{ startingBalance: number; availableBalance: number; equityIdr: number }> {

  if (!liveActive) {
    return getPaperPortfolio(BOT_CONFIG.startingBalance);
  }

  if (
    cachedLivePortfolio &&
    Date.now() - cachedLivePortfolio.fetchedAt < LIVE_PORTFOLIO_CACHE_TTL_MS
  ) {
    return cachedLivePortfolio.value;
  }

  try {

    const account = await getActiveIndodaxAccount();

    if (!account) {

      await recordLog(
        "RISK",
        "danger",
        "Mode live: tidak ada akun Indodax aktif -- saldo dianggap 0 (fail-safe, BUY akan diblokir)."
      );

      const result = {
        startingBalance: BOT_CONFIG.startingBalance,
        availableBalance: 0,
        equityIdr: 0,
      };

      // TIDAK di-cache -- kegagalan konfigurasi (akun tidak ada)
      // sebaiknya dicek ulang tiap pair, bukan dianggap valid 30
      // detik, supaya kalau akun baru diaktifkan di tengah siklus
      // langsung terdeteksi pair berikutnya.
      return result;

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

      // TIDAK di-cache juga -- sama alasannya, error transient
      // (network blip) sebaiknya dicoba ulang pair berikutnya,
      // bukan mengunci semua pair sisanya di siklus ini ke 0.
      return {
        startingBalance: BOT_CONFIG.startingBalance,
        availableBalance: 0,
        equityIdr: 0,
      };

    }

    const idrBalance = Number(info.data.balance?.idr ?? 0);

    const result = {
      startingBalance: BOT_CONFIG.startingBalance,
      availableBalance: idrBalance,
      equityIdr: idrBalance,
    };

    cachedLivePortfolio = { value: result, fetchedAt: Date.now() };

    return result;

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

      if (state.inPosition) {

        // Trailing stop (flag `trailingStop` DAN env TRAILING_STOP_ENABLED):
        // stop-loss hanya naik saat harga di atas harga beli, tersimpan di
        // bot_state supaya siklus berikutnya melanjutkan. Mati = perilaku lama.
        let activeStopLossPrice = state.stopLossPrice;

        if (
          RISK_CONFIG.trailingStop.enabled &&
          state.stopLossPrice > 0 &&
          (await isFeatureEnabled("trailingStop"))
        ) {
          const raised = calculateTrailingStop(
            state.entryPrice,
            input.price,
            state.stopLossPrice,
            RISK_CONFIG.trailingStop.percent
          );

          if (raised !== null) {
            activeStopLossPrice = raised;

            try {
              await updateBotState({ pair: input.pair, stopLossPrice: raised });
              await recordLog(
                "RISK",
                "info",
                `[Trailing Stop ${input.pair.toUpperCase()}] Stop-loss naik ${state.stopLossPrice.toFixed(2)} -> ${raised.toFixed(2)} (harga ${input.price}).`
              );
            } catch (trailError) {
              console.error("[Trailing Stop]", trailError);
            }
          }
        }

        const riskEval = RiskManager.evaluateWithLevels(

          state.entryPrice,

          input.price,

          true,

          activeStopLossPrice,

          state.takeProfitPrice

        );

        if (riskEval.shouldStopLoss || riskEval.shouldTakeProfit) {

          const result = await tradingService.sell({

            pair: input.pair,

            price: input.price,

            amount: state.coinAmount,

            strategy: state.strategyAtEntry,

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

            strategyAtEntry: "",

          });

          await recordLog(
            "RISK",
            riskEval.shouldStopLoss ? "warning" : "success",
            `[${modeLabel.toUpperCase()}] ${riskEval.reason} ${input.pair.toUpperCase()} @ ${input.price}`
          );

          await automationNotifier[riskEval.shouldStopLoss ? "warning" : "success"](
            riskEval.shouldStopLoss ? "Stop Loss Tereksekusi" : "Take Profit Tereksekusi",
            `[${modeLabel.toUpperCase()}] ${input.pair.toUpperCase()} @ Rp${input.price.toLocaleString("id-ID")}\nPnL: ${riskEval.profitLossPercent}%\n${riskEval.reason}`
          );

          await auditLogger.log(
            "ORDER_FILLED",
            `${riskEval.shouldStopLoss ? "Stop Loss" : "Take Profit"} SELL ${input.pair} @ ${input.price} (${modeLabel})`,
            {
              symbol: input.pair,
              metadata: {
                mode: modeLabel,
                trigger: riskEval.shouldStopLoss ? "STOP_LOSS" : "TAKE_PROFIT",
                price: input.price,
                entryPrice: state.entryPrice,
                profitLossPercent: riskEval.profitLossPercent,
              },
            }
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

      const position: "NONE" | "LONG" =
        state.inPosition ? "LONG" : "NONE";

      strategyManager.setMode(effectiveConfig.strategyMode);

      const strategyResult: StrategyManagerResult =
        strategyManager.evaluate(
          input.features,
          position
        );

      let decision: DecisionResult =
        mapStrategyResultToDecision(strategyResult);

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

            // FIRE-AND-FORGET (sengaja TIDAK di-await). logAIAdvisory
            // sudah 100% advisory-only & fail-safe -- tidak ada kode
            // setelah ini yang bergantung pada hasilnya.
            //
            // CATATAN JUJUR soal batasan di Vercel serverless: berbeda
            // dari server yang hidup terus, function di sini BISA
            // dibekukan begitu response HTTP utama terkirim -- promise
            // ini TIDAK DIJAMIN selalu selesai sampai tuntas kalau ini
            // pair TERAKHIR yang diproses dalam satu siklus cron. Ini
            // trade-off yang disengaja: siklus cron yang RELIABLE
            // selesai dalam budget waktu (termasuk SELL/stop-loss
            // pair lain yang sedang open position) jauh lebih penting
            // daripada AI Advisory (fitur observasional) yang kadang
            // terpotong. Sebelumnya di-await penuh (sampai
            // AI_CALL_TIMEOUT_MS ~20 detik PER PAIR) yang justru
            // berkontribusi ke TIMEOUT SELURUH SIKLUS cron (lebih
            // buruk -- bukan cuma AI Advisory yang gagal, SEMUA pair
            // termasuk stop-loss/take-profit ikut tidak diproses).
            void logAIAdvisory(input.pair, input.price, input.features, input.candles).catch(
              (error) => {
                console.error("[AI Advisory] Unhandled error (non-fatal)", error);
              }
            );

          }

        }

      }

      await updateBotState({

        pair: input.pair,

        currentPrice: input.price,

        lastSignal: decision.signal,

      });

      let actionExecuted = false;

      switch (decision.signal) {

        case "BUY": {

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

          const dailyLoss = evaluateDailyLoss({
            dailyPnlIdr: riskState.dailyPnlIdr,
            readFailed: riskState.readFailed,
            latched: riskState.lossLimitLatched,
            maxDailyLossPercent: RISK_CONFIG.maxDailyLossPercent,
            startingBalance: portfolio.startingBalance,
            live: liveActive,
          });

          if (dailyLoss.blocked) {

            if (dailyLoss.reason === "LIMIT_REACHED" && !riskState.lossLimitLatched) {
              await latchLossLimit();
              await raiseAlert(
                "DAILY_LOSS_LIMIT",
                "Batas rugi harian tercapai",
                `Rugi hari ini ${riskState.dailyPnlIdr.toFixed(0)} IDR (batas ${dailyLoss.maxDailyLossIdr.toFixed(0)} IDR). BUY baru diblokir sampai besok.`
              );
            }

            await recordLog(
              "RISK",
              "warning",
              dailyLoss.reason === "STATE_UNREADABLE"
                ? `Status rugi harian tidak bisa dibaca — BUY ${input.pair.toUpperCase()} diblokir (fail-closed, mode live).`
                : `Batas rugi harian tercapai (${riskState.dailyPnlIdr.toFixed(
                    0
                  )} IDR) — BUY ${input.pair.toUpperCase()} diblokir.`
            );

            return {

              success: true,

              signal: "HOLD",

              confidence: decision.confidence,

              reason:
                dailyLoss.reason === "STATE_UNREADABLE"
                  ? "Status rugi harian tidak bisa dibaca — BUY baru diblokir (fail-closed)."
                  : "Batas rugi harian tercapai — BUY baru diblokir sampai besok.",

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

            // RiskError.exposureExceeded() (services/errors/riskError.ts,
            // sekarang jadi sistem error kanonik project ini -- lihat
            // handleError() di catch block bawah) -- factory method
            // ini SUDAH tersedia persis untuk kasus ini, jadi dipakai
            // langsung alih-alih menulis klasifikasi manual sendiri.
            // insufficientFunds dibedakan dari exposureLimit murni
            // lewat metric, TIDAK mengubah kontrak return (reason
            // tetap string, riskBlocked tetap ada).
            const isInsufficientFunds =
              tradeAmountIdr > portfolio.availableBalance;

            const riskError = RiskError.exposureExceeded(
              tradeAmountIdr,
              Math.min(maxExposureIdr, portfolio.availableBalance, BOT_CONFIG.maxTradeAmount),
              {
                pair: input.pair,
                operation: "reject",
                metric: isInsufficientFunds ? "balance" : "exposure",
              }
            );

            await recordLog(
              "RISK",
              "warning",
              `[${riskError.metric?.toUpperCase()}] ${riskError.message} (${input.pair.toUpperCase()})`
            );

            return {

              success: true,

              signal: "HOLD",

              confidence: decision.confidence,

              reason: `[${riskError.metric?.toUpperCase()}] Nominal trade melebihi batas exposure atau saldo tidak cukup.`,

              actionExecuted: false,

              riskBlocked: true,

              mode: modeLabel,

              timestamp: new Date().toISOString(),

            };

          }

          // Batas exposure TOTAL portofolio (flag `portfolioExposureLimit`,
          // default MATI): posisi terbuka + trade baru <= batas absolut
          // dari ekuitas total. Gagal baca posisi => diblokir (fail-safe).
          if (await isFeatureEnabled("portfolioExposureLimit")) {
            const openExposureIdr = await getOpenExposureIdr();
            const totalCheck = checkPortfolioExposure(
              openExposureIdr,
              tradeAmountIdr,
              portfolio.availableBalance,
              ABSOLUTE_MAX_EXPOSURE_PERCENT
            );

            if (!totalCheck.allowed) {
              await recordLog(
                "RISK",
                "warning",
                `[EXPOSURE TOTAL] BUY ${input.pair.toUpperCase()} diblokir: setelah trade, exposure ${totalCheck.afterTradePercent.toFixed(1)}% dari ekuitas total (batas ${ABSOLUTE_MAX_EXPOSURE_PERCENT}%).`
              );

              return {
                success: true,
                signal: "HOLD",
                confidence: decision.confidence,
                reason: `[EXPOSURE TOTAL] Total posisi terbuka + trade baru melebihi ${ABSOLUTE_MAX_EXPOSURE_PERCENT}% ekuitas.`,
                actionExecuted: false,
                riskBlocked: true,
                mode: modeLabel,
                timestamp: new Date().toISOString(),
              };
            }
          }

          // Guard sellability (live): posisi harus tetap >= minimum order
          // Indodax pada level stop-loss, kalau tidak SL tidak bisa jalan.
          if (modeLabel === "live") {
            // SL aktual berbasis ATR (0.5-8%), bisa lebih lebar dari slider.
            const atrStopPercent = RiskManager.calculateAtrStopLevels(
              input.price,
              input.features.atr,
              effectiveConfig.stopLossPercent,
              effectiveConfig.targetProfitPercent
            ).stopLossPercent;
            const sellable = checkSellableAtStop(
              tradeAmountIdr,
              Math.max(effectiveConfig.stopLossPercent, atrStopPercent)
            );
            if (!sellable.ok) {
              await recordLog(
                "RISK",
                "warning",
                `[MIN ORDER] BUY ${input.pair.toUpperCase()} diblokir: nilai posisi di SL ~Rp${Math.round(sellable.valueAtStopIdr)} < Rp${Math.round(sellable.requiredIdr)} (min order Indodax + margin). Naikkan nominal ke minimal ~Rp${sellable.minTradeAmountIdr}.`
              );
              return {
                success: true,
                signal: "HOLD",
                confidence: decision.confidence,
                reason: `[MIN ORDER] Nominal terlalu kecil agar stop-loss bisa dieksekusi (minimal ~Rp${sellable.minTradeAmountIdr}).`,
                actionExecuted: false,
                riskBlocked: true,
                mode: modeLabel,
                timestamp: new Date().toISOString(),
              };
            }
          }

          const result = await tradingService.buy({

            pair: input.pair,

            price: input.price,

            tradeAmountIdr: effectiveConfig.tradeAmountIdr,

            maxOpenPositions: effectiveConfig.maxOpenPositions,

            strategy: strategyResult.strategy,

          });

          // Feature flag `fixedTakeProfit` (Firestore bot_control/flags,
          // default MATI): TP tetap 1-5% dari harga beli sesuai slider
          // Take Profit. Mati = perilaku lama (TP = rasio x SL ATR).
          const fixedTakeProfitPercent = (await isFeatureEnabled("fixedTakeProfit"))
            ? Math.min(5, Math.max(1, effectiveConfig.targetProfitPercent))
            : undefined;

          const atrLevels = RiskManager.calculateAtrStopLevels(
            result.price,
            input.features.atr,
            effectiveConfig.stopLossPercent,
            effectiveConfig.targetProfitPercent,
            fixedTakeProfitPercent
          );

          await updateBotState({

            pair: input.pair,

            inPosition: true,

            entryPrice: result.price,

            coinAmount: result.amount,

            stopLossPrice: atrLevels.stopLossPrice,

            takeProfitPrice: atrLevels.takeProfitPrice,

            strategyAtEntry: strategyResult.strategy,

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

          await auditLogger.log(
            "ORDER_FILLED",
            `BUY ${input.pair} @ ${result.price} (${modeLabel})`,
            {
              symbol: input.pair,
              metadata: {
                mode: modeLabel,
                side: "BUY",
                price: result.price,
                amount: result.amount,
                strategy: strategyResult.strategy,
                stopLossPrice: atrLevels.stopLossPrice,
                takeProfitPrice: atrLevels.takeProfitPrice,
              },
            }
          );

          actionExecuted = true;

          break;

        }

        case "SELL": {

          const result = await tradingService.sell({

            pair: input.pair,

            price: input.price,

            amount: state.coinAmount,

            strategy: state.strategyAtEntry,

          });

          const pnlIdr =
            (input.price - state.entryPrice) * state.coinAmount;

          await recordRealizedPnl(pnlIdr);

          await updateBotState({

            pair: input.pair,

            inPosition: false,

            entryPrice: 0,

            coinAmount: 0,

            strategyAtEntry: "",

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

          await auditLogger.log(
            "ORDER_FILLED",
            `SELL ${input.pair} @ ${result.price} (${modeLabel})`,
            {
              symbol: input.pair,
              metadata: {
                mode: modeLabel,
                side: "SELL",
                trigger: "STRATEGY_SIGNAL",
                price: result.price,
                entryPrice: state.entryPrice,
                pnlIdr,
              },
            }
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

      if (error instanceof BelowMinimumOrderError) {
        // Posisi tidak bisa dijual sampai harga naik. Bukan error sistem.
        const now = Date.now();
        const last = belowMinLogAt.get(input.pair) ?? 0;
        if (now - last > 60 * 60 * 1000) {
          belowMinLogAt.set(input.pair, now);
          await recordLog(
            "RISK",
            "warning",
            `[MIN ORDER] SELL ${input.pair.toUpperCase()} ditunda: nilai posisi Rp${Math.round(error.valueIdr)} < Rp10000 (minimum Indodax). Menunggu harga naik; log ini dibatasi 1x/jam.`
          );
        }
        return {
          success: true,
          signal: "HOLD",
          confidence: 0,
          reason: "[MIN ORDER] SELL ditunda: di bawah minimum order Indodax.",
          actionExecuted: false,
          mode: modeLabel,
          timestamp: new Date().toISOString(),
        };
      }

      // handleError() (services/errors/*, sebelumnya orphan) --
      // menormalisasi error apa pun jadi AURAError terstruktur
      // (kategori, retryable, severity) TANPA mengubah perilaku
      // fail-safe yang sudah ada (tetap balikin HOLD, tidak throw
      // ulang). Manfaatnya cuma observability: log sekarang punya
      // kategori mesin-terbaca, bukan cuma teks bebas.
      const handled = handleError(error, {
        source: "TradingEngine.run",
        operation: `${modeLabel}:${input.pair}`,
      });

      await recordLog(
        "SYSTEM",
        "danger",
        `Trading Engine Error (${modeLabel}) [${handled.category}${handled.retryable ? ", retryable" : ""}]: ${handled.error.message}`
      );

      await auditLogger.log(
        "ORDER_REJECTED",
        `Trading engine gagal untuk ${input.pair} (${modeLabel}): ${handled.error.message}`,
        {
          symbol: input.pair,
          metadata: {
            category: handled.category,
            retryable: handled.retryable,
            code: handled.code,
          },
        }
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
