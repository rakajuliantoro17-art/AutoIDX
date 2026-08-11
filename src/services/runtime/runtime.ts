import type {
  SafetyManager,
} from "../safety/safetyManager";

import type {
  RecoveryManager,
} from "../recovery/recoveryManager";

import {
  Health,
} from "./Health";

export class Runtime {
  readonly health =
    new Health();

  constructor(
    private readonly safety:
      SafetyManager,

    private readonly recovery:
      RecoveryManager,
  ) {}

  start(): void {
    if (
      !this.recovery.canTrade()
    ) {
      this.health.halted();
      return;
    }

    if (
      !this.safety.canTrade()
    ) {
      this.health.halted();
      return;
    }

    this.health.ready();
  }

  canTrade(): boolean {
    return (
      this.health.snapshot().status ===
        "READY" &&
      this.safety.canTrade() &&
      this.recovery.canTrade()
    );
  }

  halt(
    reason: string,
  ): void {
    this.recovery.halt(reason);
    this.health.halted();
  }

  snapshot() {
    return Object.freeze({
      health:
        this.health.snapshot(),

      recovery:
        this.recovery.snapshot(),

      safety:
        this.safety.snapshot(),
    });
  }
}
