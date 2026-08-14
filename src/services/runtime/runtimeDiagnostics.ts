/**
 * ============================================================
 * AURA Trade OS
 * Runtime Diagnostics
 * ============================================================
 *
 * Phase 38 - Integration / Fix
 *
 * Responsibility:
 * - Mengumpulkan informasi diagnostik runtime.
 * - Menyediakan snapshot yang aman untuk monitoring.
 * - Tidak menjalankan trading.
 * - Tidak mengubah state trading.
 * - Tidak menjadi pengganti HealthManager.
 * - Tidak menjadi pengganti DiagnosticsEngine.
 *
 * Design principle:
 *
 * Runtime
 *    ↓
 * RuntimeDiagnostics
 *    ↓
 * Health / Monitoring / Observability
 *
 * ============================================================
 */

export type RuntimeHealthStatus =
  | "HEALTHY"
  | "DEGRADED"
  | "CRITICAL"
  | "UNKNOWN";

export type RuntimeEnvironment =
  | "development"
  | "test"
  | "production"
  | "unknown";

export interface RuntimeMemorySnapshot {
  rssBytes: number;
  heapTotalBytes: number;
  heapUsedBytes: number;
  externalBytes: number;
  arrayBuffersBytes: number;
  heapUsageRatio: number;
}

export interface RuntimeProcessSnapshot {
  pid?: number;
  uptimeSeconds: number;
  nodeVersion?: string;
  platform?: string;
  architecture?: string;
  environment: RuntimeEnvironment;
}

export interface RuntimeDiagnosticsSnapshot {
  timestamp: number;

  status: RuntimeHealthStatus;

  process: RuntimeProcessSnapshot;

  memory: RuntimeMemorySnapshot;

  eventLoopLagMs?: number;

  activeHandles?: number;

  activeRequests?: number;

  errors: number;

  warnings: number;

  metadata?: Record<string, unknown>;
}

export interface RuntimeDiagnosticsOptions {
  warningHeapUsageRatio?: number;

  criticalHeapUsageRatio?: number;

  warningEventLoopLagMs?: number;

  criticalEventLoopLagMs?: number;

  metadata?: Record<string, unknown>;
}

const DEFAULT_OPTIONS: Required<
  Omit<RuntimeDiagnosticsOptions, "metadata">
> = {
  warningHeapUsageRatio: 0.75,

  criticalHeapUsageRatio: 0.9,

  warningEventLoopLagMs: 250,

  criticalEventLoopLagMs: 1_000,
};

/**
 * Runtime diagnostics collector.
 */
export class RuntimeDiagnostics {
  private readonly options: RuntimeDiagnosticsOptions;

  private errorCount = 0;

  private warningCount = 0;

  private lastSnapshot?: RuntimeDiagnosticsSnapshot;

  public constructor(
    options: RuntimeDiagnosticsOptions = {},
  ) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  /**
   * Record a runtime error for diagnostics purposes.
   *
   * This does not throw and does not modify
   * trading state.
   */
  public recordError(): void {
    this.errorCount += 1;
  }

  /**
   * Record a runtime warning.
   */
  public recordWarning(): void {
    this.warningCount += 1;
  }

  /**
   * Reset diagnostic counters.
   */
  public resetCounters(): void {
    this.errorCount = 0;
    this.warningCount = 0;
  }

  /**
   * Collect a fresh runtime snapshot.
   */
  public collect(): RuntimeDiagnosticsSnapshot {
    const memory =
      this.collectMemory();

    const process =
      this.collectProcess();

    const eventLoopLagMs =
      this.measureEventLoopLag();

    const status =
      this.resolveStatus(
        memory.heapUsageRatio,
        eventLoopLagMs,
      );

    const snapshot: RuntimeDiagnosticsSnapshot = {
      timestamp: Date.now(),

      status,

      process,

      memory,

      eventLoopLagMs,

      errors: this.errorCount,

      warnings: this.warningCount,

      metadata: {
        ...this.options.metadata,
      },
    };

    this.lastSnapshot = snapshot;

    return snapshot;
  }

  /**
   * Return the latest snapshot without collecting
   * a new one.
   */
  public getLastSnapshot():
    | RuntimeDiagnosticsSnapshot
    | undefined {
    return this.lastSnapshot;
  }

  /**
   * Determine whether the runtime is currently healthy.
   *
   * If no snapshot exists, collect one first.
   */
  public isHealthy(): boolean {
    const snapshot =
      this.lastSnapshot ??
      this.collect();

    return snapshot.status === "HEALTHY";
  }

