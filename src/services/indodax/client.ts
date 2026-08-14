/**
 * ============================================================
 * AURA Trade OS
 * Indodax HTTP Client
 * ============================================================
 *
 * Phase 38 - Integration / Fix
 *
 * Responsibility:
 * - HTTP communication with Indodax.
 * - Public REST request.
 * - Private signed REST request.
 * - Timeout handling.
 * - HTTP error normalization.
 * - Response parsing.
 *
 * NOT responsible for:
 * - Strategy
 * - Risk
 * - Portfolio
 * - Buy/Sell decisions
 * - Position management
 *
 * Architecture:
 *
 * Market / Balance / Order Service
 *              ↓
 *        IndodaxClient
 *              ↓
 *        Indodax REST API
 *
 * Private requests:
 *
 * Service
 *   ↓
 * IndodaxAuth
 *   ↓
 * Signed Request
 *   ↓
 * IndodaxClient
 *   ↓
 * Indodax
 * ============================================================
 */

import type {
  IndodaxSignedRequest,
} from "./auth";

export interface IndodaxClientConfig {
  baseUrl?: string;
  publicBaseUrl?: string;
  privateBaseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export interface IndodaxRequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export interface IndodaxHttpResponse<T = unknown> {
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  data: T;
}

export interface IndodaxErrorPayload {
  success?: number;
  error?: string;
  errorCode?: string;
  message?: string;
}

export class IndodaxClientError extends Error {
  public readonly code: string;
  public readonly status?: number;
  public readonly details?: unknown;

