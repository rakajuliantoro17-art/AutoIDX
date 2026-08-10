/**
 * AURA Trade OS — Phase 35
 */
export interface MarketTick {
  readonly symbol: string;
  readonly timestamp: number;
  readonly bid: number;
  readonly ask: number;
  readonly last: number;
  readonly volume?: number;
  readonly source: string;
}

export function validateMarketTick(tick: MarketTick): void {
  if (!tick.symbol) throw new Error("tick.symbol is required");
  if (!Number.isFinite(tick.timestamp) || tick.timestamp <= 0) throw new Error("Invalid tick timestamp");
  if (![tick.bid, tick.ask, tick.last].every(Number.isFinite)) throw new Error("Invalid tick prices");
  if (tick.bid <= 0 || tick.ask <= 0 || tick.last <= 0) throw new Error("Prices must be > 0");
  if (tick.ask < tick.bid) throw new Error("ask cannot be below bid");
}
