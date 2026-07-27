/**
==========================================================
AURA Trade OS
Network Error
Version : 0.1.1 Alpha
==========================================================
*/

import {

  ExchangeError,

} from "./ExchangeError";

export interface NetworkErrorOptions {

  exchange?: string;

  code?: string | number;

  status?: number;

  retryAfter?: number;

  cause?: unknown;

}

export class NetworkError extends ExchangeError {

  readonly status?: number;

  readonly retryAfter?: number;

  override readonly cause?: unknown;

  constructor(

    message = "Network connection failed.",

    options: NetworkErrorOptions = {}

  ) {

    super(

      message,

      {

        exchange: options.exchange,

        code: options.code,

        recoverable: true,

        severity: "HIGH",

        cause: options.cause,

      }

    );

    this.name = "NetworkError";

    this.status = options.status;

    this.retryAfter = options.retryAfter;

    this.cause = options.cause;

  }

  /**
   * Indicates whether
   * automatic retry
   * should be attempted.
   */
  get shouldRetry(): boolean {

    return this.recoverable;

  }

  /**
   * Serialize
   */
  override toJSON() {

    return {

      ...super.toJSON(),

      status: this.status,

      retryAfter: this.retryAfter,

    };

  }

}

export default NetworkError;
