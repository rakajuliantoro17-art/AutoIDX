/**
==========================================================
AURA Trade OS
Trend + Volume Advisory (Observability Only)
Version : 0.1.0 Alpha

Menyambungkan TrendRule + VolumeRule (services/strategy/rules/)
ke live trading -- sebelumnya orphan total karena butuh SMA/OBV
dari candle penuh, sedangkan checkRuleScoreContradiction() di
trading/engine.ts (Sanity Check 2) cuma menerima `features`
(IndicatorFeatureVector ringkas), jadi selalu diisi sma:0, obv:0
(baca komentar checkRuleScoreContradiction()).

KEPUTUSAN SENGAJA -- BUKAN dijadikan gate/sanity-check tambahan:
project ini PERNAH mencoba pendekatan gerbang berlapis dan
DIBATALKAN pemilik project sendiri karena BUY jadi terlalu jarang
(lihat Session Log lama di docs/claude.md). Menambah TrendRule/
VolumeRule sebagai gate baru akan mengulangi kesalahan yang sama
tanpa izin eksplisit pemilik project. Jadi modul ini HANYA
mencatat log ("[Trend+Volume Advisory ...]"), sama seperti pola
mlAdvisor.ts -- kalau dihapus total, TIDAK ADA perilaku BUY/SELL
yang berubah.

Fail-safe menyeluruh: kalau candle kurang dari 20 (SMA butuh
minimum itu) atau error apapun, return null -- caller cukup skip
log, jangan pernah dianggap error yang menghentikan siklus.
==========================================================
*/

import { SMAIndicator } from "@/services/indicator/trend/sma";
import { OBVIndicator } from "@/services/indicator/volume/obv";
import { TrendRule } from "@/services/strategy/rules/trendRule";
import { VolumeRule } from "@/services/strategy/rules/volumeRule";
import type { StrategyContext } from "@/services/strategy/types";
import type { IndicatorFeatureVector } from "@/services/indicators";
import type { Candle } from "@/services/indodax/candles";
import type { MarketCandle } from "@/services/market";
import logger from "@/lib/error/Logger";
import { AppError } from "@/lib/error/AppError";

const smaIndicator = new SMAIndicator({ period: 20 });
const obvIndicator = new OBVIndicator();
const trendRule = new TrendRule();
const volumeRule = new VolumeRule();

/**
 * Minimum candle supaya SMA(20) tidak balik array kosong
 * (lihat SMAIndicator.calculateSMA -- return [] kalau
 * candles.length < period).
 */
const MIN_CANDLES_FOR_SMA = 20;

/**
 * cron.ts fetch candle lewat getCandles({pair, limit:100}) tanpa
 * resolution eksplisit -> DEFAULT_RESOLUTION="60" (1 jam) di
 * services/indodax/candles.ts. Kalau resolution itu berubah,
 * value ini WAJIB disesuaikan juga -- cuma dipakai untuk typing
 * MarketCandle, tidak mempengaruhi hasil SMA/OBV (yang murni dari
 * close/volume), jadi salah value di sini tidak bikin salah
 * hitung, cuma label yang tidak akurat.
 */
const ASSUMED_TIMEFRAME: MarketCandle["timeframe"] = "1h";

function toMarketCandles(pair: string, candles: Candle[]): MarketCandle[] {
  return candles.map((c) => ({
    symbol: pair,
    timeframe: ASSUMED_TIMEFRAME,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
    volume: c.volume,
    timestamp: c.time * 1000,
  }));
}

export interface TrendVolumeAdvisoryResult {
  logLine: string;
}

export function getTrendVolumeAdvisory(
  pair: string,
  price: number,
  features: IndicatorFeatureVector,
  candles: Candle[] | undefined
): TrendVolumeAdvisoryResult | null {
  try {
    if (!candles || candles.length < MIN_CANDLES_FOR_SMA) {
      return null;
    }

    const marketCandles = toMarketCandles(pair, candles);

    const sma = smaIndicator.calculate(marketCandles).value;
    const obv = obvIndicator.calculate(marketCandles).value;

    const context: StrategyContext = {
      pair,
      features,
      indicators: {
        macd: features.macd,
        histogram: features.macdHistogram,
        rsi: features.rsi,
        ema: features.emaSlow,
        sma,
        atr: features.atr,
        bollingerUpper: features.bollingerUpper,
        bollingerMiddle: features.bollingerMiddle,
        bollingerLower: features.bollingerLower,
        obv,
      },
      snapshot: { close: price },
      mode: "BALANCED",
      position: "NONE",
      balance: 0,
      timestamp: Date.now(),
    };

    const trend = trendRule.evaluate(context);
    const volume = volumeRule.evaluate(context);

    const logLine =
      `[Trend+Volume Advisory ${pair.toUpperCase()}] ` +
      `TrendRule: score=${trend.score} (${trend.reason}) | ` +
      `VolumeRule: score=${volume.score} (${volume.reason}) | ` +
      `sma=${sma.toFixed(2)}, obv=${obv.toFixed(2)}`;

    return { logLine };
  } catch (error) {
    // Dibungkus AppError.trading() dulu supaya error punya `code`
    // terstruktur (TRADING_ENGINE_ERROR) sebelum di-log -- TETAP
    // fail-safe, ditangkap di sini, TIDAK PERNAH dilempar ke atas.
    const wrapped = AppError.trading(
      "Trend+Volume Advisory gagal hitung sinyal",
      error
    );

    logger.error(wrapped.message, wrapped, {
      service: "trendVolumeAdvisor",
      code: wrapped.code,
      pair,
    });
    return null;
  }
}

const trendVolumeAdvisor = { getTrendVolumeAdvisory };
export default trendVolumeAdvisor;
