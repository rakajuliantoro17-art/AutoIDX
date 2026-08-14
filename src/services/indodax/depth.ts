/**
 * ============================================================
 * AURA Trade OS
 * Indodax Depth Service
 * ============================================================
 *
 * Phase 38 - Integration / Fix
 *
 * Responsibility:
 * - Mengambil order book / market depth Indodax.
 * - Normalisasi bid dan ask.
 * - Menghitung spread.
 * - Menyediakan best bid / best ask.
 * - Menyediakan snapshot depth.
 *
 * NOT responsible for:
 * - Strategy
 * - Risk
 * - Buy/Sell
 * - Order execution
 * - Portfolio mutation
 *
 * Flow:
 *
 * IndodaxClient
 *      ↓
 * DepthService
 *      ↓
 * Normalized OrderBook
 *      ↓
 * Market / Indicator / Strategy
 * ============================================================
 */

import type {
  IndodaxClient,
} from "./client";

export type DepthSide =
  | "bid"
  | "ask";

export interface DepthLevel {
  price: number;
  amount: number;
  total: number;
}

export interface IndodaxDepthRaw {
  buy?: unknown;
  sell?: unknown;
  bids?: unknown;
  asks?: unknown;
}

export interface IndodaxDepthResponse {
  buy: DepthLevel[];
  sell: DepthLevel[];
}

export interface OrderBookSnapshot {
  pair: string;
  bids: DepthLevel[];
  asks: DepthLevel[];
  bestBid: number | null;
  bestAsk: number | null;
  spread: number | null;
  spreadPercent: number | null;
  timestamp: number;
}

export interface DepthOptions {
  limit?: number;
}

export class IndodaxDepthError extends Error {
  public readonly code: string;

