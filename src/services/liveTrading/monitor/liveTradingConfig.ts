/**
 * ============================================================
 * AURA Trade OS
 * Live Trading Monitor Configuration
 * ============================================================
 *
 * Phase 38 - Integration / Fix
 *
 * Responsibility:
 * - Central configuration untuk monitoring live trading.
 * - Mengatur heartbeat, health check, timeout, dan monitoring.
 * - Tidak menjalankan trading.
 * - Tidak membuat Risk Engine / Execution Engine baru.
 *
 * Production principle:
 * Monitoring failure must never silently authorize trading.
 * ============================================================
 */

export type LiveTradingMonitorLevel =
  | "NORMAL"
  | "WARNING"
  | "CRITICAL";

export type LiveTradingMonitorMode =
  | "PAPER"
  | "CANARY"
  | "LIVE";

export interface LiveTradingConfig {
  /**
   * Enable live-trading monitoring.
   */
  enabled: boolean;

  /**
   * Monitoring mode.
   */
  mode: LiveTradingMonitorMode;

  /**
   * How frequently the monitor checks the
   * live trading runtime.
   *
   * Unit: milliseconds
   */
  intervalMs: number;

  /**
   * Maximum time allowed since the last
   * successful heartbeat.
   *
   * Unit: milliseconds
   */
  heartbeatTimeoutMs: number;

  /**
   * Maximum time allowed for an exchange
   * health check.
   *
   * Unit: milliseconds
   */
  healthCheckTimeoutMs: number;

  /**
   * Maximum number of consecutive failed
   * health checks before entering CRITICAL.
   */
  maxConsecutiveFailures: number;

  /**
   * Maximum number of stale heartbeats before
   * the monitor reports a critical state.
   */
  maxStaleHeartbeats: number;

  /**
   * Number of recent trades used for monitoring.
   */
  recentTradeWindow: number;

  /**
   * Maximum execution latency considered healthy.
   *
   * Unit: milliseconds
   */
  maxExecutionLatencyMs: number;

  /**
   * Warning threshold for execution latency.
   *
   * Unit: milliseconds
   */
  warningExecutionLatencyMs: number;

  /**
   * Enable automatic monitoring alerts.
   */
  alertsEnabled: boolean;

  /**
   * Enable automatic health degradation.
   */
  autoDegrade: boolean;

  /**
   * Enable automatic recovery detection.
   */
  autoRecover: boolean;

  /**
   * Metadata attached to monitoring events.
   */
  metadata?: Record<string, unknown>;
}

/**
 * Production-oriented default configuration.
 *
 * IMPORTANT:
 * `enabled` does not mean that live orders are automatically
 * authorized. It only enables the monitoring subsystem.
 */
export const DEFAULT_LIVE_TRADING_CONFIG: Readonly<LiveTradingConfig> =
  Object.freeze({
    enabled: true,

    mode: "LIVE",

    intervalMs: 10_000,

    heartbeatTimeoutMs: 30_000,

    healthCheckTimeoutMs: 10_000,

    maxConsecutiveFailures: 3,

    maxStaleHeartbeats: 2,

    recentTradeWindow: 20,

    maxExecutionLatencyMs: 15_000,

    warningExecutionLatencyMs: 5_000,

    alertsEnabled: true,

    autoDegrade: true,

    autoRecover: true,

    metadata: {
      source: "liveTrading.monitor",
      version: "0.1.0-alpha",
    },
  });

/**
 * Normalize user-provided configuration against
 * production defaults.
 */
export function createLiveTradingConfig(
  overrides: Partial<LiveTradingConfig> = {},
): LiveTradingConfig {
  return {
    ...DEFAULT_LIVE_TRADING_CONFIG,
    ...overrides,
    metadata: {
      ...DEFAULT_LIVE_TRADING_CONFIG.metadata,
      ...overrides.metadata,
    },
  };
}

/**
 * Validate monitoring configuration.
 *
 * Returns an array instead of throwing so startup
 * diagnostics can report all configuration problems
 * at once.
 */
