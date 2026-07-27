/**
==========================================================
AURA Trade OS
Exchange Ticker Model
Version : 0.1.1 Alpha
==========================================================
*/

export interface Ticker {

  /**
   * Exchange ID
   */
  exchange: string;

  /**
   * Trading Pair
   * Example:
   * BTCIDR
   */
  symbol: string;

  /**
   * Last traded price
   */
  lastPrice: number;

  /**
   * Best bid price
   */
  bidPrice: number;

  /**
   * Best ask price
   */
  askPrice: number;

  /**
   * Highest price (24h)
   */
  highPrice: number;

  /**
   * Lowest price (24h)
   */
  lowPrice: number;

  /**
   * Opening price (24h)
   */
  openPrice: number;

  /**
   * Previous closing price
   */
  previousClosePrice?: number;

  /**
   * Base asset volume (24h)
   */
  volume: number;

  /**
   * Quote asset volume (24h)
   */
  quoteVolume: number;

  /**
   * Absolute price change (24h)
   */
  priceChange: number;

  /**
   * Percentage price change (24h)
   */
  priceChangePercent: number;

  /**
   * Number of trades (24h)
   */
  trades: number;

  /**
   * Exchange server timestamp
   */
  timestamp: number;

}
