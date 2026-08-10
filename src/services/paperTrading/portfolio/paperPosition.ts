/**
 * AURA Trade OS — Phase 35
 */
export interface PaperPosition {
  readonly symbol: string;
  readonly quantity: number;
  readonly averageEntryPrice: number;
  readonly openedAt: number;
}

export function unrealizedPnl(position: PaperPosition, mark: number): number {
  return (mark - position.averageEntryPrice) * position.quantity;
}