export function validateLiveTradingConfig(
  config: LiveTradingConfig,
): string[] {
  const errors: string[] = [];

  if (
    typeof config.enabled !== "boolean"
  ) {
    errors.push(
      "enabled must be a boolean",
    );
  }

  if (
    config.mode !== "PAPER" &&
    config.mode !== "CANARY" &&
    config.mode !== "LIVE"
  ) {
    errors.push(
      "mode must be PAPER, CANARY, or LIVE",
    );
  }

  if (
    !Number.isFinite(config.intervalMs) ||
    config.intervalMs <= 0
  ) {
    errors.push(
      "intervalMs must be greater than zero",
    );
  }

  if (
    !Number.isFinite(
      config.heartbeatTimeoutMs,
    ) ||
    config.heartbeatTimeoutMs <= 0
  ) {
    errors.push(
      "heartbeatTimeoutMs must be greater than zero",
    );
  }

  if (
    !Number.isFinite(
      config.healthCheckTimeoutMs,
    ) ||
    config.healthCheckTimeoutMs <= 0
  ) {
    errors.push(
      "healthCheckTimeoutMs must be greater than zero",
    );
  }

  if (
    !Number.isInteger(
      config.maxConsecutiveFailures,
    ) ||
    config.maxConsecutiveFailures < 1
  ) {
    errors.push(
      "maxConsecutiveFailures must be at least 1",
    );
  }

  if (
    !Number.isInteger(
      config.maxStaleHeartbeats,
    ) ||
    config.maxStaleHeartbeats < 1
  ) {
    errors.push(
      "maxStaleHeartbeats must be at least 1",
    );
  }

  if (
    !Number.isInteger(
      config.recentTradeWindow,
    ) ||
    config.recentTradeWindow < 1
  ) {
    errors.push(
      "recentTradeWindow must be at least 1",
    );
  }

  if (
    !Number.isFinite(
      config.maxExecutionLatencyMs,
    ) ||
    config.maxExecutionLatencyMs <= 0
  ) {
    errors.push(
      "maxExecutionLatencyMs must be greater than zero",
    );
  }

  if (
    !Number.isFinite(
      config.warningExecutionLatencyMs,
    ) ||
    config.warningExecutionLatencyMs <= 0
  ) {
    errors.push(
      "warningExecutionLatencyMs must be greater than zero",
    );
  }

  if (
    config.warningExecutionLatencyMs >
    config.maxExecutionLatencyMs
  ) {
    errors.push(
      "warningExecutionLatencyMs cannot exceed maxExecutionLatencyMs",
    );
  }

  if (
    config.heartbeatTimeoutMs <
    config.intervalMs
  ) {
    errors.push(
      "heartbeatTimeoutMs should be greater than or equal to intervalMs",
    );
  }

  return errors;
}

/**
 * Throws only when configuration is invalid.
 *
 * Intended for application startup / bootstrap.
 */
export function assertLiveTradingConfig(
  config: LiveTradingConfig,
): void {
  const errors =
    validateLiveTradingConfig(config);

  if (errors.length === 0) {
    return;
  }

  throw new Error(
    `Invalid live trading monitor configuration: ${errors.join(
      "; ",
    )}`,
  );
}

/**
 * Determine monitoring level from runtime metrics.
 */
export function resolveLiveTradingMonitorLevel(
  consecutiveFailures: number,
  staleHeartbeats: number,
  executionLatencyMs: number,
  config: LiveTradingConfig,
): LiveTradingMonitorLevel {
  if (
    consecutiveFailures >=
      config.maxConsecutiveFailures ||
    staleHeartbeats >=
      config.maxStaleHeartbeats ||
    executionLatencyMs >
      config.maxExecutionLatencyMs
  ) {
    return "CRITICAL";
  }

  if (
    consecutiveFailures > 0 ||
    staleHeartbeats > 0 ||
    executionLatencyMs >
      config.warningExecutionLatencyMs
  ) {
    return "WARNING";
  }

  return "NORMAL";
}

/**
 * Determine whether monitoring should permit
 * the runtime to remain operational.
 *
 * This does NOT authorize an order.
 */
export function isMonitoringHealthy(
  level: LiveTradingMonitorLevel,
): boolean {
  return level === "NORMAL";
}

export default DEFAULT_LIVE_TRADING_CONFIG;
