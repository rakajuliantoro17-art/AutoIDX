/**
 * ============================================================
 * AURA Trade OS
 * INDODAX Order Service
 * ============================================================
 *
 * Phase 38 - Integration / Fix
 *
 * Responsibility:
 * - Create BUY orders
 * - Create SELL orders
 * - Validate order parameters
 * - Route requests through the Indodax client
 * - Normalize exchange responses
 *
 * This module MUST NOT:
 * - generate trading signals
 * - make BUY/SELL decisions
 * - bypass Risk Engine
 * - manage portfolio state
 * - implement strategy
 * - implement retry loops
 *
 * Trading flow:
 *
 * Strategy
 *    ↓
 * Risk
 *    ↓
 * Execution
 *    ↓
 * IndodaxOrderService
 *    ↓
 * IndodaxClient
 *    ↓
 * INDODAX
 * ============================================================
 */

import {
  indodaxLimiter,
} from "./limiter";

import type {
  IndodaxClient,
} from "./client";

/* ============================================================
 * Types
 * ============================================================
 */

export type IndodaxOrderSide =
  | "buy"
  | "sell";

export type IndodaxOrderType =
  | "market"
  | "limit";

export interface IndodaxOrderRequest {
  pair: string;

  side: IndodaxOrderSide;

  type?: IndodaxOrderType;

  /**
   * Price in IDR.
   *
   * Required for limit orders.
   */
  price?: number;

  /**
   * Quantity of base asset.
   *
   * Example:
   *
   * BTC = 0.0001
   */
  quantity?: number;

  /**
   * Amount in IDR.
   *
   * Mainly used for BUY orders
   * when the exchange endpoint expects
   * an IDR amount.
   */
  tradeAmountIdr?: number;

  /**
   * Optional client-side correlation ID.
   */
  clientOrderId?: string;

  /**
   * Optional metadata for tracing.
   */
  metadata?: Record<
    string,
    unknown
  >;
}

export interface IndodaxOrderResponse {
  success: boolean;

  orderId?: string;

  pair: string;

  side: IndodaxOrderSide;

  type: IndodaxOrderType;

  price?: number;

  quantity?: number;

  tradeAmountIdr?: number;

  receivedAt: number;

  raw?: unknown;

  error?: string;

  errorCode?: string | number;
}

export interface IndodaxOrderServiceOptions {
  /**
   * If false, order creation is disabled.
   *
   * Default: true.
   */
  enabled?: boolean;

  /**
   * Additional client-side validation.
   */
  minimumTradeAmountIdr?: number;

  /**
   * Maximum order amount allowed by this
   * service-level protection.
   *
   * This does NOT replace Risk Engine.
   */
  maximumTradeAmountIdr?: number;
}

/* ============================================================
 * Runtime Helpers
 * ============================================================
 */

interface ExchangeOrderResponse {
  success?: boolean;

  return?: {
    order_id?: string | number;

    orderId?: string | number;

    pair?: string;

    type?: string;

    price?: number | string;

    amount?: number | string;

    quantity?: number | string;

    balance?: unknown;

    [key: string]: unknown;
  };

  error?: string;

  error_code?: string | number;

  [key: string]: unknown;
}

/* ============================================================
 * IndodaxOrderService
 * ============================================================
 */

export class IndodaxOrderService {
  private readonly client: IndodaxClient;

  private readonly options:
    Required<
      IndodaxOrderServiceOptions
    >;

  public constructor(
    client: IndodaxClient,
    options: IndodaxOrderServiceOptions = {},
  ) {
    if (!client) {
      throw new Error(
        "IndodaxOrderService requires an IndodaxClient",
      );
    }

    this.client = client;

    this.options = {
      enabled:
        options.enabled ?? true,

      minimumTradeAmountIdr:
        options.minimumTradeAmountIdr ??
        10_000,

      maximumTradeAmountIdr:
        options.maximumTradeAmountIdr ??
        Number.MAX_SAFE_INTEGER,
    };
  }

  /* ==========================================================
   * BUY
   * ==========================================================
   */

  /**
   * Create a BUY order.
   *
   * IMPORTANT:
   * This method assumes the caller has already
   * passed the Risk Engine.
   */
  public async buy(
    request: Omit<
      IndodaxOrderRequest,
      "side"
    >,
  ): Promise<IndodaxOrderResponse> {
    return this.createOrder({
      ...request,
      side: "buy",
    });
  }

