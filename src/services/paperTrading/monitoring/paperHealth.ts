/**
 * AURA Trade OS — Phase 35
 */
export type PaperHealthStatus = "STARTING" | "RUNNING" | "DEGRADED" | "PAUSED" | "STOPPED" | "ERROR";

export interface PaperHealth {
  readonly status: PaperHealthStatus;
  readonly lastTickAt: number;
  readonly lastHeartbeatAt: number;
  readonly errorCount: number;
}

export class PaperHealthMonitor {
  private status: PaperHealthStatus = "STARTING";
  private lastTickAt = 0;
  private lastHeartbeatAt = 0;
  private errorCount = 0;

  start(now = Date.now()): void {
    this.status = "RUNNING";
    this.lastHeartbeatAt = now;
  }

  tick(now: number): void {
    this.lastTickAt = now;
    this.lastHeartbeatAt = Date.now();
    if (this.status !== "PAUSED") this.status = "RUNNING";
  }

  heartbeat(now = Date.now()): void {
    this.lastHeartbeatAt = now;
  }

  error(): void {
    this.errorCount++;
    this.status = "ERROR";
  }

  pause(): void { this.status = "PAUSED"; }
  stop(): void { this.status = "STOPPED"; }

  check(now = Date.now(), staleMarketMs = 15_000, heartbeatTimeoutMs = 30_000): PaperHealth {
    if (this.status === "RUNNING" && this.lastTickAt && now - this.lastTickAt > staleMarketMs) {
      this.status = "DEGRADED";
    }
    if (this.lastHeartbeatAt && now - this.lastHeartbeatAt > heartbeatTimeoutMs) {
      this.status = "DEGRADED";
    }
    return this.snapshot();
  }

  snapshot(): PaperHealth {
    return Object.freeze({
      status: this.status,
      lastTickAt: this.lastTickAt,
      lastHeartbeatAt: this.lastHeartbeatAt,
      errorCount: this.errorCount,
    });
  }
}
