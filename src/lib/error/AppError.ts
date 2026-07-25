/**
==========================================================
AURA Trade OS
Application Error
Version : 0.0.5 Alpha
==========================================================
*/

export interface AppErrorOptions {
  code?: string;
  cause?: unknown;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly cause?: unknown;
  public readonly timestamp: string;

  constructor(
    message: string,
    options: AppErrorOptions = {}
  ) {
    super(message);

    this.name = "AppError";
    this.code = options.code ?? "APP_ERROR";
    this.cause = options.cause;
    this.timestamp = new Date().toISOString();

    Object.setPrototypeOf(this, AppError.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Konversi menjadi object biasa
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      cause:
        this.cause instanceof Error
          ? this.cause.message
          : this.cause,
    };
  }

  /**
   * Factory Helpers
   */

  static config(
    message = "Configuration Error",
    cause?: unknown
  ) {
    return new AppError(message, {
      code: "CONFIG_ERROR",
      cause,
    });
  }

  static firebase(
    message = "Firebase Error",
    cause?: unknown
  ) {
    return new AppError(message, {
      code: "FIREBASE_ERROR",
      cause,
    });
  }

  static ai(
    message = "AI Service Error",
    cause?: unknown
  ) {
    return new AppError(message, {
      code: "AI_SERVICE_ERROR",
      cause,
    });
  }

  static indodax(
    message = "Indodax Service Error",
    cause?: unknown
  ) {
    return new AppError(message, {
      code: "INDODAX_ERROR",
      cause,
    });
  }

  static scanner(
    message = "Scanner Error",
    cause?: unknown
  ) {
    return new AppError(message, {
      code: "SCANNER_ERROR",
      cause,
    });
  }

  static trading(
    message = "Trading Engine Error",
    cause?: unknown
  ) {
    return new AppError(message, {
      code: "TRADING_ENGINE_ERROR",
      cause,
    });
  }

  static validation(
    message = "Validation Error",
    cause?: unknown
  ) {
    return new AppError(message, {
      code: "VALIDATION_ERROR",
      cause,
    });
  }

  static unknown(
    cause?: unknown
  ) {
    return new AppError("Unknown Application Error", {
      code: "UNKNOWN_ERROR",
      cause,
    });
  }
}

export default AppError;
