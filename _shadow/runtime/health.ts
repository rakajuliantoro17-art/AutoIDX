export type HealthStatus =
  | "STARTING"
  | "READY"
  | "DEGRADED"
  | "HALTED"
  | "ERROR";
export interface HealthSnapshot {
  readonly status: HealthStatus;
  readonly startedAt: number;
  readonly lastReconciliationAt?: number;
  readonly lastAuditAt?: number;
  readonly errorCount: number;
}
export class Health {
  private status: HealthStatus =
    "STARTING";
  private readonly startedAt =
    Date.now();
  private lastReconciliationAt?: number;
  private lastAuditAt?: number;
  private errorCount = 0;
  ready(): void {
    this.status = "READY";
  }
  degraded(): void {
    this.status = "DEGRADED";
  }
  halted(): void {
    this.status = "HALTED";
  }
  error(): void {
    this.errorCount += 1;
    this.status = "ERROR";
  }
  reconciliationCompleted(): void {
    this.lastReconciliationAt =
      Date.now();
  }
  auditCompleted(): void {
    this.lastAuditAt = Date.now();
  }
  snapshot(): HealthSnapshot {
    return Object.freeze({
      status: this.status,
      startedAt: this.startedAt,
      lastReconciliationAt:
        this.lastReconciliationAt,
      lastAuditAt:
        this.lastAuditAt,
      errorCount:
        this.errorCount,
    });
  }
}
