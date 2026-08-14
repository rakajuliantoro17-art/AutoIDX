/**
 * ============================================================
 * AURA Trade OS
 * Indodax Authentication
 * ============================================================
 *
 * Phase 38 - Integration / Fix
 *
 * Responsibility:
 * - Menyimpan credential reference secara aman.
 * - Membuat signature HMAC-SHA512 untuk Private REST API.
 * - Membuat authenticated request headers.
 * - Menyediakan nonce yang monotonically increasing.
 *
 * NOT responsible for:
 * - Trading
 * - Risk validation
 * - Order execution
 * - Portfolio management
 * - Strategy
 *
 * Indodax Private REST:
 *
 * POST https://indodax.com/tapi
 *
 * Headers:
 *   Key  = API Key
 *   Sign = HMAC-SHA512(request body, API Secret)
 *
 * IMPORTANT:
 * API secret tidak pernah diekspos melalui public methods,
 * log, error message, atau serialized object.
 * ============================================================
 */

import {
  createHmac,
} from "node:crypto";

export interface IndodaxAuthConfig {
  apiKey: string;
  apiSecret: string;
}

export interface IndodaxAuthHeaders {
  Key: string;
  Sign: string;
}

export interface IndodaxSignedRequest {
  body: string;
  headers: IndodaxAuthHeaders;
}

export interface IndodaxAuthRequest {
  method: string;
  params?: Record<
    string,
    string | number | boolean
  >;
}

export class IndodaxAuthError extends Error {
  public readonly code: string;

  public constructor(
    message: string,
    code = "INDODAX_AUTH_ERROR",
  ) {
    super(message);

    this.name = "IndodaxAuthError";
    this.code = code;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

export class IndodaxAuth {
  private readonly apiKey: string;

  private readonly apiSecret: string;

  /**
   * Last generated nonce.
   *
   * Nonce must always increase even when multiple
   * authenticated requests happen inside the same
   * millisecond.
   */
  private lastNonce = 0;

  public constructor(
    config: IndodaxAuthConfig,
  ) {
    this.validateConfig(config);

    this.apiKey = config.apiKey.trim();

    this.apiSecret =
      config.apiSecret.trim();
  }

  /**
   * Return the API key.
   *
   * API key is not the secret and may be used
   * for the request header.
   */
  public getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Generate a monotonically increasing nonce.
   *
   * Indodax private requests require a nonce
   * parameter.
   */
  public createNonce(): number {
    const now = Date.now();

    if (now <= this.lastNonce) {
      this.lastNonce =
        this.lastNonce + 1;
    } else {
      this.lastNonce = now;
    }

    return this.lastNonce;
  }

  /**
   * Create HMAC-SHA512 signature.
   *
   * The signature is calculated from the
   * URL-encoded request body.
   */
  public sign(
    body: string,
  ): string {
    if (!body) {
      throw new IndodaxAuthError(
        "Cannot sign an empty request body",
        "EMPTY_REQUEST_BODY",
      );
    }

    return createHmac(
      "sha512",
      this.apiSecret,
    )
      .update(body, "utf8")
      .digest("hex");
  }

  /**
   * Build an authenticated request.
   *
   * The returned object contains only:
   * - encoded body
   * - API key
   * - generated signature
   *
   * API secret is never returned.
   */
  public createSignedRequest(
    request: IndodaxAuthRequest,
  ): IndodaxSignedRequest {
    const body =
      this.serializeRequest(request);

    const signature =
      this.sign(body);

    return {
      body,

      headers: {
        Key: this.apiKey,
        Sign: signature,
      },
    };
  }

  /**
   * Serialize request parameters.
   *
   * Method is always included.
   * Nonce is automatically generated.
   */
  public serializeRequest(
    request: IndodaxAuthRequest,
  ): string {
    if (
      !request.method ||
      !request.method.trim()
    ) {
      throw new IndodaxAuthError(
        "Indodax method is required",
        "METHOD_REQUIRED",
      );
    }

    const params =
      request.params ?? {};

    const bodyParams =
      new URLSearchParams();

    bodyParams.set(
      "method",
      request.method.trim(),
    );

    bodyParams.set(
      "nonce",
      String(this.createNonce()),
    );

    for (
      const [key, value] of Object.entries(
        params,
      )
    ) {
      if (
        key === "method" ||
        key === "nonce"
      ) {
        continue;
      }

      if (
        value === undefined ||
        value === null
      ) {
        continue;
      }

      bodyParams.set(
        key,
        String(value),
      );
    }

    return bodyParams.toString();
  }

  /**
   * Create only the authentication headers
   * for an already serialized body.
   */
  public createHeaders(
    body: string,
  ): IndodaxAuthHeaders {
    return {
      Key: this.apiKey,
      Sign: this.sign(body),
    };
  }

  /**
   * Sanitize an error so API secrets can never
   * accidentally appear in logs.
   */
  public sanitizeError(
    error: unknown,
  ): Error {
    if (error instanceof Error) {
      const sanitizedMessage =
        error.message
          .replace(
            this.apiSecret,
            "[REDACTED]",
          )
          .replace(
            this.apiKey,
            "[REDACTED]",
          );

      return new Error(
        sanitizedMessage,
        {
          cause: error,
        },
      );
    }

    return new Error(
      "Unknown Indodax authentication error",
    );
  }

  /**
   * Check whether authentication credentials
   * are configured.
   */
  public isConfigured(): boolean {
    return (
      this.apiKey.length > 0 &&
      this.apiSecret.length > 0
    );
  }

  /**
   * Validate configuration.
   */
  private validateConfig(
    config: IndodaxAuthConfig,
  ): void {
    if (!config) {
      throw new IndodaxAuthError(
        "Indodax authentication config is required",
        "CONFIG_REQUIRED",
      );
    }

    if (
      typeof config.apiKey !==
        "string" ||
      config.apiKey.trim()
        .length === 0
    ) {
      throw new IndodaxAuthError(
        "Indodax API key is required",
        "API_KEY_REQUIRED",
      );
    }

    if (
      typeof config.apiSecret !==
        "string" ||
      config.apiSecret.trim()
        .length === 0
    ) {
      throw new IndodaxAuthError(
        "Indodax API secret is required",
        "API_SECRET_REQUIRED",
      );
    }
  }
}

/**
 * Factory helper.
 */
export function createIndodaxAuth(
  config: IndodaxAuthConfig,
): IndodaxAuth {
  return new IndodaxAuth(config);
}

export default IndodaxAuth;
