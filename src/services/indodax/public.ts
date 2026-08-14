/**
 * ==========================================================
 * AURA Trade OS
 * Indodax Public API Service
 *
 * File    : src/services/indodax/public.ts
 * Version : 0.1.0 Alpha
 * Phase   : 38 Integration
 *
 * Responsibility:
 * - Public market-data access
 * - Ticker
 * - Order book / depth
 * - Market summaries
 * - Recent trades
 * - Server time
 *
 * IMPORTANT:
 * - No private API credentials are used here.
 * - No trading/order execution is performed here.
 * - This module must remain safe for public market-data access.
 * ==========================================================
 */

const DEFAULT_BASE_URL = "https://indodax.com";

const DEFAULT_TIMEOUT_MS = 10_000;

export interface IndodaxPublicConfig {
  baseUrl?: string;
  timeoutMs?: number;
}

export interface IndodaxTicker {
  buy: string;
  sell: string;
  last: string;
  high: string;
  low: string;
  vol: string;
  serverTime?: number;
  timestamp?: number;
}

export interface IndodaxDepthEntry {
  price: string;
  volume: string;
}

export interface IndodaxDepth {
  buy: IndodaxDepthEntry[];
  sell: IndodaxDepthEntry[];
  timestamp?: number;
}

export interface IndodaxSummary {
  high: string;
  low: string;
  vol: string;
  last: string;
  buy: string;
  sell: string;
  serverTime?: number;
}

export interface IndodaxTrade {
  date: number;
  price: string;
  amount: string;
  tid: string;
  type: "buy" | "sell" | string;
}

export interface IndodaxPublicResponse<T> {
  success: number;
  return: T;
  error?: string;
}

export class IndodaxPublicApiError extends Error {
  public readonly status?: number;

  public readonly endpoint: string;

  public readonly code: string;

  public readonly cause?: unknown;

  constructor(
    message: string,
    options: {
      status?: number;
      endpoint: string;
      code?: string;
      cause?: unknown;
    },
  ) {
    super(message);

    this.name = "IndodaxPublicApiError";
    this.status = options.status;
    this.endpoint = options.endpoint;
    this.code = options.code ?? "INDODAX_PUBLIC_API_ERROR";
    this.cause = options.cause;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function validateTimeout(timeoutMs: number): number {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }

  return Math.floor(timeoutMs);
}

function normalizePair(pair: string): string {
  const normalized = pair.trim().toLowerCase();

  if (!normalized) {
    throw new IndodaxPublicApiError("Trading pair is required.", {
      endpoint: "unknown",
      code: "INVALID_PAIR",
    });
  }

  return normalized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractPayload<T>(payload: unknown, endpoint: string): T {
  if (!isRecord(payload)) {
    throw new IndodaxPublicApiError(
      "Invalid response received from Indodax.",
      {
        endpoint,
        code: "INVALID_RESPONSE",
      },
    );
  }

  const success = payload.success;

  if (success !== 1) {
    const error =
      typeof payload.error === "string"
        ? payload.error
        : "Indodax public API request failed.";

    throw new IndodaxPublicApiError(error, {
      endpoint,
      code: "API_ERROR",
    });
  }

  return payload.return as T;
}

function parseTicker(raw: unknown): IndodaxTicker {
  if (!isRecord(raw)) {
    throw new IndodaxPublicApiError("Invalid ticker response.", {
      endpoint: "ticker",
      code: "INVALID_TICKER",
    });
  }

  return {
    buy: String(raw.buy ?? "0"),
    sell: String(raw.sell ?? "0"),
    last: String(raw.last ?? "0"),
    high: String(raw.high ?? "0"),
    low: String(raw.low ?? "0"),
    vol: String(raw.vol ?? "0"),
    serverTime:
      typeof raw.server_time === "number"
        ? raw.server_time
        : undefined,
    timestamp:
      typeof raw.timestamp === "number"
        ? raw.timestamp
        : undefined,
  };
}

function parseDepth(raw: unknown): IndodaxDepth {
  if (!isRecord(raw)) {
    throw new IndodaxPublicApiError("Invalid depth response.", {
      endpoint: "depth",
      code: "INVALID_DEPTH",
    });
  }

  const parseEntries = (
    value: unknown,
  ): IndodaxDepthEntry[] => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter(
        (entry): entry is unknown[] =>
          Array.isArray(entry) && entry.length >= 2,
      )
      .map((entry) => ({
        price: String(entry[0]),
        volume: String(entry[1]),
      }));
  };

  return {
    buy: parseEntries(raw.buy),
    sell: parseEntries(raw.sell),
    timestamp:
      typeof raw.timestamp === "number"
        ? raw.timestamp
        : undefined,
  };
}

function parseSummary(raw: unknown): IndodaxSummary {
  if (!isRecord(raw)) {
    throw new IndodaxPublicApiError("Invalid summary response.", {
      endpoint: "summaries",
      code: "INVALID_SUMMARY",
    });
  }

  return {
    high: String(raw.high ?? "0"),
    low: String(raw.low ?? "0"),
    vol: String(raw.vol ?? "0"),
    last: String(raw.last ?? "0"),
    buy: String(raw.buy ?? "0"),
    sell: String(raw.sell ?? "0"),
    serverTime:
      typeof raw.server_time === "number"
        ? raw.server_time
        : undefined,
  };
}

function parseTrades(raw: unknown): IndodaxTrade[] {
  if (!Array.isArray(raw)) {
    throw new IndodaxPublicApiError(
      "Invalid trades response.",
      {
        endpoint: "trades",
        code: "INVALID_TRADES",
      },
    );
  }

  return raw
    .filter(isRecord)
    .map((trade) => ({
      date:
        typeof trade.date === "number"
          ? trade.date
          : Number(trade.date ?? 0),

      price: String(trade.price ?? "0"),

      amount: String(trade.amount ?? "0"),

      tid: String(trade.tid ?? ""),

      type:
        trade.type === "buy" || trade.type === "sell"
          ? trade.type
          : String(trade.type ?? ""),
    }));
}

export class IndodaxPublicApi {
  private readonly baseUrl: string;

