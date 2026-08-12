/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 8
 * Emergency Kill Switch
 * ==========================================================
 */

export interface KillSwitchState {
  readonly active: boolean;
  readonly reason?: string;
  readonly activatedAt?: number;
}

export class KillSwitch {

  private state:
    KillSwitchState = {
      active: false,
    };

  activate(
    reason: string,
  ): void {

    this.state =
      Object.freeze({
        active: true,
        reason,
        activatedAt:
          Date.now(),
      });
  }

  deactivate(
    operator: string,
  ): void {

    if (!operator.trim()) {
      throw new Error(
        "Kill switch operator is required.",
      );
    }

    this.state =
      Object.freeze({
        active: false,
      });
  }

  isActive(): boolean {
    return this.state.active;
  }

  snapshot(): KillSwitchState {
    return this.state;
  }

  assertInactive(): void {
    if (this.state.active) {
      throw new Error(
        `Trading blocked by kill switch: ${
          this.state.reason ??
          "unknown reason"
        }`,
      );
    }
  }
}
