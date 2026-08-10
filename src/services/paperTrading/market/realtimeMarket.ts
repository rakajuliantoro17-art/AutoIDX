/**
 * AURA Trade OS — Phase 35
 * Last-value market cache with staleness protection.
 */
import type { MarketTick } from "./marketTick";
import { validateMarketTick } from "./marketTick";

export class RealtimeMarket {
  private readonly ticks = new Map<string, MarketTick>();

  update(tick: MarketTick): void {
    validateMarketTick(tick);
    const previous = this.ticks.get(tick.symbol);
    if (previous && tick.timestamp < previous.timestamp) return;
    this.ticks.set(tick.symbol, Object.freeze({ ...tick }));
  }

  get(symbol: string): MarketTick | undefined {
    return this.ticks.get(symbol);
  }

  isStale(symbol: string, now = Date.now(), maxAgeMs = 15_000): boolean {
    const tick = this.get(symbol);
    return !tick || now - tick.timestamp > maxAgeMs;
  }

  snapshot(): Readonly<Record<string, MarketTick>> {
    return Object.fromEntries(this.ticks);
  }
}
