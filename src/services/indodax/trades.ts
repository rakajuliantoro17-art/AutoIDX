/**
 * ==========================================================
 * AURA Trade OS
 * Indodax Public Trades Service
 *
 * File    : src/services/indodax/trades.ts
 * Version : 0.1.0 Alpha
 * Phase   : 38 Integration
 *
 * Responsibility:
 * - Retrieve recent public trades
 * - Normalize trade response
 * - Provide lightweight trade-flow helpers
 *
 * IMPORTANT:
 * - Public API only
 * - No API credentials
 * - No order execution
 * - No BUY / SELL decision
 * - No Risk Layer bypass
 * ==========================================================
 */

const DEFAULT_BASE_URL = "https://indodax.com";
const DEFAULT_TIMEOUT_MS = 10_000;

export type IndodaxTradeSide = "buy" | "sell" | string;

export interface IndodaxTrade {
  date: number;
  price: string;
  amount: string;
  tid: string;
  type: IndodaxTradeSide;
}

export interface IndodaxTradeNumeric {
  date: number;
  price: number;
  amount: number;
  tid: string;
  type: IndodaxTradeSide;
}

export interface IndodaxTradesConfig {
  baseUrl?: string;
  timeoutMs?: number;
}

export interface IndodaxTradeFlow {
  buyVolume: number;
  sellVolume: number;
  totalVolume: number;
  buyValue: number;
  sellValue: number;
  totalValue: number;
  buyCount: number;
  sellCount: number;
  totalCount: number;
}

export class IndodaxTradesError extends Error {
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

    this.name = "IndodaxTradesError";

    this.endpoint = options.endpoint;
    this.status = options.status;

