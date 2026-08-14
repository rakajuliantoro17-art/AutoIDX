/**
 * ============================================================
 * AURA Trade OS
 * Canary Metrics
 * ============================================================
 *
 * Phase 38 - Integration / Fix
 *
 * Responsibility:
 * - Mengumpulkan metrik Canary Trading.
 * - Menghitung execution success, error rate, latency,
 *   PnL, drawdown, dan order statistics.
 * - Menentukan apakah Canary masih berada dalam batas aman.
 *
 * NOT responsible for:
 * - Executing orders
 * - Risk authorization
 * - Position management
 * - Exchange communication
 *
 * Flow:
 *
 * Canary Runtime
 *      ↓
 * CanaryMetrics
 *      ↓
 * Monitoring / Safety / Diagnostics
 * ============================================================
 */

export type CanaryMetricStatus =
  | "HEALTHY"
  | "WARNING"
  | "CRITICAL";

export type CanaryOrderStatus =
  | "PENDING"
  | "FILLED"
  | "PARTIAL"
  | "CANCELLED"
  | "REJECTED"
  | "FAILED";

export interface CanaryOrderMetric {
  orderId: string;

  symbol: string;

  side: "BUY" | "SELL";

  amount: number;

  price?: number;

  status: CanaryOrderStatus;

  latencyMs?: number;

  pnl?: number;

  timestamp: number;

  error?: string;
}

export interface CanaryMetricsConfig {
  /**
   * Maximum acceptable execution error rate.
   *
   * Example: 0.05 = 5%.
   */
  maxErrorRate: number;

  /**
   * Maximum acceptable average execution latency.
   *
   * Unit: milliseconds.
   */
  maxAverageLatencyMs: number;

  /**
   * Maximum tolerated drawdown.
   *
   * Positive number expressed as decimal.
   *
   * Example: 0.03 = 3%.
   */
  maxDrawdown: number;

  /**
   * Maximum cumulative loss.
   */
  maxLoss: number;

  /**
   * Minimum number of orders before metrics
   * are considered statistically meaningful.
   */
  minimumSampleSize: number;

  /**
   * Maximum number of stored order metrics.
   */
  maxSamples: number;
}

export interface CanaryMetricsSnapshot {
  timestamp: number;

  status: CanaryMetricStatus;

  totalOrders: number;

  successfulOrders: number;

  failedOrders: number;

  rejectedOrders: number;

  cancelledOrders: number;

  filledOrders: number;

  partialOrders: number;

  errorRate: number;

  successRate: number;

  averageLatencyMs: number;

  maxLatencyMs: number;

  totalPnl: number;

  winningTrades: number;

  losingTrades: number;

  winRate: number;

  peakEquity: number;

  currentEquity: number;

  drawdown: number;

  totalVolume: number;

  lastOrderAt?: number;

  reasons: string[];
}

const DEFAULT_CANARY_METRICS_CONFIG: CanaryMetricsConfig =
  {
    maxErrorRate: 0.05,

    maxAverageLatencyMs: 5_000,

    maxDrawdown: 0.03,

    maxLoss: 0,

    minimumSampleSize: 5,

    maxSamples: 500,
  };

export class CanaryMetrics {
  private readonly config: CanaryMetricsConfig;

  private readonly orders: CanaryOrderMetric[] = [];

  private peakEquity = 0;

  private currentEquity = 0;

  private totalPnl = 0;

  public constructor(
    config: Partial<CanaryMetricsConfig> = {},
  ) {
    this.config = {
      ...DEFAULT_CANARY_METRICS_CONFIG,
      ...config,
    };
  }

