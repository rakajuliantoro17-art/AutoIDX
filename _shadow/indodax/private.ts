/**
 * ============================================================
 * AURA Trade OS
 * INDODAX Private API Service
 * ============================================================
 *
 * Phase 38 - Integration / Fix
 *
 * Responsibility:
 * - Execute authenticated INDODAX private requests
 * - Generate request nonce
 * - Delegate authentication/signing to auth service
 * - Route requests through IndodaxClient
 * - Normalize private API responses
 *
 * This module MUST NOT:
 * - generate trading signals
 * - decide BUY / SELL
 * - perform risk calculations
 * - manage portfolio
 * - bypass Risk Engine
 * - contain strategy logic
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
 * IndodaxPrivateService
 *    ↓
 * IndodaxClient
 *    ↓
 * INDODAX
 * ============================================================
 */

import type {
  IndodaxClient,
} from "./client";

import type {
  IndodaxAuth,
} from "./auth";

/* ============================================================
 * Types
 * ============================================================
 */

export type IndodaxPrivateMethod =
  | "getInfo"
  | "transHistory"
  | "tradeHistory"
  | "openOrders"
  | "orderHistory"
  | "getOrder"
  | "trade"
  | "cancelOrder"
  | string;

export interface IndodaxPrivateRequest {
  method: IndodaxPrivateMethod;

  params?: Record<
    string,
    unknown
  >;

  /**
   * Optional request correlation ID.
   */
  requestId?: string;

  /**
   * Optional metadata used for tracing.
   */
  metadata?: Record<
    string,
    unknown
  >;
}

export interface IndodaxPrivateResponse<
  T = unknown,
> {
  success: boolean;

  method: string;

  data?: T;

  error?: string;

  errorCode?: string | number;

  receivedAt: number;

  requestId?: string;

  raw?: unknown;
}

export interface IndodaxPrivateServiceOptions {
  enabled?: boolean;

  /**
   * Maximum number of requests allowed
   * by this service before the caller must
   * rely on the exchange limiter.
   *
   * This is NOT a replacement for rate limiting.
   */
  maxRequestTimeoutMs?: number;
}

/* ============================================================
 * Internal Exchange Response
 * ============================================================
 */

interface IndodaxExchangeResponse {
  success?: boolean;

  return?: unknown;

  error?: string;

  error_code?: string | number;

  [key: string]: unknown;
}

/* ============================================================
 * IndodaxPrivateService
 * ============================================================
 */

export class IndodaxPrivateService {
  private readonly client: IndodaxClient;

  private readonly auth?: IndodaxAuth;

  private readonly options:
    Required<
      IndodaxPrivateServiceOptions
    >;

  public constructor(
    client: IndodaxClient,
    auth?: IndodaxAuth,
    options: IndodaxPrivateServiceOptions = {},
  ) {
    if (!client) {
      throw new Error(
        "IndodaxPrivateService requires an IndodaxClient",
      );
    }

    this.client = client;

    this.auth = auth;

    this.options = {
      enabled:
        options.enabled ?? true,

      maxRequestTimeoutMs:
        options.maxRequestTimeoutMs ??
        30_000,
    };
  }

  /* ==========================================================
   * Generic Private Request
   * ==========================================================
   */

  public async request<
    T = unknown,
  >(
    request: IndodaxPrivateRequest,
  ): Promise<
    IndodaxPrivateResponse<T>
  > {
    this.validateRequest(
      request,
    );

    if (
      !this.options.enabled
    ) {
      return {
        success: false,

        method:
          request.method,

        receivedAt:
          Date.now(),

        requestId:
          request.requestId,

        error:
          "INDODAX private service is disabled",

        errorCode:
          "PRIVATE_SERVICE_DISABLED",
      };
    }

    try {
      const raw =
        await this.executeWithTimeout(
          request,
        );

      return this.normalizeResponse<T>(
        request,
        raw,
      );
    } catch (error: unknown) {
      return {
        success: false,

        method:
          request.method,

        receivedAt:
          Date.now(),

        requestId:
          request.requestId,

        error:
          this.getErrorMessage(
            error,
          ),

        errorCode:
          this.getErrorCode(
            error,
          ),
      };
    }
  }

  /* ==========================================================
   * Account Information
   * ==========================================================
   */

  public async getInfo<
    T = unknown,
  >(
    requestId?: string,
  ): Promise<
    IndodaxPrivateResponse<T>
  > {
    return this.request<T>({
      method:
        "getInfo",

      requestId,
    });
  }

  /* ==========================================================
   * Transaction History
   * ==========================================================
   */

  public async getTransactionHistory<
    T = unknown,
  >(
    params: Record<
      string,
      unknown
    > = {},
    requestId?: string,
  ): Promise<
    IndodaxPrivateResponse<T>
  > {
    return this.request<T>({
      method:
        "transHistory",

      params,

      requestId,
    });
  }

  /* ==========================================================
   * Trade History
   * ==========================================================
   */

