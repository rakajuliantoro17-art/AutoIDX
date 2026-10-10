/**
==========================================================
AURA Trade OS
Indodax Data Parser
Version : 0.0.5 Alpha
==========================================================
*/

export interface ParsedTicker {
  symbol: string;
  pair: string;
  lastPrice: number;
  highPrice: number;
  lowPrice: number;
  buyPrice: number;
  sellPrice: number;
  volumeCoin: number;
  volumeIdr: number;
  serverTime: number;
}

export interface ParsedOrderBookItem {
  price: number;
  amount: number;
}

/**
 * Parse ticker response dari API Indodax
 */
export function parseTicker(pair: string, data: any): ParsedTicker {
  const ticker = data?.ticker ?? {};

  return {
    symbol: pair.toUpperCase(),
    pair: pair.toLowerCase(),

    lastPrice: Number(ticker.last ?? 0),
    highPrice: Number(ticker.high ?? 0),
    lowPrice: Number(ticker.low ?? 0),

    buyPrice: Number(ticker.buy ?? 0),
    sellPrice: Number(ticker.sell ?? 0),

    volumeCoin: Number(ticker.vol_btc ?? ticker.vol_coin ?? 0),
    volumeIdr: Number(ticker.vol_idr ?? 0),

    serverTime: Number(data?.server_time ?? Date.now() / 1000),
  };
}

/**
 * Parse Order Book (Depth)
 */
export function parseOrderBook(
  orders: unknown[]
): ParsedOrderBookItem[] {

  if (!Array.isArray(orders)) {
    return [];
  }

  return orders.map((item: any) => ({
    price: Number(item?.[0] ?? 0),
    amount: Number(item?.[1] ?? 0),
  }));
}

/**
 * Parse array harga penutupan (close)
 */
export function parseClosePrices(
  candles: { close: number }[]
): number[] {

  return candles.map((c) => Number(c.close));

}

/**
 * Parse angka agar aman
 */
export function toNumber(value: unknown): number {

  const num = Number(value);

  return Number.isFinite(num)
    ? num
    : 0;

}

/**
 * Format pair menjadi lowercase tanpa spasi
 */
export function normalizePair(pair: string): string {

  return pair
    .trim()
    .toLowerCase();

}

/**
 * Format pair menjadi simbol display
 *
 * btcidr -> BTCIDR
 * btc_idr -> BTC_IDR
 */
export function formatPair(pair: string): string {

  return normalizePair(pair).toUpperCase();

}

/**
 * Format harga Rupiah
 */
export function formatIdr(price: number): string {

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);

}

/**
 * Format volume
 */
export function formatVolume(volume: number): string {

  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 4,
  }).format(volume);

}

export default {

  parseTicker,

  parseOrderBook,

  parseClosePrices,

  normalizePair,

  formatPair,

  formatIdr,

  formatVolume,

  toNumber,

};
