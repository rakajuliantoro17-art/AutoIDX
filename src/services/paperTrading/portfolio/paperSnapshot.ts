/**
 * AURA Trade OS — Phase 35
 */
import type { PaperPosition } from "./paperPosition";

export interface PaperSnapshot {
  readonly timestamp: number;
  readonly cash: number;
  readonly equity: number;
  readonly exposure: number;
  readonly realizedPnl: number;
  readonly unrealizedPnl: number;
  readonly positions: readonly PaperPosition[];
}