  private readonly timeoutMs: number;

  constructor(config: IndodaxPublicConfig = {}) {
    this.baseUrl = normalizeBaseUrl(
      config.baseUrl ?? DEFAULT_BASE_URL,
    );

    this.timeoutMs = validateTimeout(
      config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    );
  }

  private async request<T>(
    path: string,
  ): Promise<T> {
    const endpoint = path;

    const controller = new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      this.timeoutMs,
    );

    try {
      const response = await fetch(
        `${this.baseUrl}${path}`,
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
        throw new IndodaxPublicApiError(
          `Indodax returned HTTP ${response.status}.`,
          {
            status: response.status,
            endpoint,
            code: "HTTP_ERROR",
          },
        );
      }

      let payload: unknown;

      try {
        payload = await response.json();
      } catch (error) {
        throw new IndodaxPublicApiError(
          "Failed to parse Indodax response as JSON.",
          {
            endpoint,
            code: "INVALID_JSON",
            cause: error,
          },
        );
      }

      return extractPayload<T>(
        payload,
        endpoint,
      );
    } catch (error) {
      if (error instanceof IndodaxPublicApiError) {
        throw error;
      }

      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new IndodaxPublicApiError(
          `Indodax request timed out after ${this.timeoutMs}ms.`,
          {
            endpoint,
            code: "TIMEOUT",
            cause: error,
          },
        );
      }

      throw new IndodaxPublicApiError(
        "Unable to reach Indodax public API.",
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

  async getTicker(
    pair: string,
  ): Promise<IndodaxTicker> {
    const normalizedPair = normalizePair(pair);

    const raw = await this.request<unknown>(
      `/api/ticker/${encodeURIComponent(
        normalizedPair,
      )}`,
    );

    return parseTicker(raw);
  }

  async getDepth(
    pair: string,
  ): Promise<IndodaxDepth> {
    const normalizedPair = normalizePair(pair);

    const raw = await this.request<unknown>(
      `/api/depth/${encodeURIComponent(
        normalizedPair,
      )}`,
    );

    return parseDepth(raw);
  }

  async getSummary(
    pair: string,
  ): Promise<IndodaxSummary> {
    const normalizedPair = normalizePair(pair);

    const raw = await this.request<unknown>(
      `/api/summaries/${encodeURIComponent(
        normalizedPair,
      )}`,
    );

    return parseSummary(raw);
  }

  async getTrades(
    pair: string,
  ): Promise<IndodaxTrade[]> {
    const normalizedPair = normalizePair(pair);

    const raw = await this.request<unknown>(
      `/api/trades/${encodeURIComponent(
        normalizedPair,
      )}`,
    );

    return parseTrades(raw);
  }

  async getServerTime(): Promise<number | undefined> {
    const raw = await this.request<unknown>(
      "/api/server_time",
    );

    if (typeof raw === "number") {
      return raw;
    }

    if (isRecord(raw)) {
      if (typeof raw.server_time === "number") {
        return raw.server_time;
      }

      if (typeof raw.timestamp === "number") {
        return raw.timestamp;
      }
    }

    return undefined;
  }
}

/**
 * Default singleton.
 *
 * Safe for public market-data access.
 * No API key or secret is loaded here.
 */
export const indodaxPublicApi =
  new IndodaxPublicApi();

export default indodaxPublicApi;
