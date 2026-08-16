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
  IndodaxAuthHeaders,
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
  public async publicRequest<
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
  public async privateRequest<
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
        method: "POST",
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
  public async request<
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
  public async getTicker<
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
  public async getDepth<
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
  public async getTrades<
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
  public async getSummaries<
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
  public async postForm<
    T = unknown,
  >(
    path: string,
    params: Record<
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
   * Return configured timeout.
   */
  public getTimeoutMs(): number {
    return this.timeoutMs;
  }

  /**
   * Return configured endpoints without
   * exposing credentials.
   */
  public getEndpoints(): {
    baseUrl: string;
    publicBaseUrl: string;
    privateBaseUrl: string;
  } {
    return {
      baseUrl:
        this.baseUrl,
      publicBaseUrl:
        this.publicBaseUrl,
      privateBaseUrl:
        this.privateBaseUrl,
    };
  }

  /**
   * Parse Indodax response safely.
   */
  private async parseResponse(
    response: Response,
  ): Promise<unknown> {
    const text =
      await response.text();

    if (
      text.trim().length ===
      0
    ) {
      return {};
    }

    const contentType =
      response.headers.get(
        "content-type",
      ) ?? "";

    if (
      contentType.includes(
        "application/json",
      )
    ) {
      try {
        return JSON.parse(
          text,
        ) as unknown;
      } catch {
        throw new IndodaxClientError(
          "Invalid JSON response from Indodax",
          "INVALID_JSON_RESPONSE",
        );
      }
    }

    try {
      return JSON.parse(
        text,
      ) as unknown;
    } catch {
      return text;
    }
  }

  /**
   * Detect Indodax application-level failures.
   */
  private assertApiSuccess(
    data: unknown,
  ): void {
    if (
      !this.isRecord(data)
    ) {
      return;
    }

    const success =
      data.success;

    if (
      success === 0 ||
      success === false
    ) {
      const message =
        this.extractApiError(
          data,
        );

      throw new IndodaxApiError(
        message,
        data,
      );
    }
  }

  /**
   * Extract API error message.
   */
  private extractApiError(
    data: Record<
      string,
      unknown
    >,
  ): string {
    const candidates = [
      data.error,
      data.message,
      data.errorCode,
    ];

    for (
      const candidate of candidates
    ) {
      if (
        typeof candidate ===
        "string" &&
        candidate.trim()
          .length > 0
      ) {
        return candidate;
      }
    }

    return "Indodax API request failed";
  }

  /**
   * Resolve HTTP-level error.
   */
  private resolveHttpErrorMessage(
    status: number,
    data: unknown,
  ): string {
    if (
      this.isRecord(data)
    ) {
      const payload =
        data as IndodaxErrorPayload;

      if (
        typeof payload.error ===
        "string"
      ) {
        return payload.error;
      }

      if (
        typeof payload.message ===
        "string"
      ) {
        return payload.message;
      }
    }

    return `Indodax HTTP request failed with status ${status}`;
  }

  /**
   * Prepare HTTP headers.
   */
  private prepareHeaders(
    headers?: Record<string, string>,
  ): Record<string, string> {
    return {
      Accept:
        "application/json",
      ...headers,
    };
  }

  /**
   * Merge headers without mutating
   * caller-owned objects.
   */
  private mergeHeaders(
    first?: Record<string, string> | IndodaxAuthHeaders,
    second?: Record<string, string>,
  ): Record<string, string> {
    return {
      ...(first ?? {}),
      ...(second ?? {}),
    };
  }

  /**
   * Build absolute URL.
   */
  private buildUrl(
    baseUrl: string,
    path: string,
  ): string {
    if (
      typeof path !==
        "string" ||
      path.trim().length ===
        0
    ) {
      throw new IndodaxClientError(
        "Request path is required",
        "PATH_REQUIRED",
      );
    }

    if (
      /^https?:\/\//i.test(
        path,
      )
    ) {
      return path;
    }

    const normalizedBase =
      baseUrl.replace(
        /\/+$/,
        "",
      );

    const normalizedPath =
      path.startsWith("/")
        ? path
        : `/${path}`;

    return `${normalizedBase}${normalizedPath}`;
  }

  /**
   * Normalize URL configuration.
   */
  private normalizeUrl(
    value: string,
  ): string {
    return value.replace(
      /\/+$/,
      "",
    );
  }

  /**
   * Normalize trading pair.
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
      throw new IndodaxClientError(
        "Trading pair is required",
        "PAIR_REQUIRED",
      );
    }

    return pair
      .trim()
      .toLowerCase();
  }

  /**
   * Merge two AbortSignals.
   */
  private mergeSignals(
    primary: AbortSignal,
    secondary?: AbortSignal,
  ): AbortSignal {
    if (!secondary) {
      return primary;
    }

    if (
      secondary.aborted
    ) {
      primary.dispatchEvent(
        new Event(
          "abort",
        ),
      );

      return secondary;
    }

    const controller =
      new AbortController();

    const abort =
      () =>
        controller.abort();

    primary.addEventListener(
      "abort",
      abort,
      {
        once: true,
      },
    );

    secondary.addEventListener(
      "abort",
      abort,
      {
        once: true,
      },
    );

    return controller.signal;
  }

  /**
   * Detect AbortError without relying
   * on a DOM-specific error class.
   */
  private isAbortError(
    error: unknown,
  ): boolean {
    return (
      this.isRecord(error) &&
      error.name ===
        "AbortError"
    );
  }

  /**
   * Sanitize unknown errors.
   */
  private sanitizeError(
    error: unknown,
  ): string {
    if (
      error instanceof Error
    ) {
      return error.message;
    }

    if (
      typeof error ===
      "string"
    ) {
      return error;
    }

    return "Unknown Indodax network error";
  }

  /**
   * Validate client configuration.
   */
  private validateConfig(): void {
    if (
      !this.baseUrl
    ) {
      throw new IndodaxClientError(
        "Indodax base URL is required",
        "BASE_URL_REQUIRED",
      );
    }

    if (
      !this.publicBaseUrl
    ) {
      throw new IndodaxClientError(
        "Indodax public base URL is required",
        "PUBLIC_BASE_URL_REQUIRED",
      );
    }

    if (
      !this.privateBaseUrl
    ) {
      throw new IndodaxClientError(
        "Indodax private base URL is required",
        "PRIVATE_BASE_URL_REQUIRED",
      );
    }

    if (
      !Number.isFinite(
        this.timeoutMs,
      ) ||
      this.timeoutMs <= 0
    ) {
      throw new IndodaxClientError(
        "Timeout must be a positive finite number",
        "INVALID_TIMEOUT",
      );
    }
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
 * Default factory.
 */
export function createIndodaxClient(
  config?: IndodaxClientConfig,
): IndodaxClient {
  return new IndodaxClient(
    config,
  );
}

export default IndodaxClient;
