/**
==========================================================
AURA Trade OS
Authentication Error
Version : 0.1.1 Alpha
==========================================================
*/

import { ExchangeError } from "./ExchangeError";

export interface AuthenticationErrorOptions {

  exchange?: string;

  code?: string | number;

  cause?: unknown;

}

export class AuthenticationError extends ExchangeError {

  readonly exchange?: string;

  readonly code?: string | number;

  override readonly cause?: unknown;

  constructor(

    message = "Exchange authentication failed.",

    options: AuthenticationErrorOptions = {}

  ) {

    super(message);

    this.name = "AuthenticationError";

    this.exchange = options.exchange;

    this.code = options.code;

    this.cause = options.cause;

  }

  /**
   * True if caused by
   * invalid API credentials.
   */
  get isInvalidCredential(): boolean {

    return true;

  }

  /**
   * Serialize error
   */
  toJSON() {

    return {

      name: this.name,

      message: this.message,

      exchange: this.exchange,

      code: this.code,

      timestamp: this.timestamp,

    };

  }

}

export default AuthenticationError;
