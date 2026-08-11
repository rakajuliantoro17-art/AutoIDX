/**
 * ==========================================================
 * AutoIDX — Canary Manager
 * Phase 38
 * ==========================================================
 */

import {
  CanaryConfig,
  createCanaryConfig,
} from "./canaryConfig";

import {
  CanaryContext,
} from "./canaryContext";

import {
  CanaryDecision,
} from "./canaryDecision";

import {
  CanaryGate,
} from "./canaryGate";

export class CanaryManager {
  private readonly gate: CanaryGate;

  private ordersExecuted = 0;

  private dailyOrderValueIdr = 0;

  private dailyLossIdr = 0;

  public constructor(
    private readonly config: CanaryConfig =
      createCanaryConfig(),
  ) {
    this.gate = new CanaryGate(
      this.config,
    );
  }

  public evaluate(
    context: CanaryContext,
  ): CanaryDecision {
    return this.gate.evaluate({
      ...context,
      ordersExecutedThisSession:
        this.ordersExecuted,

      dailyOrderValueIdr:
        this.dailyOrderValueIdr,

      dailyLossIdr:
        this.dailyLossIdr,
    });
  }

  public recordOrder(
    orderValueIdr: number,
  ): void {
    if (
      !Number.isFinite(orderValueIdr) ||
      orderValueIdr <= 0
    ) {
      return;
    }

    this.ordersExecuted += 1;

    this.dailyOrderValueIdr +=
      orderValueIdr;
  }

  public recordLoss(
    lossIdr: number,
  ): void {
    if (
      !Number.isFinite(lossIdr) ||
      lossIdr <= 0
    ) {
      return;
    }

    this.dailyLossIdr += lossIdr;
  }

  public resetSession(): void {
    this.ordersExecuted = 0;
  }

  public resetDailyCounters(): void {
    this.ordersExecuted = 0;
    this.dailyOrderValueIdr = 0;
    this.dailyLossIdr = 0;
  }

  public getConfig(): CanaryConfig {
    return {
      ...this.config,
    };
  }

  public getStatistics(): {
    ordersExecuted: number;
    dailyOrderValueIdr: number;
    dailyLossIdr: number;
  } {
    return {
      ordersExecuted:
        this.ordersExecuted,

      dailyOrderValueIdr:
        this.dailyOrderValueIdr,

      dailyLossIdr:
        this.dailyLossIdr,
    };
  }
}
