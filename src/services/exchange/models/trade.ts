/**
==========================================================
AURA Trade OS
Exchange Trade Model
Version : 0.1.1 Alpha
==========================================================
*/

export type TradeSide =

  | "BUY"
  | "SELL";

export interface Trade {

  /**
   * Exchange Trade ID
   */
  id: string;

  /**
   * Exchange Order ID
   * that generated this trade.
   */
  orderId: string;

  /**
   * Optional Client Order ID
   */
  clientOrderId?: string;

  /**
   * Exchange
   */
  exchange: string;

  /**
   * Trading Pair
   */
  symbol: string;

  /**
   * BUY / SELL
   */
  side: TradeSide;

  /**
   * Execution Price
   */
  price: number;

  /**
   * Executed Quantity
   */
  quantity: number;

  /**
   * Total Trade Value
   */
  quoteQuantity: number;

  /**
   * Trading Fee
   */
  fee: number;

  /**
   * Fee Asset
   */
  feeAsset: string;

  /**
   * Maker / Taker
   */
  liquidity: "MAKER" | "TAKER";

  /**
   * Execution Timestamp
   */
  timestamp: number;

}
