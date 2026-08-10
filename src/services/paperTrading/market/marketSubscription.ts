/**
 * AURA Trade OS — Phase 35
 */
import type { MarketTick } from "./marketTick";
import type { PriceFeed } from "./priceFeed";

export class MarketSubscription {
  private readonly symbols = new Set<string>();
  private handler?: (tick: MarketTick) => void;

  constructor(private readonly feed: PriceFeed) {}

  async start(symbols: readonly string[], handler: (tick: MarketTick) => void): Promise<void> {
    if (symbols.length === 0) throw new Error("At least one symbol is required");
    this.handler = handler;
    symbols.forEach(s => this.symbols.add(s));
    await this.feed.connect();
    await this.feed.subscribe([...this.symbols], tick => {
      if (this.symbols.has(tick.symbol)) this.handler?.(tick);
    });
  }

  async stop(): Promise<void> {
    const symbols = [...this.symbols];
    if (symbols.length) await this.feed.unsubscribe(symbols);
    this.symbols.clear();
    this.handler = undefined;
    await this.feed.disconnect();
  }
}
