export interface BalanceSnapshot {
  readonly asset: string;

  readonly local: number;

  readonly exchange: number;
}

export interface PositionSnapshot {
  readonly symbol: string;

  readonly localQuantity: number;

  readonly exchangeQuantity: number;
}

export interface ReconciliationContext {
  readonly timestamp: number;

  readonly balances: readonly BalanceSnapshot[];

  readonly positions: readonly PositionSnapshot[];

  readonly unknownOrderIds: readonly string[];
}
