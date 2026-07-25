/**
==========================================================
AURA Trade OS
Trading Scheduler (Cron)
Version : 0.0.8 Alpha

Menjalankan satu siklus penuh: ambil harga close terbaru ->
hitung RSI & EMA -> serahkan ke TradingEngine untuk
keputusan BUY/SELL/HOLD (paper trading).
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

export interface CronResult {
  success: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  message: string;
}

export async function executeCron(): Promise<CronResult> {
  const started = Date.now();
  const pair = TRADING_CONFIG.pair;

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

    const finished = Date.now();

    const result: CronResult = {
      success: engineResult.success,
      startedAt: new Date(started).toISOString(),
      finishedAt: new Date(finished).toISOString(),
      durationMs: finished - started,
      message: engineResult.reason,
    };

    await recordLog(
      "BOT",
      engineResult.success ? "success" : "warning",
      `Trading Engine (${pair}): ${engineResult.reason}`
    );

    return result;
  } catch (error) {
    console.error("[Scheduler]", error);

    await recordLog(
      "SYSTEM",
      "danger",
      `Cron execution failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );

    const finished = Date.now();

    return {
      success: false,
      startedAt: new Date(started).toISOString(),
      finishedAt: new Date(finished).toISOString(),
      durationMs: finished - started,
      message: error instanceof Error ? error.message : "Unknown scheduler error",
    };
  }
}

/**
 * Alias
 */
export default executeCron;
