/**
 * ==========================================================
 * AURA Trade OS
 * Indodax Market Summaries Service
 *
 * File    : src/services/indodax/summaries.ts
 * Version : 0.1.0 Alpha
 * Phase   : 38 Integration
 *
 * Responsibility:
 * - Retrieve market summaries from Indodax
 * - Normalize summary responses
 * - Provide safe numeric conversion helpers
 *
 * IMPORTANT:
 * - Public API only
 * - No private credentials
 * - No order execution
 * - No BUY / SELL decision
 * - No Risk Layer bypass
 * ==========================================================
 */

const DEFAULT_BASE_URL = "https://indodax.com";
const DEFAULT_TIMEOUT_MS = 10_000;

export interface IndodaxSummary {
  high: string;
  low: string;
  vol: string;
  last: string;
  buy: string;
  sell: string;
  serverTime?: number;
}

export interface IndodaxSummaryNumeric {
  high: number;
  low: number;
  volume: number;
  last: number;
  buy: number;
  sell: number;
  serverTime?: number;
}

export interface IndodaxSummariesConfig {
  baseUrl?: string;
  timeoutMs?: number;
}

export class IndodaxSummariesError extends Error {
  public readonly endpoint: string;

  public readonly status?: number;

  public readonly code: string;

  public readonly cause?: unknown;

