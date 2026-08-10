/**
 * AURA Trade OS — Phase 35
 */
export type PaperOrderSide = "BUY" | "SELL";
export type PaperOrderType = "MARKET";
export type PaperOrderStatus = "CREATED" | "FILLED" | "REJECTED" | "CANCELLED";

export interface PaperOrder {
  readonly id: string;
  readonly symbol: string;
  readonly side: PaperOrderSide;
  readonly type: PaperOrderType;
  readonly quantity: number;
  readonly createdAt: number;
  readonly status: PaperOrderStatus;
  readonly reason?: string;
}

export function createPaperOrder(input: Omit<PaperOrder, "id" | "status">): PaperOrder {
  if (input.quantity <= 0 || !Number.isFinite(input.quantity)) throw new Error("Invalid order quantity");
  return Object.freeze({
    ...input,
    id: `paper-order-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    status: "CREATED",
  });
}
