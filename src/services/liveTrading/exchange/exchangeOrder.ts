export type ExchangeOrderSide = "BUY" | "SELL";
export type ExchangeOrderStatus =
  | "PENDING" | "OPEN" | "FILLED" | "PARTIALLY_FILLED"
  | "CANCELLED" | "REJECTED" | "UNKNOWN";

export interface ExchangeOrderRequest {
  readonly clientOrderId: string;
  readonly symbol: string;
  readonly side: ExchangeOrderSide;
  readonly quantity: number;
  readonly type: "MARKET";
}

export interface ExchangeOrder {
  readonly id: string;
  readonly clientOrderId: string;
  readonly symbol: string;
  readonly side: ExchangeOrderSide;
  readonly quantity: number;
  readonly filledQuantity: number;
  readonly averagePrice?: number;
  readonly status: ExchangeOrderStatus;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly raw?: unknown;
}
