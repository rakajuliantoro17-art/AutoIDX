/**
==========================================================
AURA Trade OS
Trading Scheduler (Cron)
Version : 0.2.0

Perubahan dari 0.1.0: cron.ts sekarang membangun
IndicatorFeatureVector LENGKAP (RSI/EMA/MACD/ATR/ADX/Stochastic/
Bollinger, lewat services/strategy/featureBuilder.ts) dari candle
OHLC asli, dan mengirimkannya ke TradingEngine sebagai `features`.
TradingEngine memakai ini untuk mengevaluasi sinyal lewat
services/strategy/* (strategyManager, default AURA_TREND) --
BUKAN lagi DecisionEngine lama (RSI+EMA doang, AND-gate kaku).

(Sebelumnya sempat ada percobaan lain yang mengirim `candles` mentah
ke TradingEngine untuk filter konfirmasi terpisah -- pendekatan itu
digantikan pendekatan ini karena filter konfirmasi menumpuk dua
AND-gate sekaligus dan membuat sinyal BUY makin jarang muncul.)

Universe pair yang diproses tiap siklus = gabungan dari:
1. candidatePairs   -- SEMUA pair qualified hasil scan seluruh
                        market Indodax (kalau diberikan)
2. openPositionPairs -- pair yang SEDANG punya posisi terbuka,
                        SELALU diproses supaya stop-loss/
                        take-profit/SELL tetap jalan walau
                        pair itu sudah tidak lagi qualified di
                        siklus scan berikutnya
3. TRADING_CONFIG.pairs -- watchlist manual dari env var
                        BOT_PAIRS, tetap dihormati sebagai
                        pair yang mau selalu dipantau operator

Kalau `candidatePairs` tidak diberikan (mis. dipanggil manual
tanpa scan), perilaku lama tetap jalan: TRADING_CONFIG.pairs +
openPositionPairs.
==========================================================
*/
import { getCandles } from "../indodax/candles";
import {
  buildFeatureVector,
  MIN_CANDLES_FOR_FEATURES,
} from "../strategy/featureBuilder";
import { TradingEngine } from "../trading/engine";
import { recordLog } from "../firebase/logService";
import { getOpenPositionPairs } from "../firebase/botState";
import { TRADING_CONFIG } from "@/config/trading";

export interface CronPairResult {
  pair: string;
  success: boolean;
  message: string;
  durationMs: number;
}

export interface CronResult {
  success: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  pairsProcessed: string[];
  results: CronPairResult[];
}

/**
 * Proses satu pair. Dipisah supaya try/catch-nya
 * terisolasi per pair.
 */
async function processPair(pair: string): Promise<CronPairResult> {

  const pairStarted = Date.now();

  try {

    await recordLog("SYSTEM", "info", `Cron execution started (${pair}).`);

    const candles = await getCandles({ pair, limit: 100 });

    if (candles.length < MIN_CANDLES_FOR_FEATURES) {
      throw new Error(
        `Data candle tidak cukup untuk ${pair} (dapat ${candles.length}, butuh minimal ${MIN_CANDLES_FOR_FEATURES})`
      );
    }

    const features = buildFeatureVector(pair, candles);

    const engineResult = await TradingEngine.run({
      pair,
      price: features.price,
      features,
    });

    await recordLog(
      "BOT",
      engineResult.success ? "success" : "warning",
      `Trading Engine (${pair}): ${engineResult.reason}`
    );

    return {
      pair,
      success: engineResult.success,
      message: engineResult.reason,
      durationMs: Date.now() - pairStarted,
    };

  }
  catch (error) {

    console.error(`[Scheduler] ${pair}`, error);

    await recordLog(
      "SYSTEM",
      "danger",
      `Cron execution failed for ${pair}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );

    return {
      pair,
      success: false,
      message: error instanceof Error ? error.message : "Unknown scheduler error",
      durationMs: Date.now() - pairStarted,
    };

  }

}

export async function executeCron(
  candidatePairs?: string[]
): Promise<CronResult> {

  const started = Date.now();

  // Pair yang SEDANG open position -- selalu ikut diproses supaya
  // stop-loss/take-profit/SELL tetap jalan walau pair itu sudah
  // tidak lagi qualified di siklus scan berikutnya.
  const openPositionPairs = await getOpenPositionPairs();

  const pairs = Array.from(
    new Set(
      [
        ...(candidatePairs ?? []),
        ...openPositionPairs,
        ...TRADING_CONFIG.pairs,
      ]
        .map((p) => p.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  if (candidatePairs && candidatePairs.length > 0) {
    await recordLog(
      "SYSTEM",
      "info",
      `Cron memproses ${pairs.length} pair (${candidatePairs.length} dari hasil scan market, ${openPositionPairs.length} posisi terbuka, ${TRADING_CONFIG.pairs.length} watchlist manual).`
    );
  }

  const results: CronPairResult[] = [];

  for (const pair of pairs) {
    const result = await processPair(pair);
    results.push(result);
  }

  const finished = Date.now();

  return {
    success: results.every((r) => r.success),
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date(finished).toISOString(),
    durationMs: finished - started,
    pairsProcessed: pairs,
    results,
  };

}

/**
 * Alias
 */
export default executeCron;