    this.code =
      options.code ?? "INDODAX_TRADES_ERROR";

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

function normalizePair(
  pair: string,
): string {
  const normalized =
    pair.trim().toLowerCase();

  if (!normalized) {
    throw new IndodaxTradesError(
      "Trading pair is required.",
      {
        endpoint: "trades",
        code: "INVALID_PAIR",
      },
    );
  }

  return normalized;
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
  const result = Number(value);

  if (!Number.isFinite(result)) {
    return 0;
  }

  return result;
}

function parseTrade(
  value: unknown,
): IndodaxTrade | null {
  if (!isRecord(value)) {
    return null;
  }

  const date = toNumber(value.date);

  const price = String(
    value.price ?? "0",
  );

  const amount = String(
    value.amount ?? "0",
  );

  const tid = String(
    value.tid ?? "",
  );

  const type =
    value.type === "buy" ||
    value.type === "sell"
      ? value.type
      : String(value.type ?? "");

  return {
    date,
    price,
    amount,
    tid,
    type,
  };
}

function parseResponse(
  payload: unknown,
  endpoint: string,
): IndodaxTrade[] {
  if (!isRecord(payload)) {
    throw new IndodaxTradesError(
      "Invalid Indodax trades response.",
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
        : "Indodax trades request failed.";

    throw new IndodaxTradesError(
      message,
      {
        endpoint,
        code: "API_ERROR",
      },
    );
  }

  const result = payload.return;

  if (!Array.isArray(result)) {
    throw new IndodaxTradesError(
      "Invalid trades payload.",
      {
        endpoint,
        code: "INVALID_PAYLOAD",
      },
    );
  }

  return result
    .map(parseTrade)
    .filter(
      (
        trade,
      ): trade is IndodaxTrade =>
        trade !== null,
    );
}

export class IndodaxTradesService {
  private readonly baseUrl: string;

  private readonly timeoutMs: number;

  constructor(
    config: IndodaxTradesConfig = {},
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
  ): Promise<IndodaxTrade[]> {
    const normalizedPair =
      normalizePair(pair);

    const endpoint =
      `/api/trades/${encodeURIComponent(
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
        throw new IndodaxTradesError(
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
        throw new IndodaxTradesError(
          "Failed to parse Indodax trades response.",
          {
            endpoint,
            code: "INVALID_JSON",
            cause: error,
          },
        );
      }

      return parseResponse(
        payload,
        endpoint,
      );
    } catch (error) {
      if (
        error instanceof
        IndodaxTradesError
      ) {
        throw error;
      }

      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new IndodaxTradesError(
          `Indodax trades request timed out after ${this.timeoutMs}ms.`,
          {
            endpoint,
            code: "TIMEOUT",
            cause: error,
          },
        );
      }

      throw new IndodaxTradesError(
        "Unable to reach Indodax trades API.",
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
   * Get recent public trades.
   */
  async getTrades(
    pair: string,
  ): Promise<IndodaxTrade[]> {
    return this.request(pair);
  }

  /**
   * Alias for getTrades().
   */
  async getRecentTrades(
    pair: string,
  ): Promise<IndodaxTrade[]> {
    return this.getTrades(pair);
  }

  /**
   * Convert string price/amount fields
   * into numeric values.
   */
  async getNumericTrades(
    pair: string,
  ): Promise<IndodaxTradeNumeric[]> {
    const trades =
      await this.getTrades(pair);

    return trades.map(
      (trade) => ({
        date: trade.date,

        price: toNumber(
          trade.price,
        ),

        amount: toNumber(
          trade.amount,
        ),

        tid: trade.tid,

        type: trade.type,
      }),
    );
  }

  /**
   * Calculate buy/sell volume and value
   * from recent trades.
   *
   * This is market-flow information only.
   * It does not generate a trading signal.
   */
  async getTradeFlow(
    pair: string,
  ): Promise<IndodaxTradeFlow> {
    const trades =
      await this.getNumericTrades(
        pair,
      );

    let buyVolume = 0;
    let sellVolume = 0;

    let buyValue = 0;
    let sellValue = 0;

    let buyCount = 0;
    let sellCount = 0;

    for (const trade of trades) {
      const value =
        trade.price *
        trade.amount;

      if (trade.type === "buy") {
        buyVolume += trade.amount;
        buyValue += value;
        buyCount += 1;
        continue;
      }

      if (trade.type === "sell") {
        sellVolume += trade.amount;
        sellValue += value;
        sellCount += 1;
      }
    }

    return {
      buyVolume,
      sellVolume,

      totalVolume:
        buyVolume +
        sellVolume,

      buyValue,
      sellValue,

      totalValue:
        buyValue +
        sellValue,

      buyCount,
      sellCount,

      totalCount:
        buyCount +
        sellCount,
    };
  }

  /**
   * Calculate buy-volume dominance.
   *
   * 0   = no buy volume
   * 0.5 = balanced
   * 1   = entirely buy volume
   */
  async getBuyVolumeRatio(
    pair: string,
  ): Promise<number> {
    const flow =
      await this.getTradeFlow(
        pair,
      );

    if (flow.totalVolume <= 0) {
      return 0;
    }

    return (
      flow.buyVolume /
      flow.totalVolume
    );
  }

  /**
   * Calculate sell-volume dominance.
   */
  async getSellVolumeRatio(
    pair: string,
  ): Promise<number> {
    const flow =
      await this.getTradeFlow(
        pair,
      );

    if (flow.totalVolume <= 0) {
      return 0;
    }

    return (
      flow.sellVolume /
      flow.totalVolume
    );
  }

  /**
   * Return the latest trade.
   */
  async getLatestTrade(
    pair: string,
  ): Promise<
    IndodaxTrade | undefined
  > {
    const trades =
      await this.getTrades(pair);

    return trades[0];
  }

  /**
   * Return the latest numeric trade.
   */
  async getLatestNumericTrade(
    pair: string,
  ): Promise<
    IndodaxTradeNumeric | undefined
  > {
    const trade =
      await this.getLatestTrade(
        pair,
      );

    if (!trade) {
      return undefined;
    }

    return {
      date: trade.date,

      price: toNumber(
        trade.price,
      ),

      amount: toNumber(
        trade.amount,
      ),

      tid: trade.tid,

      type: trade.type,
    };
  }
}

/**
 * Default singleton.
 *
 * Public market-data service only.
 */
export const indodaxTrades =
  new IndodaxTradesService();

export default indodaxTrades;
