/**
==========================================================
AURA Trade OS
Exchange Order Model
Version : 0.1.2 Alpha
==========================================================
*/

import type { OrderSide, OrderType } from "../types";

export type { OrderSide, OrderType };

export type OrderStatus =
  | "NEW"
  | "OPEN"
  | "PARTIALLY_FILLED"
  | "FILLED"
  | "CANCELLED"
  | "REJECTED"
  | "EXPIRED";

export interface Order {
  /**
   * Exchange Order ID
   */
  id: string;
  /**
   * Client Order ID
   */
  clientOrderId?: string;
  /**
   * Exchange ID
   */
  exchange: string;
  /**
   * Trading Pair
   */
  symbol: string;
  /**
   * BUY / SELL
   */
  side: OrderSide;
  /**
   * MARKET / LIMIT / STOP
   */
  type: OrderType;
  /**
   * Current Status
   */
  status: OrderStatus;
  /**
   * Requested Price
   * Undefined for MARKET order.
   */
  price?: number;
  /**
   * Requested Quantity
   */
  quantity: number;
  /**
   * Filled Quantity
   */
  filledQuantity: number;
  /**
   * Remaining Quantity
   */
  remainingQuantity: number;
  /**
   * Average Fill Price
   */
  averagePrice?: number;
  /**
   * Trading Fee
   */
  fee?: number;
  /**
   * Fee Asset
   */
  feeAsset?: string;
  /**
   * Order Creation Time
   */
  createdAt: number;
  /**
   * Last Update
   */
  updatedAt: number;
}