  public constructor(
    message: string,
    code = "INDODAX_CLIENT_ERROR",
    status?: number,
    details?: unknown,
  ) {
    super(message);

    this.name =
      "IndodaxClientError";

    this.code = code;
    this.status = status;
    this.details = details;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

export class IndodaxTimeoutError extends IndodaxClientError {
  public constructor(
    message =
      "Indodax request timed out",
  ) {
    super(
      message,
      "INDODAX_TIMEOUT",
    );

    this.name =
      "IndodaxTimeoutError";
  }
}

export class IndodaxHttpError extends IndodaxClientError {
  public constructor(
    message: string,
    status: number,
    details?: unknown,
  ) {
    super(
      message,
      "INDODAX_HTTP_ERROR",
      status,
      details,
    );

    this.name =
      "IndodaxHttpError";
  }
}

export class IndodaxApiError extends IndodaxClientError {
  public constructor(
    message: string,
    details?: unknown,
  ) {
    super(
      message,
      "INDODAX_API_ERROR",
      undefined,
      details,
    );

    this.name =
      "IndodaxApiError";
  }
}

export class IndodaxClient {
  private readonly baseUrl: string;

  private readonly publicBaseUrl: string;

  private readonly privateBaseUrl: string;

  private readonly timeoutMs: number;

  private readonly fetchImpl: typeof fetch;

  public constructor(
    config: IndodaxClientConfig = {},
  ) {
    this.baseUrl =
      this.normalizeUrl(
        config.baseUrl ??
          "https://indodax.com",
      );

    this.publicBaseUrl =
      this.normalizeUrl(
        config.publicBaseUrl ??
          this.baseUrl,
      );

    this.privateBaseUrl =
      this.normalizeUrl(
        config.privateBaseUrl ??
          this.baseUrl,
      );

    this.timeoutMs =
      config.timeoutMs ??
      10_000;

    this.fetchImpl =
      config.fetchImpl ??
      fetch;

    this.validateConfig();
  }

  /**
   * Execute a public GET request.
   *
   * Example:
   *
   * client.publicGet(
   *   "/api/ticker/btcidr"
   * );
   */
  public async publicGet<T = unknown>(
    path: string,
    options: IndodaxRequestOptions = {},
  ): Promise<T> {
    return this.request<T>(
      this.publicBaseUrl,
      path,
      {
        method: "GET",
        headers:
          options.headers,
        signal:
          options.signal,
      },
    );
  }

  /**
   * Execute a public request with an arbitrary
   * HTTP method.
   */
  public async publicRequest
    T = unknown,
  >(
    path: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
      body?: string;
      signal?: AbortSignal;
    } = {},
  ): Promise<T> {
    return this.request<T>(
      this.publicBaseUrl,
      path,
      {
        method:
          options.method ??
          "GET",
        headers:
          options.headers,
        body:
          options.body,
        signal:
          options.signal,
      },
    );
  }

  /**
   * Execute an Indodax private signed request.
   *
   * The request is expected to already contain
   * the body and authentication headers produced
   * by IndodaxAuth.
   */
  public async privateRequest
    T = unknown,
  >(
    request: IndodaxSignedRequest,
    options: IndodaxRequestOptions = {},
  ): Promise<T> {
    if (!request) {
      throw new IndodaxClientError(
        "Signed request is required",
        "SIGNED_REQUEST_REQUIRED",
      );
    }

    if (
      typeof request.body !==
        "string" ||
      request.body.length ===
        0
    ) {
      throw new IndodaxClientError(
        "Signed request body is required",
        "SIGNED_BODY_REQUIRED",
      );
    }

    if (
      !request.headers ||
      typeof request.headers !==
        "object"
    ) {
      throw new IndodaxClientError(
        "Signed request headers are required",
        "SIGNED_HEADERS_REQUIRED",
      );
    }

    const headers =
      this.mergeHeaders(
        request.headers,
        options.headers,
      );

    return this.request<T>(
      this.privateBaseUrl,
      "/tapi",
      {
        method:
          "POST",
        headers,
        body:
          request.body,
        signal:
          options.signal,
      },
    );
  }

  /**
   * Generic request entry point.
   */
  public async request
    T = unknown,
  >(
    baseUrl: string,
    path: string,
    options: {
      method: string;
      headers?: Record<string, string>;
      body?: string;
      signal?: AbortSignal;
    },
  ): Promise<T> {
    const url =
      this.buildUrl(
        baseUrl,
        path,
      );

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        this.timeoutMs,
      );

    const signal =
      this.mergeSignals(
        controller.signal,
        options.signal,
      );

    try {
      const response =
        await this.fetchImpl(
          url,
          {
            method:
              options.method,
            headers:
              this.prepareHeaders(
                options.headers,
              ),
            body:
              options.body,
            signal,
          },
        );

      const data =
        await this.parseResponse(
          response,
        );

      if (!response.ok) {
        throw new IndodaxHttpError(
          this.resolveHttpErrorMessage(
            response.status,
            data,
          ),
          response.status,
          data,
        );
      }

      this.assertApiSuccess(
        data,
      );

      return data as T;
    } catch (error) {
      if (
        error instanceof
        IndodaxClientError
      ) {
        throw error;
      }

      if (
        this.isAbortError(error)
      ) {
        throw new IndodaxTimeoutError();
      }

      throw new IndodaxClientError(
        this.sanitizeError(
          error,
        ),
        "INDODAX_NETWORK_ERROR",
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Convenience method for public ticker.
   */
  public async getTicker
    T = unknown,
  >(
    pair: string,
  ): Promise<T> {
    const normalized =
      this.normalizePair(pair);

    return this.publicGet<T>(
      `/api/ticker/${normalized}`,
    );
  }

  /**
   * Convenience method for public depth/order book.
   */
  public async getDepth
    T = unknown,
  >(
    pair: string,
  ): Promise<T> {
    const normalized =
      this.normalizePair(pair);

    return this.publicGet<T>(
      `/api/depth/${normalized}`,
    );
  }

  /**
   * Convenience method for public trades.
   */
  public async getTrades
    T = unknown,
  >(
    pair: string,
  ): Promise<T> {
    const normalized =
      this.normalizePair(pair);

    return this.publicGet<T>(
      `/api/trades/${normalized}`,
    );
  }

  /**
   * Convenience method for public summaries.
   */
  public async getSummaries
    T = unknown,
  >(): Promise<T> {
    return this.publicGet<T>(
      "/api/summaries",
    );
  }

  /**
   * POST form-encoded request.
   *
   * Useful for private APIs where the signed
   * request body is already prepared.
   */
  public async postForm
    T = unknown,
  >(
    path: string,
    params: Record
      string,
      string | number
    >,
    options: IndodaxRequestOptions = {},
  ): Promise<T> {
    const body =
      new URLSearchParams();

    for (
      const [
        key,
        value,
      ] of Object.entries(params)
    ) {
      body.set(
        key,
        String(value),
      );
    }

    return this.publicRequest<T>(
      path,
      {
        method: "POST",
        headers:
          this.mergeHeaders(
            {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },
            options.headers,
          ),
        body:
          body.toString(),
        signal:
          options.signal,
      },
    );
  }

  /**
   * Create a child client with a different
   * timeout.
   */
  public withTimeout(
    timeoutMs: number,
  ): IndodaxClient {
    return new IndodaxClient({
      baseUrl:
        this.baseUrl,
      publicBaseUrl:
        this.publicBaseUrl,
      privateBaseUrl:
        this.privateBaseUrl,
      timeoutMs,
      fetchImpl:
        this.fetchImpl,
    });
  }

  /**
   * Return
