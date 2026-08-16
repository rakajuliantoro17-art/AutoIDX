/**
==========================================================
AURA Trade OS
Trading Scheduler (Cron)
Version : 0.1.0

Perubahan dari 0.0.9: executeCron() sekarang bisa menerima
daftar pair DINAMIS (hasil MarketScanner, seluruh market
Indodax) lewat parameter `candidatePairs`, bukan cuma
TRADING_CONFIG.pairs statis dari env var BOT_PAIRS.

Universe pair yang diproses tiap siklus = gabungan dari:
1. candidatePairs   -- top opportunities hasil scan seluruh
                        pair Indodax (kalau diberikan)
2. openPositionPairs -- pair yang SEDANG punya posisi terbuka,
                        SELALU diproses supaya stop-loss/
                        take-profit/SELL tetap jalan walau
                        pair itu sudah tidak lagi masuk top
                        opportunities di siklus scan berikutnya
3. TRADING_CONFIG.pairs -- watchlist manual dari env var
                        BOT_PAIRS, tetap dihormati sebagai
                        pair yang mau selalu dipantau operator

Kalau `candidatePairs` tidak diberikan (mis. dipanggil manual
tanpa scan), perilaku lama tetap jalan: TRADING_CONFIG.pairs +
openPositionPairs.
==========================================================
*/
import { getCandles } from "../indodax/candles";
import { calculateRSI } from "../indicators/rsi";
import { calculateEMA } from "../indicators/movingAverage";
import { TradingEngine } from "../trading/engine";
import { recordLog } from "../firebase/logService";
import { getOpenPositionPairs } from "../firebase/botState";
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

    const closePrices = candles.map((c) => c.close);

    if (closePrices.length < EMA_SLOW_PERIOD) {
      throw new Error(
        `Data harga tidak cukup untuk ${pair} (dapat ${closePrices.length}, butuh minimal ${EMA_SLOW_PERIOD})`
      );
    }

    const price = closePrices[closePrices.length - 1];
    const rsi = calculateRSI(closePrices, RSI_PERIOD);
    const emaFast = calculateEMA(closePrices, EMA_FAST_PERIOD);
    const emaSlow = calculateEMA(closePrices, EMA_SLOW_PERIOD);

    // candles OHLCV lengkap diteruskan ke TradingEngine HANYA untuk
    // filter konfirmasi strategi orphan (indicatorManager butuh
    // minimal 30 candle; kalau kurang, filter otomatis fail-safe
    // menurunkan BUY ke HOLD -- lihat confirmBuyWithOrphanStrategies
    // di src/services/trading/engine.ts).
    const engineResult = await TradingEngine.run({
      pair,
      price,
      rsi,
      emaFast,
      emaSlow,
      candles,
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
  // tidak lagi jadi top opportunity di siklus scan berikutnya.
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
