/**
==========================================================
AURA Trade OS
Trading Scheduler (Cron)
Version : 0.0.9 Alpha

Perubahan dari 0.0.8: mendukung MULTI-PAIR. Loop atas
TRADING_CONFIG.pairs (bukan cuma TRADING_CONFIG.pair
tunggal). Setiap pair diproses dengan try/catch terpisah
supaya satu pair gagal (mis. data candle tidak cukup)
TIDAK menggagalkan pair lain dalam siklus yang sama.
==========================================================
*/
import { getClosePrices } from "../indodax/candles";
import { calculateRSI } from "../indicators/rsi";
import { calculateEMA } from "../indicators/movingAverage";
import { TradingEngine } from "../trading/engine";
import { recordLog } from "../firebase/logService";
import { TRADING_CONFIG } from "@/config/trading";

const RSI_PERIOD = 14;
const EMA_FAST_PERIOD = 9;
const EMA_SLOW_PERIOD = 21;

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

    const closePrices = await getClosePrices({ pair, limit: 100 });

    if (closePrices.length < EMA_SLOW_PERIOD) {
      throw new Error(
        `Data harga tidak cukup untuk ${pair} (dapat ${closePrices.length}, butuh minimal ${EMA_SLOW_PERIOD})`
      );
    }

    const price = closePrices[closePrices.length - 1];
    const rsi = calculateRSI(closePrices, RSI_PERIOD);
    const emaFast = calculateEMA(closePrices, EMA_FAST_PERIOD);
    const emaSlow = calculateEMA(closePrices, EMA_SLOW_PERIOD);

    const engineResult = await TradingEngine.run({
      pair,
      price,
      rsi,
      emaFast,
      emaSlow,
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

export async function executeCron(): Promise<CronResult> {

  const started = Date.now();
  const pairs = TRADING_CONFIG.pairs;

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
    results,
  };

}

/**
 * Alias
 */
export default executeCron;