  /**
   * Record a completed or attempted Canary order.
   */
  public recordOrder(
    metric: CanaryOrderMetric,
  ): void {
    if (!metric.orderId.trim()) {
      throw new Error(
        "Canary orderId is required",
      );
    }

    if (!metric.symbol.trim()) {
      throw new Error(
        "Canary symbol is required",
      );
    }

    if (
      !Number.isFinite(metric.amount) ||
      metric.amount <= 0
    ) {
      throw new Error(
        "Canary order amount must be greater than zero",
      );
    }

    this.orders.push({
      ...metric,
    });

    if (this.orders.length >
      this.config.maxSamples) {
      this.orders.shift();
    }

    if (
      metric.pnl !== undefined &&
      Number.isFinite(metric.pnl)
    ) {
      this.totalPnl += metric.pnl;

      this.currentEquity += metric.pnl;

      if (
        this.currentEquity >
        this.peakEquity
      ) {
        this.peakEquity =
          this.currentEquity;
      }
    }
  }

  /**
   * Update equity without creating an order metric.
   */
  public updateEquity(
    equity: number,
  ): void {
    if (!Number.isFinite(equity)) {
      throw new Error(
        "Equity must be finite",
      );
    }

    this.currentEquity = equity;

    if (
      equity > this.peakEquity
    ) {
      this.peakEquity = equity;
    }
  }

  /**
   * Calculate the latest Canary snapshot.
   */
  public getSnapshot(): CanaryMetricsSnapshot {
    const totalOrders =
      this.orders.length;

    const successfulOrders =
      this.orders.filter(
        (order) =>
          order.status === "FILLED" ||
          order.status === "PARTIAL",
      ).length;

    const failedOrders =
      this.orders.filter(
        (order) =>
          order.status === "FAILED",
      ).length;

    const rejectedOrders =
      this.orders.filter(
        (order) =>
          order.status === "REJECTED",
      ).length;

    const cancelledOrders =
      this.orders.filter(
        (order) =>
          order.status === "CANCELLED",
      ).length;

    const filledOrders =
      this.orders.filter(
        (order) =>
          order.status === "FILLED",
      ).length;

    const partialOrders =
      this.orders.filter(
        (order) =>
          order.status === "PARTIAL",
      ).length;

    const failedLikeOrders =
      failedOrders +
      rejectedOrders;

    const errorRate =
      totalOrders > 0
        ? failedLikeOrders /
          totalOrders
        : 0;

    const successRate =
      totalOrders > 0
        ? successfulOrders /
          totalOrders
        : 0;

    const latencyValues =
      this.orders
        .map(
          (order) =>
            order.latencyMs,
        )
        .filter(
          (
            latency,
          ): latency is number =>
            latency !== undefined &&
            Number.isFinite(latency) &&
            latency >= 0,
        );

    const averageLatencyMs =
      latencyValues.length > 0
        ? latencyValues.reduce(
            (sum, latency) =>
              sum + latency,
            0,
          ) / latencyValues.length
        : 0;

    const maxLatencyMs =
      latencyValues.length > 0
        ? Math.max(...latencyValues)
        : 0;

    const pnlValues =
      this.orders
        .map(
          (order) =>
            order.pnl,
        )
        .filter(
          (
            pnl,
          ): pnl is number =>
            pnl !== undefined &&
            Number.isFinite(pnl),
        );

    const winningTrades =
      pnlValues.filter(
        (pnl) => pnl > 0,
      ).length;

    const losingTrades =
      pnlValues.filter(
        (pnl) => pnl < 0,
      ).length;

    const winRate =
      pnlValues.length > 0
        ? winningTrades /
          pnlValues.length
        : 0;

    const drawdown =
      this.calculateDrawdown();

    const totalVolume =
      this.orders.reduce(
        (sum, order) =>
          sum + order.amount,
        0,
      );

    const lastOrderAt =
      this.orders.length > 0
        ? this.orders[
            this.orders.length - 1
          ].timestamp
        : undefined;

    const reasons =
      this.evaluateReasons({
        totalOrders,
        errorRate,
        averageLatencyMs,
        drawdown,
      });

    const status =
      this.resolveStatus(
        totalOrders,
        errorRate,
        averageLatencyMs,
        drawdown,
      );

    return {
      timestamp: Date.now(),

      status,

      totalOrders,

      successfulOrders,

      failedOrders,

      rejectedOrders,

      cancelledOrders,

      filledOrders,

      partialOrders,

      errorRate,

      successRate,

      averageLatencyMs,

      maxLatencyMs,

      totalPnl: this.totalPnl,

      winningTrades,

      losingTrades,

      winRate,

      peakEquity: this.peakEquity,

      currentEquity:
        this.currentEquity,

      drawdown,

      totalVolume,

      lastOrderAt,

      reasons,
    };
  }

