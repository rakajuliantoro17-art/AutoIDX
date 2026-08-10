/**
 * AURA Trade OS — Phase 35
 */
import type { PaperSnapshot } from "../portfolio/paperSnapshot";
import type { PaperTradeRecord } from "../monitoring/paperTradeLog";
import type { PaperMetrics } from "../monitoring/paperMetrics";

export interface PaperTradingResult {
  readonly sessionId: string;
  readonly startedAt: number;
  readonly stoppedAt: number;
  readonly status: "STOPPED" | "PAUSED" | "ERROR";
  readonly snapshots: readonly PaperSnapshot[];
  readonly trades: readonly PaperTradeRecord[];
  readonly metrics: PaperMetrics;
  readonly error?: string;
}