  /* ==========================================================
   * SELL
   * ==========================================================
   */

  /**
   * Create a SELL order.
   *
   * IMPORTANT:
   * This method assumes the caller has already
   * passed the Risk Engine.
   */
  public async sell(
    request: Omit<
      IndodaxOrderRequest,
      "side"
    >,
  ): Promise<IndodaxOrderResponse> {
    return this.createOrder({
      ...request,
      side: "sell",
    });
  }

  /* ==========================================================
   * Generic Order
   * ==========================================================
   */

  public async createOrder(
    request: IndodaxOrderRequest,
  ): Promise<IndodaxOrderResponse> {
    this.validateOrder(
      request,
    );

    if (
      !this.options.enabled
    ) {
      return {
        success: false,

        pair:
          request.pair,

        side:
          request.side,

        type:
          request.type ??
          "market",

        receivedAt:
          Date.now(),

        error:
          "Indodax order service is disabled",

        errorCode:
          "ORDER_SERVICE_DISABLED",
      };
    }

    const type =
      request.type ??
      "market";

    /**
     * All actual trading requests must
     * pass through the trade limiter.
     */
    return indodaxLimiter.executeTrade(
      async () => {
        const response =
          await this.sendOrder(
            request,
          );

        return this.normalizeResponse(
          request,
          type,
          response,
        );
      },
    );
  }

  /* ==========================================================
   * Exchange Request
   * ==========================================================
   */

  private async sendOrder(
    request: IndodaxOrderRequest,
  ): Promise<unknown> {
    const type =
      request.type ??
      "market";

    /**
     * INDODAX private trading API uses
     * trade endpoints.
     *
     * The exact payload is intentionally
     * kept at this adapter layer so the rest
     * of AURA does not depend directly on
     * exchange-specific request formatting.
     */
    const payload: Record<
      string,
      string | number
    > = {
      pair:
        request.pair,

      type:
        request.side,

      order_type:
        type,
    };

    /**
     * Limit order requires price.
     */
    if (
      type === "limit"
    ) {
      if (
        request.price ===
          undefined
      ) {
        throw new Error(
          "Limit order requires price",
        );
      }

      payload.price =
        request.price;
    }

    /**
     * Quantity is used when provided.
     */
    if (
      request.quantity !==
      undefined
    ) {
      payload.amount =
        request.quantity;
    }

    /**
     * IDR trade amount can be passed
     * for BUY operations.
     */
    if (
      request.tradeAmountIdr !==
        undefined
    ) {
      payload.idr =
        request.tradeAmountIdr;
    }

    /**
     * The client is intentionally accessed
     * through a small compatibility layer.
     *
     * This prevents this service from assuming
     * one exact internal client implementation.
     */
    return this.callPrivateTrade(
      payload,
    );
  }

  /* ==========================================================
   * Client Compatibility Layer
   * ==========================================================
   */

  private async callPrivateTrade(
    payload: Record<
      string,
      string | number
    >,
  ): Promise<unknown> {
    const client =
      this.client as unknown as {
        privateRequest?: (
          method: string,
          params?: Record<
            string,
            unknown
          >,
        ) => Promise<unknown>;

        requestPrivate?: (
          method: string,
          params?: Record<
            string,
            unknown
          >,
        ) => Promise<unknown>;

        trade?: (
          params: Record<
            string,
            unknown
          >,
        ) => Promise<unknown>;

        createOrder?: (
          params: Record<
            string,
            unknown
          >,
        ) => Promise<unknown>;
      };

    if (
      typeof client.privateRequest ===
      "function"
    ) {
      return client.privateRequest(
        "trade",
        payload,
      );
    }

    if (
      typeof client.requestPrivate ===
      "function"
    ) {
      return client.requestPrivate(
        "trade",
        payload,
      );
    }

    if (
      typeof client.trade ===
      "function"
    ) {
      return client.trade(
        payload,
      );
    }

    if (
      typeof client.createOrder ===
      "function"
    ) {
      return client.createOrder(
        payload,
      );
    }

    throw new Error(
      "IndodaxClient does not expose a supported private trade method",
    );
  }

  /* ==========================================================
   * Validation
   * ==========================================================
   */

