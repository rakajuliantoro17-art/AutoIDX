/**
==========================================================
AURA Trade OS
Exchange Position Model
Version : 0.1.1 Alpha
==========================================================
*/

export type PositionSide =

  | "LONG"
  | "SHORT";

export type PositionStatus =

  | "OPEN"
  | "CLOSED";

export interface Position {

  /**
   * Position ID
   */
  id: string;

  /**
   * Exchange
   */
  exchange: string;

  /**
   * Trading Pair
   */
  symbol: string;

  /**
   * LONG / SHORT
   */
  side: PositionSide;

  /**
   * Position Status
   */
  status: PositionStatus;

  /**
   * Quantity currently held
   */
  quantity: number;

  /**
   * Average entry price
   */
  entryPrice: number;

  /**
   * Current market price
   */
  currentPrice: number;

  /**
   * Unrealized Profit/Loss
   */
  unrealizedPnL: number;

  /**
   * Realized Profit/Loss
   */
  realizedPnL: number;

  /**
   * Estimated market value
   */
  marketValue: number;

  /**
   * Trading fee paid
   */
  fee: number;

  /**
   * Open timestamp
   */
  openedAt: number;

  /**
   * Close timestamp
   */
  closedAt?: number;

  /**
   * Last update timestamp
   */
  updatedAt: number;

}
