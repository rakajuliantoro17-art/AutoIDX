/**
==========================================================
AURA Trade OS
Rate Limit Error
Version : 0.1.1 Alpha
==========================================================
*/

import {

  ExchangeError,

} from "./ExchangeError";

export interface RateLimitErrorOptions {

  exchange?: string;

  code?: string | number;

  status?: number;

  retryAfter?: number;

  limit?: number;

  remaining?: number;

  resetAt?: number;

  cause?: unknown;

}

export class RateLimitError extends ExchangeError {

  readonly status?: number;

  readonly retryAfter?: number;

  readonly limit?: number;

  readonly remaining?: number;

  readonly resetAt?: number;

  override readonly cause?: unknown;

  constructor(

    message = "Exchange rate limit exceeded.",

    options: RateLimitErrorOptions = {}

  ) {

    super(

      message,

      {

        exchange: options.exchange,

        code: options.code,

        recoverable: true,

        severity: "MEDIUM",

        cause: options.cause,

      }

    );

    this.name = "RateLimitError";

    this.status = options.status;

    this.retryAfter = options.retryAfter;

    this.limit = options.limit;

    this.remaining = options.remaining;

    this.resetAt = options.resetAt;

    this.cause = options.cause;

  }

  /**
   * Indicates whether
   * the request can be
   * retried automatically.
   */
  get shouldRetry(): boolean {

    return this.recoverable;

  }

  /**
   * Remaining wait time
   * in milliseconds.
   */
  get waitTime(): number {

    if (this.retryAfter !== undefined) {

      return this.retryAfter * 1000;

    }

    if (this.resetAt !== undefined) {

      return Math.max(

        0,

        this.resetAt - Date.now()

      );

    }

    return 5_000;

  }

  /**
   * Serialize
   */
  override toJSON() {

    return {

      ...super.toJSON(),

      status: this.status,

      retryAfter: this.retryAfter,

      limit: this.limit,

      remaining: this.remaining,

      resetAt: this.resetAt,

      waitTime: this.waitTime,

    };

  }

}

export default RateLimitError;
