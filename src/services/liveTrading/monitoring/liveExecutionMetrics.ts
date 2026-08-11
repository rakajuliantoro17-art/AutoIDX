export interface LiveExecutionMetrics {
  submitted: number;
  rejected: number;
  unknown: number;
  filled: number;
  cancelled: number;
  lastOrderAt?: number;
}

export class LiveExecutionMetricsStore {
  private metrics: LiveExecutionMetrics = {
    submitted: 0, rejected: 0, unknown: 0, filled: 0, cancelled: 0,
  };

  record(status: "submitted" | "rejected" | "unknown" | "filled" | "cancelled"): void {
    this.metrics = {
      ...this.metrics,
      [status]: this.metrics[status] + 1,
      lastOrderAt: Date.now(),
    };
  }

  snapshot(): LiveExecutionMetrics { return Object.freeze({ ...this.metrics }); }
}