  private validateOrder(
    request: IndodaxOrderRequest,
  ): void {
    if (
      !request ||
      typeof request !==
        "object"
    ) {
      throw new TypeError(
        "Order request is required",
      );
    }

    if (
      typeof request.pair !==
        "string" ||
      request.pair.trim()
        .length === 0
    ) {
      throw new TypeError(
        "Order pair is required",
      );
    }

    if (
      request.side !==
        "buy" &&
      request.side !==
        "sell"
    ) {
      throw new TypeError(
        "Order side must be buy or sell",
      );
    }

    const type =
      request.type ??
      "market";

    if (
      type !== "market" &&
      type !== "limit"
    ) {
      throw new TypeError(
        "Order type must be market or limit",
      );
    }

    if (
      request.price !==
        undefined
    ) {
      this.validatePositiveNumber(
        request.price,
        "Order price",
      );
    }

    if (
      request.quantity !==
        undefined
    ) {
      this.validatePositiveNumber(
        request.quantity,
        "Order quantity",
      );
    }

    if (
      request.tradeAmountIdr !==
        undefined
    ) {
      this.validatePositiveNumber(
        request.tradeAmountIdr,
        "Trade amount IDR",
      );

      if (
        request.tradeAmountIdr <
        this.options.minimumTradeAmountIdr
      ) {
        throw new Error(
          `Trade amount is below minimum configured amount of ${this.options.minimumTradeAmountIdr} IDR`,
        );
      }

      if (
        request.tradeAmountIdr >
        this.options.maximumTradeAmountIdr
      ) {
        throw new Error(
          `Trade amount exceeds maximum configured amount of ${this.options.maximumTradeAmountIdr} IDR`,
        );
      }
    }

    if (
      type === "limit" &&
      request.price ===
        undefined
    ) {
      throw new Error(
        "Limit orders require a price",
      );
    }

    if (
      request.quantity ===
        undefined &&
      request.tradeAmountIdr ===
        undefined
    ) {
      throw new Error(
        "Order requires quantity or tradeAmountIdr",
      );
    }
  }

  private validatePositiveNumber(
    value: number,
    field: string,
  ): void {
    if (
      typeof value !==
        "number" ||
      !Number.isFinite(
        value,
      ) ||
      value <= 0
    ) {
      throw new TypeError(
        `${field} must be a finite number greater than zero`,
      );
    }
  }

  /* ==========================================================
   * Response Normalization
   * ==========================================================
   */

  private normalizeResponse(
    request: IndodaxOrderRequest,
    type: IndodaxOrderType,
    raw: unknown,
  ): IndodaxOrderResponse {
    const response =
      this.asExchangeResponse(
        raw,
      );

    const success =
      response.success ===
      true;

    const orderId =
      this.extractOrderId(
        response,
      );

    const error =
      typeof response.error ===
      "string"
        ? response.error
        : undefined;

    const errorCode =
      response.error_code;

    const returnData =
      response.return;

    return {
      success,

      orderId,

      pair:
        request.pair,

      side:
        request.side,

      type,

      price:
        this.toNumber(
          returnData?.price,
        ) ??
        request.price,

      quantity:
        this.toNumber(
          returnData?.amount ??
            returnData?.quantity,
        ) ??
        request.quantity,

      tradeAmountIdr:
        request.tradeAmountIdr,

      receivedAt:
        Date.now(),

      raw,

      error,

      errorCode,
    };
  }

  private extractOrderId(
    response: ExchangeOrderResponse,
  ): string | undefined {
    const value =
      response.return
        ?.order_id ??
      response.return
        ?.orderId;

    if (
      value ===
        undefined ||
      value ===
        null
    ) {
      return undefined;
    }

    return String(
      value,
    );
  }

  private toNumber(
    value:
      | number
      | string
      | undefined,
  ): number | undefined {
    if (
      value ===
        undefined
    ) {
      return undefined;
    }

    const result =
      typeof value ===
      "number"
        ? value
        : Number(value);

    return Number.isFinite(
      result,
    )
      ? result
      : undefined;
  }

  private asExchangeResponse(
    value: unknown,
  ): ExchangeOrderResponse {
    if (
      !value ||
      typeof value !==
        "object"
    ) {
      return {
        success: false,

        error:
          "Invalid exchange response",
      };
    }

    return value as ExchangeOrderResponse;
  }
}

/* ============================================================
 * Factory
 * ============================================================
 */

export function createIndodaxOrderService(
  client: IndodaxClient,
  options?: IndodaxOrderServiceOptions,
): IndodaxOrderService {
  return new IndodaxOrderService(
    client,
    options,
  );
}

export default IndodaxOrderService;
