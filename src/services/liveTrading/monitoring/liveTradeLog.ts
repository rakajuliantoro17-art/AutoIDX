export interface LiveTradeLogEntry {
  readonly timestamp: number;
  readonly orderId?: string;
  readonly clientOrderId: string;
  readonly symbol: string;
  readonly side: "BUY" | "SELL";
  readonly quantity: number;
  readonly status: string;
  readonly reason?: string;
}

export class LiveTradeLog {
  private readonly entries: LiveTradeLogEntry[] = [];
  append(entry: LiveTradeLogEntry): void { this.entries.push(Object.freeze({ ...entry })); }
  all(): readonly LiveTradeLogEntry[] { return [...this.entries]; }
}
