/**
==========================================================
AURA Trade OS
Exchange Pair Model
Version : 0.1.1 Alpha
==========================================================
*/

export type PairStatus =

  | "ACTIVE"
  | "SUSPENDED"
  | "DELISTED";

export interface Pair {

  /**
   * Exchange
   * Example:
   * indodax
   * binance
   */
  exchange: string;

  /**
   * Trading Symbol
   * Example:
   * BTCIDR
   */
  symbol: string;

  /**
   * Base Asset
   * Example:
   * BTC
   */
  baseAsset: string;

  /**
   * Quote Asset
   * Example:
   * IDR
   */
  quoteAsset: string;

  /**
   * Trading Status
   */
  status: PairStatus;

  /**
   * Minimum order quantity
   */
  minQuantity: number;

  /**
   * Maximum order quantity
   */
  maxQuantity?: number;

  /**
   * Quantity precision
   */
  quantityPrecision: number;

  /**
   * Price precision
   */
  pricePrecision: number;

  /**
   * Minimum price increment (tick size)
   */
  tickSize: number;

  /**
   * Minimum quantity increment (step size)
   */
  stepSize: number;

  /**
   * Whether trading is allowed.
   */
  tradingEnabled: boolean;

  /**
   * Whether this pair
   * is visible in Scanner.
   */
  visible: boolean;

  /**
   * Created timestamp
   */
  createdAt: number;

  /**
   * Last synchronization
   */
  updatedAt: number;

}