  /**
   * Get current runtime status.
   */
  public getStatus(): RuntimeHealthStatus {
    const snapshot =
      this.lastSnapshot ??
      this.collect();

    return snapshot.status;
  }

  /**
   * Collect process information.
   */
  private collectProcess():
    RuntimeProcessSnapshot {
    const runtimeProcess =
      typeof process !== "undefined"
        ? process
        : undefined;

    const nodeVersion =
      runtimeProcess?.versions?.node;

    const platform =
      runtimeProcess?.platform;

    const architecture =
      runtimeProcess?.arch;

    const environment =
      this.resolveEnvironment(
        runtimeProcess?.env?.NODE_ENV,
      );

    return {
      pid: runtimeProcess?.pid,

      uptimeSeconds:
        runtimeProcess?.uptime?.() ?? 0,

      nodeVersion,

      platform,

      architecture,

      environment,
    };
  }

  /**
   * Collect Node.js memory information.
   *
   * Browser-safe fallback values are provided so this
   * module can be imported by shared diagnostics code.
   */
  private collectMemory():
    RuntimeMemorySnapshot {
    const runtimeProcess =
      typeof process !== "undefined"
        ? process
        : undefined;

    const usage =
      runtimeProcess?.memoryUsage?.();

    if (!usage) {
      return {
        rssBytes: 0,

        heapTotalBytes: 0,

        heapUsedBytes: 0,

        externalBytes: 0,

        arrayBuffersBytes: 0,

        heapUsageRatio: 0,
      };
    }

    const heapUsageRatio =
      usage.heapTotal > 0
        ? usage.heapUsed /
          usage.heapTotal
        : 0;

    return {
      rssBytes: usage.rss,

      heapTotalBytes:
        usage.heapTotal,

      heapUsedBytes:
        usage.heapUsed,

      externalBytes:
        usage.external,

      arrayBuffersBytes:
        usage.arrayBuffers ?? 0,

      heapUsageRatio,
    };
  }

  /**
   * Lightweight event-loop lag measurement.
   *
   * This method intentionally does not create a timer
   * or asynchronous side effect. It returns undefined
   * when precise measurement is unavailable.
   */
  private measureEventLoopLag():
    number | undefined {
    /**
     * A synchronous diagnostic snapshot cannot reliably
     * measure event-loop delay without introducing a timer.
     *
     * Keep this value undefined instead of pretending
     * that a measurement exists.
     */
    return undefined;
  }

  /**
   * Resolve overall runtime health.
   */
  private resolveStatus(
    heapUsageRatio: number,
    eventLoopLagMs?: number,
  ): RuntimeHealthStatus {
    const criticalHeap =
      this.options.criticalHeapUsageRatio ??
      DEFAULT_OPTIONS.criticalHeapUsageRatio;

    const warningHeap =
      this.options.warningHeapUsageRatio ??
      DEFAULT_OPTIONS.warningHeapUsageRatio;

    const criticalLag =
      this.options.criticalEventLoopLagMs ??
      DEFAULT_OPTIONS.criticalEventLoopLagMs;

    const warningLag =
      this.options.warningEventLoopLagMs ??
      DEFAULT_OPTIONS.warningEventLoopLagMs;

    if (
      heapUsageRatio >= criticalHeap
    ) {
      return "CRITICAL";
    }

    if (
      eventLoopLagMs !== undefined &&
      eventLoopLagMs >= criticalLag
    ) {
      return "CRITICAL";
    }

    if (
      heapUsageRatio >= warningHeap
    ) {
      return "DEGRADED";
    }

    if (
      eventLoopLagMs !== undefined &&
      eventLoopLagMs >= warningLag
    ) {
      return "DEGRADED";
    }

    if (
      this.errorCount > 0
    ) {
      return "DEGRADED";
    }

    return "HEALTHY";
  }

  /**
   * Resolve deployment environment.
   */
  private resolveEnvironment(
    value?: string,
  ): RuntimeEnvironment {
    switch (value) {
      case "development":
        return "development";

      case "test":
        return "test";

      case "production":
        return "production";

      default:
        return "unknown";
    }
  }
}

/**
 * Default singleton for application-wide runtime
 * diagnostics.
 */
export const runtimeDiagnostics =
  new RuntimeDiagnostics();

export default RuntimeDiagnostics;
