/**
==========================================================
AURA Trade OS
ML Dataset Collector
Version : 0.1.0 Alpha

Menarik data historis ASLI dari Indodax (lewat
services/indodax/candles.ts - endpoint yang sama yang sudah
dipakai fitur Backtest) lalu mengubahnya jadi FeatureRecord[]
memakai indikator teknikal yang SAMA dengan yang dipakai
Market Scanner (services/indicators) - bukan indikator baru
yang belum teruji.

INI PENGGANTI langsung dari data fiktif/placeholder yang
sebelumnya tidak ada sama sekali di layer ml/. Tanpa file ini,
DatasetBuilder di dataset/builder.ts tidak punya data nyata
untuk dilabeli.
==========================================================
*/

import { getCandles, Candle } from "@/services/indodax/candles";

import {
  calculateRSI,
  calculateEMA,
  calculateMACD,
  calculateADX,
  calculateStochastic,
  OHLC,
} from "@/services/indicators";

import { FeatureRecord } from "../types";

export interface CollectDatasetOptions {
  /**
   * Pair yang mau dikumpulkan datanya, mis. ["btc_idr","eth_idr"].
   */
  pairs: string[];

  /**
   * Resolusi candle Indodax: "1","5","15","30","60","240","1D","1W".
   * Default "60" (candle 1 jam) - cukup rapat untuk feature harian
   * tapi tidak terlalu banyak noise seperti timeframe menit.
   */
  resolution?: string;

  /**
   * Berapa banyak candle historis yang ditarik per pair.
   * Dibatasi wajar (default 500) supaya request ke Indodax dan
   * waktu training tetap masuk akal untuk serverless function.
   */
  candleLimit?: number;
}

export interface CollectDatasetResult {
  features: FeatureRecord[];

  /**
   * Pair yang GAGAL ditarik datanya (mis. candle kosong/API error) -
   * supaya training tahu dataset-nya tidak lengkap, bukan diam-diam
   * dianggap 0 sample dari pair itu.
   */
  failedPairs: string[];
}

const MIN_CANDLES_FOR_FEATURES = 60; // cukup untuk EMA21/MACD(12,26,9)/ADX14/Stoch(14,3)

/**
 * Hitung satu FeatureRecord dari window candle yang berakhir di index `i`.
 * Window (bukan seluruh riwayat) supaya indikator dihitung persis seperti
 * saat live scanning - tidak "mengintip" data yang belum ada di titik waktu itu.
 */
function buildFeatureAt(
  candles: Candle[],
  i: number,
  symbol: string,
  timeframe: string
): FeatureRecord | null {
  const window = candles.slice(0, i + 1);

  if (window.length < MIN_CANDLES_FOR_FEATURES) {
    return null;
  }

  const closes = window.map((c) => c.close);
  const ohlc: OHLC[] = window.map((c) => ({
    high: c.high,
    low: c.low,
    close: c.close,
  }));

  const rsi14 = calculateRSI(closes, 14);
  const emaFast = calculateEMA(closes, 9);
  const emaSlow = calculateEMA(closes, 21);
  const macd = calculateMACD(closes);
  const adx = calculateADX(ohlc, 14);
  const stochastic = calculateStochastic(ohlc, 14, 3);

  const current = candles[i];

  return {
    timestamp: current.time * 1000,
    symbol,
    timeframe,
    values: {
      price: current.close,
      rsi14,
      emaFast,
      emaSlow,
      emaSpreadPct: emaSlow !== 0 ? ((emaFast - emaSlow) / emaSlow) * 100 : 0,
      macd: macd.macd,
      macdSignal: macd.signal,
      macdHistogram: macd.histogram,
      adx: adx.adx,
      plusDI: adx.plusDI,
      minusDI: adx.minusDI,
      stochK: stochastic.k,
      stochD: stochastic.d,
      volume: current.volume,
    },
  };
}

/**
 * Kumpulkan dataset fitur dari data historis Indodax untuk sejumlah pair.
 */
export async function collectDataset(
  options: CollectDatasetOptions
): Promise<CollectDatasetResult> {
  const resolution = options.resolution ?? "60";
  const candleLimit = options.candleLimit ?? 500;

  const features: FeatureRecord[] = [];
  const failedPairs: string[] = [];

  for (const pair of options.pairs) {
    try {
      const candles = await getCandles({
        pair,
        resolution,
        limit: candleLimit,
      });

      if (candles.length < MIN_CANDLES_FOR_FEATURES) {
        failedPairs.push(pair);
        continue;
      }

      for (let i = 0; i < candles.length; i++) {
        const record = buildFeatureAt(candles, i, pair.toUpperCase(), resolution);

        if (record) {
          features.push(record);
        }
      }
    } catch (error) {
      console.error(`[ML Dataset Collector] Failed to collect ${pair}:`, error);
      failedPairs.push(pair);
    }
  }

  return { features, failedPairs };
}

export default { collectDataset };
