export interface SafetyContext {
  readonly timestamp: number;

  readonly dailyPnlPct: number;

  readonly unknownOrders: number;

  readonly consecutiveExecutionErrors: number;

  readonly balanceMismatchPct: number;

  readonly positionMismatchPct: number;

  readonly staleOrders: number;
}
