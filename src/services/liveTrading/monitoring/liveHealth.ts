export type LiveHealthStatus = "DISABLED" | "READY" | "RUNNING" | "DEGRADED" | "HALTED" | "ERROR";

export class LiveHealth {
  private status: LiveHealthStatus = "DISABLED";
  private lastOrderAt = 0;
  private lastReconciliationAt = 0;
  private errorCount = 0;

  ready(): void { this.status = "READY"; }
  running(): void { this.status = "RUNNING"; }
  degraded(): void { this.status = "DEGRADED"; }
  halted(): void { this.status = "HALTED"; }
  error(): void { this.errorCount++; this.status = "ERROR"; }

  orderSubmitted(now = Date.now()): void {
    this.lastOrderAt = now;
    this.status = "RUNNING";
  }

  reconciled(now = Date.now()): void { this.lastReconciliationAt = now; }

  snapshot() {
    return Object.freeze({
      status: this.status,
      lastOrderAt: this.lastOrderAt,
      lastReconciliationAt: this.lastReconciliationAt,
      errorCount: this.errorCount,
    });
  }
}
