/**
 * AURA Trade OS — Phase 35
 * Provider-agnostic realtime feed.
 */
import type { MarketTick } from "./marketTick";

export interface PriceFeed {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(symbols: readonly string[], onTick: (tick: MarketTick) => void): Promise<void>;
  unsubscribe(symbols: readonly string[]): Promise<void>;
  isConnected(): boolean;
}
