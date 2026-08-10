/**
 * AURA Trade OS — Phase 35
 */
import type { PaperOrder } from "./paperOrder";

export interface PaperFill {
  readonly id: string;
  readonly orderId: string;
  readonly symbol: string;
  readonly side: PaperOrder["side"];
  readonly quantity: number;
  readonly price: number;
  readonly grossNotional: number;
  readonly fee: number;
  readonly netCashFlow: number;
  readonly timestamp: number;
}

export function createPaperFill(order: PaperOrder, price: number, feeRate: number, timestamp: number): PaperFill {
  if (price <= 0 || !Number.isFinite(price)) throw new Error("Invalid fill price");
  const grossNotional = order.quantity * price;
  const fee = grossNotional * feeRate;
  const netCashFlow = order.side === "BUY" ? -(grossNotional + fee) : grossNotional - fee;
  return Object.freeze({
    id: `paper-fill-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    orderId: order.id,
    symbol: order.symbol,
    side: order.side,
    quantity: order.quantity,
    price,
    grossNotional,
    fee,
    netCashFlow,
    timestamp,
  });
}
