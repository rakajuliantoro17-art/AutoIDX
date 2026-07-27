/**
==========================================================
AURA Trade OS
Base Exchange Error
Version : 0.1.1 Alpha
==========================================================
*/

export type ExchangeErrorSeverity =

  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface ExchangeErrorOptions {

  exchange?: string;

  code?: string | number;

  recoverable?: boolean;

  severity?: ExchangeErrorSeverity;

  cause?: unknown;

}

export class ExchangeError extends Error {

  readonly exchange?: string;

  readonly code?: string | number;

  readonly recoverable: boolean;

  readonly severity: ExchangeErrorSeverity;

  readonly timestamp: number;

  override readonly cause?: unknown;

  constructor(

    message = "Exchange error.",

    options: ExchangeErrorOptions = {}

  ) {

    super(message);

    this.name = "ExchangeError";

    this.exchange = options.exchange;

    this.code = options.code;

    this.recoverable =

      options.recoverable ?? false;

    this.severity =

      options.severity ?? "MEDIUM";

    this.timestamp = Date.now();

    this.cause = options.cause;

    Object.setPrototypeOf(

      this,

      new.target.prototype

    );

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

      recoverable: this.recoverable,

      severity: this.severity,

      timestamp: this.timestamp,

    };

  }

  /**
   * Human readable
   */
  toString(): string {

    return `[${this.name}] ${this.message}`;

  }

}

export default ExchangeError;