  /**
   * Return true when Canary metrics are within
   * configured limits.
   */
  public isHealthy(): boolean {
    return (
      this.getSnapshot().status ===
      "HEALTHY"
    );
  }

  /**
   * Return true when Canary should be stopped
   * from a metrics perspective.
   *
   * This does NOT execute the stop itself.
   */
  public shouldHalt(): boolean {
    return (
      this.getSnapshot().status ===
      "CRITICAL"
    );
  }

  /**
   * Return a copy of the recorded metrics.
   */
  public getOrders(): CanaryOrderMetric[] {
    return this.orders.map(
      (order) => ({
        ...order,
      }),
    );
  }

  /**
   * Clear recorded metrics.
   */
  public reset(): void {
    this.orders.length = 0;

    this.peakEquity = 0;

    this.currentEquity = 0;

    this.totalPnl = 0;
  }

  /**
   * Calculate current percentage drawdown.
   */
  private calculateDrawdown(): number {
    if (
      this.peakEquity <= 0
    ) {
      return 0;
    }

    const drawdown =
      (
        this.peakEquity -
        this.currentEquity
      ) /
      this.peakEquity;

    return Math.max(
      0,
      drawdown,
    );
  }

  /**
   * Evaluate reasons for warning/critical status.
   */
  private evaluateReasons(
    input: {
      totalOrders: number;
      errorRate: number;
      averageLatencyMs: number;
      drawdown: number;
    },
  ): string[] {
    const reasons: string[] = [];

    if (
      input.totalOrders <
      this.config.minimumSampleSize
    ) {
      reasons.push(
        "Insufficient Canary sample size",
      );
    }

    if (
      input.errorRate >
      this.config.maxErrorRate
    ) {
      reasons.push(
        "Canary error rate exceeded limit",
      );
    }

    if (
      input.averageLatencyMs >
      this.config.maxAverageLatencyMs
    ) {
      reasons.push(
        "Canary execution latency exceeded limit",
      );
    }

    if (
      input.drawdown >
      this.config.maxDrawdown
    ) {
      reasons.push(
        "Canary drawdown exceeded limit",
      );
    }

    if (
      this.totalPnl <
      -Math.abs(this.config.maxLoss)
    ) {
      reasons.push(
        "Canary cumulative loss exceeded limit",
      );
    }

    return reasons;
  }

  /**
   * Resolve overall metric status.
   */
  private resolveStatus(
    totalOrders: number,
    errorRate: number,
    averageLatencyMs: number,
    drawdown: number,
  ): CanaryMetricStatus {
    if (
      this.totalPnl <
      -Math.abs(this.config.maxLoss)
    ) {
      return "CRITICAL";
    }

    if (
      errorRate >
      this.config.maxErrorRate
    ) {
      return "CRITICAL";
    }

    if (
      drawdown >
      this.config.maxDrawdown
    ) {
      return "CRITICAL";
    }

    if (
      totalOrders >=
        this.config.minimumSampleSize &&
      averageLatencyMs >
        this.config.maxAverageLatencyMs
    ) {
      return "CRITICAL";
    }

    if (
      totalOrders <
      this.config.minimumSampleSize
    ) {
      return "WARNING";
    }

    if (
      errorRate >
      this.config.maxErrorRate * 0.5
    ) {
      return "WARNING";
    }

    if (
      averageLatencyMs >
      this.config.maxAverageLatencyMs * 0.75
    ) {
      return "WARNING";
    }

    if (
      drawdown >
      this.config.maxDrawdown * 0.75
    ) {
      return "WARNING";
    }

    return "HEALTHY";
  }
}

export const canaryMetrics =
  new CanaryMetrics();

export default CanaryMetrics;