  public constructor(
    message: string,
    code = "INDODAX_DEPTH_ERROR",
  ) {
    super(message);

    this.name =
      "IndodaxDepthError";

    this.code = code;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

export class IndodaxDepthService {
  private readonly client: IndodaxClient;

  private readonly defaultLimit: number;

  public constructor(
    client: IndodaxClient,
    options: DepthOptions = {},
  ) {
    if (!client) {
      throw new IndodaxDepthError(
        "IndodaxClient is required",
        "CLIENT_REQUIRED",
      );
    }

    this.client = client;

    this.defaultLimit =
      options.limit ?? 50;

    this.validateLimit(
      this.defaultLimit,
    );
  }

  /**
   * Fetch raw depth response from Indodax.
   */
  public async getDepth(
    pair: string,
    options: DepthOptions = {},
  ): Promise<IndodaxDepthResponse> {
    const normalizedPair =
      this.normalizePair(pair);

    const limit =
      options.limit ??
      this.defaultLimit;

    this.validateLimit(limit);

    const response =
      await this.client.getDepth<
        unknown
      >(normalizedPair);

    return this.normalizeResponse(
      response,
      limit,
    );
  }

  /**
   * Return normalized bids.
   */
  public async getBids(
    pair: string,
    options: DepthOptions = {},
  ): Promise<DepthLevel[]> {
    const depth =
      await this.getDepth(
        pair,
        options,
      );

    return depth.buy;
  }

  /**
   * Return normalized asks.
   */
  public async getAsks(
    pair: string,
    options: DepthOptions = {},
  ): Promise<DepthLevel[]> {
    const depth =
      await this.getDepth(
        pair,
        options,
      );

    return depth.sell;
  }

  /**
   * Return best bid.
   */
  public async getBestBid(
    pair: string,
  ): Promise<number | null> {
    const bids =
      await this.getBids(pair);

    return bids.length > 0
      ? bids[0].price
      : null;
  }

  /**
   * Return best ask.
   */
  public async getBestAsk(
    pair: string,
  ): Promise<number | null> {
    const asks =
      await this.getAsks(pair);

    return asks.length > 0
      ? asks[0].price
      : null;
  }

  /**
   * Return bid/ask spread.
   */
  public async getSpread(
    pair: string,
  ): Promise<number | null> {
    const snapshot =
      await this.getSnapshot(pair);

    return snapshot.spread;
  }

  /**
   * Return spread percentage.
   */
  public async getSpreadPercent(
    pair: string,
  ): Promise<number | null> {
    const snapshot =
      await this.getSnapshot(pair);

    return snapshot.spreadPercent;
  }

  /**
   * Return complete normalized order-book snapshot.
   */
  public async getSnapshot(
    pair: string,
    options: DepthOptions = {},
  ): Promise<OrderBookSnapshot> {
    const normalizedPair =
      this.normalizePair(pair);

    const depth =
      await this.getDepth(
        normalizedPair,
        options,
      );

    const bestBid =
      depth.buy.length > 0
        ? depth.buy[0].price
        : null;

    const bestAsk =
      depth.sell.length > 0
        ? depth.sell[0].price
        : null;

    const spread =
      this.calculateSpread(
        bestBid,
        bestAsk,
      );

    const spreadPercent =
      this.calculateSpreadPercent(
        bestBid,
        bestAsk,
      );

    return {
      pair:
        normalizedPair,

      bids:
        depth.buy,

      asks:
        depth.sell,

      bestBid,

      bestAsk,

      spread,

      spreadPercent,

      timestamp:
        Date.now(),
    };
  }

  /**
   * Calculate total amount at a side.
   */
  public calculateSideVolume(
    levels: DepthLevel[],
  ): number {
    return levels.reduce(
      (
        total,
        level,
      ) =>
        total +
        level.amount,
      0,
    );
  }

  /**
   * Calculate total notional value.
   */
  public calculateSideValue(
    levels: DepthLevel[],
  ): number {
    return levels.reduce(
      (
        total,
        level,
      ) =>
        total +
        level.total,
      0,
    );
  }

  /**
   * Calculate bid/ask imbalance.
   *
   * Result:
   *
   * +1 = all bid volume
   *  0 = balanced
   * -1 = all ask volume
   */
  public calculateImbalance(
    bids: DepthLevel[],
    asks: DepthLevel[],
  ): number {
    const bidVolume =
      this.calculateSideVolume(
        bids,
      );

    const askVolume =
      this.calculateSideVolume(
        asks,
      );

    const total =
      bidVolume +
      askVolume;

    if (total === 0) {
      return 0;
    }

    return (
      (bidVolume -
        askVolume) /
      total
    );
  }

  /**
   * Return top N levels.
   */
  public limitLevels(
    levels: DepthLevel[],
    limit: number,
  ): DepthLevel[] {
    this.validateLimit(limit);

    return levels.slice(
      0,
      limit,
    );
  }

  /**
   * Normalize Indodax response.
   */
  private normalizeResponse(
    response: unknown,
    limit: number,
  ): IndodaxDepthResponse {
    if (
      !this.isRecord(response)
    ) {
      throw new IndodaxDepthError(
        "Invalid Indodax depth response",
        "INVALID_RESPONSE",
      );
    }

    const raw =
      this.extractDepthPayload(
        response,
      );

    const buy =
      this.normalizeLevels(
        raw.buy ??
          raw.bids,
        "bid",
      );

    const sell =
      this.normalizeLevels(
        raw.sell ??
          raw.asks,
        "ask",
      );

    return {
      buy:
        this.sortBids(
          buy,
        ).slice(
          0,
          limit,
        ),

      sell:
        this.sortAsks(
          sell,
        ).slice(
          0,
          limit,
        ),
    };
  }

  /**
   * Extract the actual depth object.
   *
   * Supports both:
   *
   * {
   *   buy: [],
   *   sell: []
   * }
   *
   * and:
   *
   * {
   *   bids: [],
   *   asks: []
   * }
   */
  private extractDepthPayload(
    response: Record<
      string,
      unknown
    >,
  ): IndodaxDepthRaw {
    if (
      this.isRecord(
        response.return,
      )
    ) {
      return response.return as IndodaxDepthRaw;
    }

    return response as IndodaxDepthRaw;
  }

  /**
   * Normalize bid/ask arrays.
   */
  private normalizeLevels(
    value: unknown,
    side: DepthSide,
  ): DepthLevel[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const levels: DepthLevel[] =
      [];

    for (
      const entry of value
    ) {
      const level =
        this.normalizeLevel(
          entry,
          side,
        );

      if (level) {
        levels.push(level);
      }
    }

    return levels;
  }

  /**
   * Normalize one order-book level.
   *
   * Supports:
   *
   * [price, amount]
   *
   * [price, amount, total]
   *
   * {
   *   price,
   *   amount
   * }
   */
  private normalizeLevel(
    value: unknown,
    _side: DepthSide,
  ): DepthLevel | null {
    let price: number;
    let amount: number;
    let total: number | undefined;

    if (
      Array.isArray(value)
    ) {
      if (
        value.length < 2
      ) {
        return null;
      }

      price =
        this.toNumber(
          value[0],
        );

      amount =
        this.toNumber(
          value[1],
        );

      if (
        value.length >= 3
      ) {
        total =
          this.toNumber(
            value[2],
          );
      }
    } else if (
      this.isRecord(value)
    ) {
      price =
        this.toNumber(
          value.price ??
            value.rate ??
            value[0],
        );

      amount =
        this.toNumber(
          value.amount ??
            value.volume ??
            value.qty ??
            value.quantity ??
            value[1],
        );

      if (
        value.total !==
        undefined
      ) {
        total =
          this.toNumber(
            value.total,
          );
      }
    } else {
      return null;
    }

    if (
      price <= 0 ||
      amount <= 0
    ) {
      return null;
    }

    return {
      price,

      amount,

      total:
        total ??
        price * amount,
    };
  }

  /**
   * Highest bid first.
   */
  private sortBids(
    levels: DepthLevel[],
  ): DepthLevel[] {
    return [
      ...levels,
    ].sort(
      (
        a,
        b,
      ) =>
        b.price -
        a.price,
    );
  }

  /**
   * Lowest ask first.
   */
  private sortAsks(
    levels: DepthLevel[],
  ): DepthLevel[] {
    return [
      ...levels,
    ].sort(
      (
        a,
        b,
      ) =>
        a.price -
        b.price,
    );
  }

  /**
   * Calculate spread.
   */
  private calculateSpread(
    bestBid:
      | number
      | null,
    bestAsk:
      | number
      | null,
  ): number | null {
    if (
      bestBid === null ||
      bestAsk === null
    ) {
      return null;
    }

    const spread =
      bestAsk -
      bestBid;

    return Math.max(
      0,
      spread,
    );
  }

  /**
   * Calculate spread percentage against
   * the midpoint.
   */
  private calculateSpreadPercent(
    bestBid:
      | number
      | null,
    bestAsk:
      | number
      | null,
  ): number | null {
    if (
      bestBid === null ||
      bestAsk === null
    ) {
      return null;
    }

    const midpoint =
      (bestBid +
        bestAsk) /
      2;

    if (
      midpoint <= 0
    ) {
      return null;
    }

    return (
      ((bestAsk -
        bestBid) /
        midpoint) *
      100
    );
  }

  /**
   * Validate trading pair.
   */
  private normalizePair(
    pair: string,
  ): string {
    if (
      typeof pair !==
        "string" ||
      pair.trim().length ===
        0
    ) {
      throw new IndodaxDepthError(
        "Trading pair is required",
        "PAIR_REQUIRED",
      );
    }

    return pair
      .trim()
      .toLowerCase();
  }

  /**
   * Validate level limit.
   */
  private validateLimit(
    limit: number,
  ): void {
    if (
      !Number.isInteger(
        limit,
      ) ||
      limit <= 0
    ) {
      throw new IndodaxDepthError(
        "Depth limit must be a positive integer",
        "INVALID_LIMIT",
      );
    }
  }

  /**
   * Convert unknown numeric value.
   */
  private toNumber(
    value: unknown,
  ): number {
    const parsed =
      typeof value ===
      "number"
        ? value
        : typeof value ===
            "string"
          ? Number(value)
          : Number.NaN;

    if (
      !Number.isFinite(parsed)
    ) {
      throw new IndodaxDepthError(
        "Invalid numeric depth value",
        "INVALID_DEPTH_VALUE",
      );
    }

    return parsed;
  }

  /**
   * Generic object guard.
   */
  private isRecord(
    value: unknown,
  ): value is Record<
    string,
    unknown
  > {
    return (
      typeof value ===
        "object" &&
      value !== null &&
      !Array.isArray(value)
    );
  }
}

/**
 * Factory helper.
 */
export function createIndodaxDepthService(
  client: IndodaxClient,
  options?: DepthOptions,
): IndodaxDepthService {
  return new IndodaxDepthService(
    client,
    options,
  );
}

export default IndodaxDepthService;