  constructor(
    message: string,
    options: {
      endpoint: string;
      status?: number;
      code?: string;
      cause?: unknown;
    },
  ) {
    super(message);

    this.name = "IndodaxSummariesError";

    this.endpoint = options.endpoint;

    this.status = options.status;

    this.code =
      options.code ?? "INDODAX_SUMMARIES_ERROR";

    this.cause = options.cause;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

function normalizeBaseUrl(
  baseUrl: string,
): string {
  return baseUrl.replace(/\/+$/, "");
}

function normalizePair(
  pair: string,
): string {
  const normalized = pair
    .trim()
    .toLowerCase();

  if (!normalized) {
    throw new IndodaxSummariesError(
      "Trading pair is required.",
      {
        endpoint: "summaries",
        code: "INVALID_PAIR",
      },
    );
  }

  return normalized;
}

function normalizeTimeout(
  timeoutMs: number,
): number {
  if (
    !Number.isFinite(timeoutMs) ||
    timeoutMs <= 0
  ) {
    return DEFAULT_TIMEOUT_MS;
  }

  return Math.floor(timeoutMs);
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function toNumber(
  value: unknown,
): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return number;
}

function parseSummary(
  payload: unknown,
  endpoint: string,
): IndodaxSummary {
  if (!isRecord(payload)) {
    throw new IndodaxSummariesError(
      "Invalid Indodax summary response.",
      {
        endpoint,
        code: "INVALID_RESPONSE",
      },
    );
  }

  if (payload.success !== 1) {
    const message =
      typeof payload.error === "string"
        ? payload.error
        : "Indodax summaries request failed.";

    throw new IndodaxSummariesError(
      message,
      {
        endpoint,
        code: "API_ERROR",
      },
    );
  }

  const result = payload.return;

  if (!isRecord(result)) {
    throw new IndodaxSummariesError(
      "Invalid summaries payload.",
      {
        endpoint,
        code: "INVALID_PAYLOAD",
      },
    );
  }

  return {
    high: String(
      result.high ?? "0",
    ),

    low: String(
      result.low ?? "0",
    ),

    vol: String(
      result.vol ?? "0",
    ),

    last: String(
      result.last ?? "0",
    ),

    buy: String(
      result.buy ?? "0",
    ),

    sell: String(
      result.sell ?? "0",
    ),

    serverTime:
      typeof result.server_time === "number"
        ? result.server_time
        : undefined,
  };
}

export class IndodaxSummariesService {
  private readonly baseUrl: string;

  private readonly timeoutMs: number;

  constructor(
    config: IndodaxSummariesConfig = {},
  ) {
    this.baseUrl = normalizeBaseUrl(
      config.baseUrl ??
        DEFAULT_BASE_URL,
    );

    this.timeoutMs = normalizeTimeout(
      config.timeoutMs ??
        DEFAULT_TIMEOUT_MS,
    );
  }

  private async request(
    pair: string,
  ): Promise<IndodaxSummary> {
    const normalizedPair =
      normalizePair(pair);

    const endpoint =
      `/api/summaries/${encodeURIComponent(
        normalizedPair,
      )}`;

    const controller =
      new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      this.timeoutMs,
    );

    try {
      const response = await fetch(
        `${this.baseUrl}${endpoint}`,
        {
          method: "GET",

          headers: {
            Accept: "application/json",
          },

          cache: "no-store",

          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new IndodaxSummariesError(
          `Indodax returned HTTP ${response.status}.`,
          {
            endpoint,
            status: response.status,
            code: "HTTP_ERROR",
          },
        );
      }

      let payload: unknown;

      try {
        payload =
          await response.json();
      } catch (error) {
        throw new IndodaxSummariesError(
          "Failed to parse Indodax response.",
          {
            endpoint,
            code: "INVALID_JSON",
            cause: error,
          },
        );
      }

      return parseSummary(
        payload,
        endpoint,
      );
    } catch (error) {
      if (
        error instanceof
        IndodaxSummariesError
      ) {
        throw error;
      }

      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new IndodaxSummariesError(
          `Indodax summaries request timed out after ${this.timeoutMs}ms.`,
          {
            endpoint,
            code: "TIMEOUT",
            cause: error,
          },
        );
      }

      throw new IndodaxSummariesError(
        "Unable to reach Indodax summaries API.",
        {
          endpoint,
          code: "NETWORK_ERROR",
          cause: error,
        },
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Get market summary for one pair.
   *
   * Example:
   *
   * btc_idr
   */
  async getSummary(
    pair: string,
  ): Promise<IndodaxSummary> {
    return this.request(pair);
  }

  /**
   * Get summary and convert all price/volume
   * values into numbers.
   *
   * Useful for analytics and strategy calculations.
   */
  async getNumericSummary(
    pair: string,
  ): Promise<IndodaxSummaryNumeric> {
    const summary =
      await this.getSummary(pair);

    return {
      high: toNumber(summary.high),

      low: toNumber(summary.low),

      volume: toNumber(summary.vol),

      last: toNumber(summary.last),

      buy: toNumber(summary.buy),

      sell: toNumber(summary.sell),

      serverTime:
        summary.serverTime,
    };
  }

  /**
   * Calculate spread between best sell
   * and best buy prices.
   */
  async getSpread(
    pair: string,
  ): Promise<number> {
    const summary =
      await this.getNumericSummary(
        pair,
      );

    return summary.sell -
      summary.buy;
  }

  /**
   * Calculate spread percentage.
   *
   * Returns 0 when buy price is zero.
   */
  async getSpreadPercentage(
    pair: string,
  ): Promise<number> {
    const summary =
      await this.getNumericSummary(
        pair,
      );

    if (summary.buy <= 0) {
      return 0;
    }

    return (
      (summary.sell -
        summary.buy) /
      summary.buy
    ) * 100;
  }

  /**
   * Calculate daily price change
   * relative to the reported low.
   */
  async getRangePercentage(
    pair: string,
  ): Promise<number> {
    const summary =
      await this.getNumericSummary(
        pair,
      );

    if (summary.low <= 0) {
      return 0;
    }

    return (
      (summary.high -
        summary.low) /
      summary.low
    ) * 100;
  }

  /**
   * Determine whether the current price
   * is above the reported midpoint.
   */
  async isAboveMidpoint(
    pair: string,
  ): Promise<boolean> {
    const summary =
      await this.getNumericSummary(
        pair,
      );

    const midpoint =
      (summary.high +
        summary.low) /
      2;

    return (
      summary.last >
      midpoint
    );
  }
}

/**
 * Default singleton.
 *
 * Public market data only.
 */
export const indodaxSummaries =
  new IndodaxSummariesService();

export default indodaxSummaries;
