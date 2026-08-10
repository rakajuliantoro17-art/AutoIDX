/**
 * AURA Trade OS — Phase 35
 * Public orchestration facade.
 *
 * Production rule:
 * this engine accepts a PriceFeed, but NEVER accepts an exchange
 * order client. Therefore Phase 35 cannot submit real orders.
 */
import type { PriceFeed } from "../market/priceFeed";
import { MarketSubscription } from "../market/marketSubscription";
import type { PaperStrategy } from "./paperTradingContext";
import { createPaperTradingConfig, type PaperTradingConfig } from "./paperTradingConfig";
import { PaperTradingRunner } from "./paperTradingRunner";
import type { PaperTradingResult } from "./paperTradingResult";

export interface PaperTradingStartRequest {
  readonly symbols: readonly string[];
  readonly strategy: PaperStrategy;
  readonly config: PaperTradingConfig;
}

export class PaperTradingEngine {
  private runner?: PaperTradingRunner;
  private subscription?: MarketSubscription;
  private startedAt = 0;

  async start(request: PaperTradingStartRequest, feed: PriceFeed): Promise<void> {
    if (this.runner) throw new Error("Paper trading engine is already running");
    if (request.config.mode !== "PAPER") throw new Error("Phase 35 accepts PAPER mode only");

    this.runner = new PaperTradingRunner(request.config, request.strategy);
    this.runner.health.start();
    this.startedAt = Date.now();

    this.subscription = new MarketSubscription(feed);
    await this.subscription.start(request.symbols, async tick => {
      try {
        await this.runner?.onTick(tick);
      } catch {
        this.runner?.health.error();
      }
    });
  }

  async pause(): Promise<void> {
    this.runner?.pause();
  }

  async stop(): Promise<PaperTradingResult> {
    await this.subscription?.stop();
    this.runner?.stop();

    const runner = this.runner;
    if (!runner) throw new Error("Paper trading engine is not running");

    const stoppedAt = Date.now();
    const health = runner.health.snapshot();

    return {
      sessionId: `paper-${this.startedAt}`,
      startedAt: this.startedAt,
      stoppedAt,
      status: health.status === "ERROR" ? "ERROR" : health.status === "PAUSED" ? "PAUSED" : "STOPPED",
      snapshots: runner.portfolio.getSnapshots(),
      trades: runner.tradeLog.all(),
      metrics: runner.metrics(),
    };
  }

  isRunning(): boolean {
    const status = this.runner?.health.snapshot().status;
    return status === "RUNNING" || status === "DEGRADED";
  }

  health() {
    return this.runner?.health.check();
  }
}

export function createProductionPaperConfig(initialCapital: number): PaperTradingConfig {
  return createPaperTradingConfig({
    initialCapital,
    mode: "PAPER",
    autoResume: false,
  });
}
