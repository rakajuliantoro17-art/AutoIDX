/**
==========================================================
AURA Trade OS
Exchange Candle Model
Version : 0.1.1 Alpha
==========================================================
*/

export type CandleInterval =

  | "1m"
  | "3m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "2h"
  | "4h"
  | "6h"
  | "8h"
  | "12h"
  | "1d"
  | "3d"
  | "1w"
  | "1M";

export interface Candle {

  /**
   * Trading Pair
   * Example:
   * BTCIDR
   */
  symbol: string;

  /**
   * Candle interval
   */
  interval: CandleInterval;

  /**
   * Candle open time
   * Unix timestamp (milliseconds)
   */
  openTime: number;

  /**
   * Candle close time
   * Unix timestamp (milliseconds)
   */
  closeTime: number;

  /**
   * OHLC
   */
  open: number;

  high: number;

  low: number;

  close: number;

  /**
   * Trading volume
   * Base asset volume
   */
  volume: number;

  /**
   * Quote asset volume
   * (IDR, USDT, etc.)
   */
  quoteVolume: number;

  /**
   * Number of trades
   */
  trades: number;

  /**
   * Final candle?
   * false while candle
   * is still forming.
   */
  closed: boolean;

}