  public async getTradeHistory<
    T = unknown,
  >(
    pair: string,
    params: Record<
      string,
      unknown
    > = {},
    requestId?: string,
  ): Promise<
    IndodaxPrivateResponse<T>
  > {
    this.validatePair(
      pair,
    );

    return this.request<T>({
      method:
        "tradeHistory",

      params: {
        pair,
        ...params,
      },

      requestId,
    });
  }

  /* ==========================================================
   * Open Orders
   * ==========================================================
   */

  public async getOpenOrders<
    T = unknown,
  >(
    pair: string,
    requestId?: string,
  ): Promise<
    IndodaxPrivateResponse<T>
  > {
    this.validatePair(
      pair,
    );

    return this.request<T>({
      method:
        "openOrders",

      params: {
        pair,
      },

      requestId,
    });
  }

  /* ==========================================================
   * Order History
   * ==========================================================
   */

  public async getOrderHistory<
    T = unknown,
  >(
    pair: string,
    requestId?: string,
  ): Promise<
    IndodaxPrivateResponse<T>
  > {
    this.validatePair(
      pair,
    );

    return this.request<T>({
      method:
        "orderHistory",

      params: {
        pair,
      },

      requestId,
    });
  }

  /* ==========================================================
   * Get Order
   * ==========================================================
   */

  public async getOrder<
    T = unknown,
  >(
    orderId: string,
    pair: string,
    requestId?: string,
  ): Promise<
    IndodaxPrivateResponse<T>
  > {
    this.validateOrderId(
      orderId,
    );

    this.validatePair(
      pair,
    );

    return this.request<T>({
      method:
        "getOrder",

      params: {
        order_id:
          orderId,

        pair,
      },

      requestId,
    });
  }

  /* ==========================================================
   * Trade
   * ==========================================================
   */

  public async trade<
    T = unknown,
  >(
    params: Record<
      string,
      unknown
    >,
    requestId?: string,
  ): Promise<
    IndodaxPrivateResponse<T>
  > {
    if (
      !params ||
      typeof params !==
        "object"
    ) {
      throw new TypeError(
        "Trade parameters are required",
      );
    }

    return this.request<T>({
      method:
        "trade",

      params,

      requestId,
    });
  }

  /* ==========================================================
   * Cancel Order
   * ==========================================================
   */

  public async cancelOrder<
    T = unknown,
  >(
    pair: string,
    orderId: string,
    requestId?: string,
  ): Promise<
    IndodaxPrivateResponse<T>
  > {
    this.validatePair(
      pair,
    );

    this.validateOrderId(
      orderId,
    );

    return this.request<T>({
      method:
        "cancelOrder",

      params: {
        pair,

        order_id:
          orderId,
      },

      requestId,
    });
  }

  /* ==========================================================
   * Execute
   * ==========================================================
   */

  private async executeWithTimeout(
    request: IndodaxPrivateRequest,
  ): Promise<unknown> {
    const timeout =
      this.options
        .maxRequestTimeoutMs;

    return Promise.race([
      this.executePrivateRequest(
        request,
      ),

      new Promise<never>(
        (
          _resolve,
          reject,
        ) => {
          setTimeout(
            () => {
              const error =
                new Error(
                  `INDODAX private request timeout after ${timeout}ms`,
                );

              (
                error as Error & {
                  code?: string;
                }
              ).code =
                "PRIVATE_REQUEST_TIMEOUT";

              reject(error);
            },
            timeout,
          );
        },
      ),
    ]);
  }

  /* ==========================================================
   * Client Adapter
   * ==========================================================
   */

  private async executePrivateRequest(
    request: IndodaxPrivateRequest,
  ): Promise<unknown> {
    /**
     * Keep authentication responsibility
     * outside this module.
     *
     * The client is the canonical transport
     * layer.
     */

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

        postPrivate?: (
          method: string,
          params?: Record<
            string,
            unknown
          >,
        ) => Promise<unknown>;

        callPrivate?: (
          method: string,
          params?: Record<
            string,
            unknown
          >,
        ) => Promise<unknown>;
      };

    const params =
      this.buildPrivateParams(
        request,
      );

    if (
      typeof client.privateRequest ===
      "function"
    ) {
      return client.privateRequest(
        request.method,
        params,
      );
    }

    if (
      typeof client.requestPrivate ===
      "function"
    ) {
      return client.requestPrivate(
        request.method,
        params,
      );
    }

    if (
      typeof client.postPrivate ===
      "function"
    ) {
      return client.postPrivate(
        request.method,
        params,
      );
    }

    if (
      typeof client.callPrivate ===
      "function"
    ) {
      return client.callPrivate(
        request.method,
        params,
      );
    }

    /**
     * Compatibility fallback:
     *
     * Some versions of the client may expose
     * an authenticated request method under
     * a generic "request" name.
     */
    const genericClient =
      this.client as unknown as {
        request?: (
          method: string,
          params?: Record<
            string,
            unknown
          >,
        ) => Promise<unknown>;
      };

