/**
==========================================================
AURA Trade OS
Market Quality Adapter
Version : 0.1.0 Alpha

Menyambungkan data order book yang sudah kita ambil lewat
indodax/market.js (getOrderBookDepth) ke SpreadFilter dari
folder services/market/filters/ -- sebelumnya orphan, tidak
pernah dipakai di jalur mana pun.

KENAPA CUMA IMPORT TYPE dari "@/services/exchange", BUKAN
seluruh modulnya:
- services/exchange/ adalah REST/WebSocket client Indodax
  PARALEL (~50 file) yang terpisah dari indodax/api.js yang
  sudah aktif dipakai project ini. Mengaktifkan seluruh
  modulnya akan menghasilkan DUA jalur komunikasi Indodax
  yang bersaing -- sumber bug klasik di project ini.
- Yang benar-benar dibutuhkan filter (OrderBook, Candle) HANYA
  interface TypeScript-nya, bukan implementasi REST client-nya.
  `import type` di bawah ini TIDAK membawa kode runtime apa pun,
  jadi aman dipakai tanpa mengaktifkan exchange/ secara utuh.

Kenapa CUMA SpreadFilter yang jadi gerbang wajib (bukan
LiquidityFilter/VolatilityFilter juga): threshold spread dalam
PERSEN itu scale-invariant (berlaku sama untuk BTC seharga
miliaran maupun altcoin recehan). Threshold liquidity/volatility
di LiquidityFilter/VolatilityFilter butuh angka dalam satuan
KUANTITAS KOIN MENTAH -- tidak ada satu angka default yang masuk
akal untuk SEMUA pair (BTC vs altcoin recehan beda ordo besaran
drastis) tanpa dinormalisasi ke IDR dulu. Daripada menebak
threshold yang bisa salah menolak pair yang sebenarnya sehat,
untuk sekarang keduanya HANYA dihitung untuk visibilitas/data
kalibrasi, TIDAK dipakai untuk menolak pair.
==========================================================
*/

import { SpreadFilter } from "@/services/market/filters/spreadFilter";
import { LiquidityFilter } from "@/services/market/filters/liquidityFilter";
import { VolumeAggregator } from "@/services/market/aggregators/volumeAggregator";
import { CandleAggregator } from "@/services/market/aggregators/candleAggregator";
import type { OrderBook } from "@/services/exchange/public/orderBook";
import type { Candle as ExchangeCandle } from "@/services/exchange/models/candle";
import type { Candle as IndodaxCandle } from "@/services/indodax/candles";

export interface OrderBookDepthRaw {
  bids: Array<{ price: number; amount: number; totalIdr?: number }>;
  asks: Array<{ price: number; amount: number; totalIdr?: number }>;
}

export interface MarketQualityResult {
  passed: boolean;
  spreadPercent: number;
  bidLiquidity: number;
  askLiquidity: number;
  reason?: string;
}

/**
 * Adaptor: bentuk order book aktif (indodax/market.js) -> bentuk
 * yang diharapkan SpreadFilter/LiquidityFilter (services/exchange).
 */
function toExchangeOrderBook(
  depth: OrderBookDepthRaw,
  pair: string
): OrderBook {
  return {
    symbol: pair,
    bids: depth.bids.map((b) => ({ price: b.price, quantity: b.amount })),
    asks: depth.asks.map((a) => ({ price: a.price, quantity: a.amount })),
    timestamp: Date.now(),
  };
}

/**
 * Evaluasi kualitas order book satu pair. SpreadFilter jadi
 * gerbang wajib (passed=false kalau spread > maxSpreadPercent).
 * LiquidityFilter dihitung untuk data (bidLiquidity/askLiquidity)
 * tapi TIDAK menggagalkan hasil -- lihat catatan panjang di atas.
 */
export function evaluateMarketQuality(
  pair: string,
  depth: OrderBookDepthRaw,
  maxSpreadPercent: number
): MarketQualityResult {
  const orderBook = toExchangeOrderBook(depth, pair);

  const spreadResult = SpreadFilter.evaluate(orderBook, {
    maximumSpreadPercent: maxSpreadPercent,
  });

  const liquidityResult = LiquidityFilter.evaluate(orderBook, {});

  return {
    passed: spreadResult.passed,
    spreadPercent: spreadResult.spreadPercent,
    bidLiquidity: liquidityResult.bidLiquidity,
    askLiquidity: liquidityResult.askLiquidity,
    reason: spreadResult.passed ? undefined : spreadResult.reason,
  };
}

/**
 * Adaptor: candle aktif (indodax/candles.ts, dari endpoint
 * TradingView history_v2) -> bentuk exchange Candle yang
 * diharapkan CandleAggregator/VolumeAggregator. Field yang tidak
 * tersedia dari sumber aktif (interval label, quoteVolume,
 * jumlah trades, status closed) diisi nilai turunan/placeholder
 * yang wajar -- aggregator ini cuma memakai open/high/low/close/
 * volume, jadi field lain sekadar melengkapi bentuk tipe.
 */
function toExchangeCandles(
  candles: IndodaxCandle[],
  pair: string
): ExchangeCandle[] {
  return candles.map((c) => ({
    symbol: pair,
    interval: "1h",
    openTime: c.time * 1000,
    closeTime: c.time * 1000,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
    volume: c.volume,
    quoteVolume: c.volume * c.close,
    trades: 0,
    closed: true,
  }));
}

export interface VolumeSurgeResult {
  volumeRatio: number;
  latestVolume: number;
  averageVolume: number;
  priceRangePercent: number;
}

/**
 * Menghitung "volume surge" (volume candle terkini vs rata-rata)
 * dan rentang harga (high-low) sebagai sinyal momentum tambahan --
 * melengkapi RSI/EMA yang sudah ada. Ini murni INFORMASIONAL,
 * dilampirkan ke hasil scan untuk dipantau, BELUM dipakai sebagai
 * gerbang wajib (beda ambang batas yang jelas antar pair belum
 * divalidasi cukup untuk dijadikan hard filter).
 */
export function evaluateVolumeSurge(
  candles: IndodaxCandle[],
  pair: string
): VolumeSurgeResult | null {
  if (candles.length === 0) {
    return null;
  }

  const exchangeCandles = toExchangeCandles(candles, pair);

  const volumeStats = VolumeAggregator.aggregate(exchangeCandles);
  const candleStats = CandleAggregator.aggregate(exchangeCandles);

  const lastClose = exchangeCandles[exchangeCandles.length - 1].close;

  const priceRangePercent =
    lastClose === 0
      ? 0
      : ((candleStats.highestHigh - candleStats.lowestLow) / lastClose) * 100;

  return {
    volumeRatio: Math.round(volumeStats.volumeRatio * 100) / 100,
    latestVolume: volumeStats.latestVolume,
    averageVolume: volumeStats.averageVolume,
    priceRangePercent: Math.round(priceRangePercent * 100) / 100,
  };
}
