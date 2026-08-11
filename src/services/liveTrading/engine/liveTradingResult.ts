import type { ExchangeOrder } from "../exchange/exchangeOrder";

export interface LiveTradingResult {
  readonly accepted: boolean;
  readonly order?: ExchangeOrder;
  readonly status: "SUBMITTED" | "REJECTED" | "UNKNOWN" | "BLOCKED";
  readonly reason?: string;
  readonly timestamp: number;
}
