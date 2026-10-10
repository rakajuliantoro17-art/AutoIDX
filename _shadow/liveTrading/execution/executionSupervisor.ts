/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 10
 * Execution Supervisor
 * ==========================================================
 */

import {
  KillSwitch,
} from "../monitor/killSwitch";

import {
  ProductionGate,
} from "../monitor/productionGate";

export interface SupervisorState {
  readonly running: boolean;
  readonly consecutiveFailures: number;
  readonly blocked: boolean;
  readonly reason?: string;
}

export class ExecutionSupervisor {

  private running = false;

  private consecutiveFailures = 0;

  private blocked = false;

  private reason?: string;

  constructor(
    private readonly killSwitch:
      KillSwitch,

    private readonly productionGate:
      ProductionGate,

    private readonly maxFailures:
      number,
  ) {}

  start(): void {

    this.productionGate
      .assertUnlocked();

    this.killSwitch
      .assertInactive();

    this.running = true;
    this.blocked = false;
    this.reason = undefined;
  }

  stop(
    reason: string,
  ): void {

    this.running = false;
    this.blocked = true;
    this.reason = reason;
  }

  success(): void {

    this.consecutiveFailures = 0;
  }

  failure(
    reason: string,
  ): void {

    this.consecutiveFailures += 1;

    if (
      this.consecutiveFailures >=
      this.maxFailures
    ) {
      this.stop(
        `Failure threshold reached: ${reason}`,
      );
    }
  }

  canExecute(): boolean {

    return (
      this.running &&
      !this.blocked &&
      !this.killSwitch.isActive() &&
      this.productionGate.isUnlocked()
    );
  }

  snapshot(): SupervisorState {

    return Object.freeze({
      running:
        this.running,

      consecutiveFailures:
        this.consecutiveFailures,

      blocked:
        this.blocked,

      reason:
        this.reason,
    });
  }
}