    if (
      typeof genericClient.request ===
      "function"
    ) {
      return genericClient.request(
        request.method,
        params,
      );
    }

    throw new Error(
      "IndodaxClient does not expose a supported private request method",
    );
  }

  /* ==========================================================
   * Authentication Parameter Preparation
   * ==========================================================
   */

  private buildPrivateParams(
    request: IndodaxPrivateRequest,
  ): Record<
    string,
    unknown
  > {
    const params: Record<
      string,
      unknown
    > = {
      ...(request.params ??
        {}),
    };

    /**
     * Authentication/signature should normally
     * be generated by IndodaxAuth or IndodaxClient.
     *
     * We only add nonce here when the caller
     * did not already provide one and when
     * the authentication service exposes
     * a nonce generator.
     */
    if (
      params.nonce ===
      undefined
    ) {
      const auth =
        this.auth as unknown as {
          generateNonce?: () =>
            | number
            | string;

          createNonce?: () =>
            | number
            | string;
        };

      if (
        typeof auth?.generateNonce ===
        "function"
      ) {
        params.nonce =
          auth.generateNonce();
      } else if (
        typeof auth?.createNonce ===
        "function"
      ) {
        params.nonce =
          auth.createNonce();
      } else {
        /**
         * Millisecond timestamp is used only
         * as a final compatibility fallback.
         *
         * If auth.ts already manages nonce,
         * that value should take precedence.
         */
        params.nonce =
          Date.now();
      }
    }

    return params;
  }

  /* ==========================================================
   * Response Normalization
   * ==========================================================
   */

  private normalizeResponse<
    T,
  >(
    request: IndodaxPrivateRequest,
    raw: unknown,
  ): IndodaxPrivateResponse<T> {
    const response =
      this.asExchangeResponse(
        raw,
      );

    const success =
      response.success ===
      true;

    return {
      success,

      method:
        request.method,

      data:
        response.return as
          | T
          | undefined,

      error:
        typeof response.error ===
        "string"
          ? response.error
          : undefined,

      errorCode:
        response.error_code,

      receivedAt:
        Date.now(),

      requestId:
        request.requestId,

      raw,
    };
  }

  private asExchangeResponse(
    value: unknown,
  ): IndodaxExchangeResponse {
    if (
      !value ||
      typeof value !==
        "object"
    ) {
      return {
        success: false,

        error:
          "Invalid INDODAX private response",
      };
    }

    return value as IndodaxExchangeResponse;
  }

  /* ==========================================================
   * Validation
   * ==========================================================
   */

  private validateRequest(
    request: IndodaxPrivateRequest,
  ): void {
    if (
      !request ||
      typeof request !==
        "object"
    ) {
      throw new TypeError(
        "Private request is required",
      );
    }

    if (
      typeof request.method !==
        "string" ||
      request.method.trim()
        .length === 0
    ) {
      throw new TypeError(
        "Private API method is required",
      );
    }

    if (
      request.params !==
        undefined &&
      (
        typeof request.params !==
          "object" ||
        request.params ===
          null ||
        Array.isArray(
          request.params,
        )
      )
    ) {
      throw new TypeError(
        "Private API params must be an object",
      );
    }
  }

  private validatePair(
    pair: string,
  ): void {
    if (
      typeof pair !==
        "string" ||
      pair.trim()
        .length === 0
    ) {
      throw new TypeError(
        "INDODAX pair is required",
      );
    }
  }

  private validateOrderId(
    orderId: string,
  ): void {
    if (
      typeof orderId !==
        "string" ||
      orderId.trim()
        .length === 0
    ) {
      throw new TypeError(
        "INDODAX order ID is required",
      );
    }
  }

  /* ==========================================================
   * Error Helpers
   * ==========================================================
   */

  private getErrorMessage(
    error: unknown,
  ): string {
    if (
      error instanceof
      Error
    ) {
      return error.message;
    }

    if (
      typeof error ===
      "string"
    ) {
      return error;
    }

    try {
      return JSON.stringify(
        error,
      );
    } catch {
      return "Unknown INDODAX private API error";
    }
  }

  private getErrorCode(
    error: unknown,
  ):
    | string
    | number
    | undefined {
    if (
      !error ||
      typeof error !==
        "object"
    ) {
      return undefined;
    }

    const value =
      (
        error as {
          code?: string | number;

          errorCode?:
            | string
            | number;
        }
      );

    return (
      value.code ??
      value.errorCode
    );
  }
}

/* ============================================================
 * Factory
 * ============================================================
 */

export function createIndodaxPrivateService(
  client: IndodaxClient,
  auth?: IndodaxAuth,
  options?: IndodaxPrivateServiceOptions,
): IndodaxPrivateService {
  return new IndodaxPrivateService(
    client,
    auth,
    options,
  );
}

export default IndodaxPrivateService;
