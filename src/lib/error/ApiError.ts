/**
==========================================================
AURA Trade OS
API Error Class
Version : 0.0.5 Alpha
==========================================================
*/

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    status: number;
  };
  timestamp: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(
    message: string,
    status: number = 500,
    code: string = "INTERNAL_SERVER_ERROR"
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Mengubah error menjadi response JSON standar
   */
  toJSON(): ApiErrorResponse {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        status: this.status,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Factory Methods
   */

  static badRequest(
    message: string = "Bad Request"
  ): ApiError {
    return new ApiError(
      message,
      400,
      "BAD_REQUEST"
    );
  }

  static unauthorized(
    message: string = "Unauthorized"
  ): ApiError {
    return new ApiError(
      message,
      401,
      "UNAUTHORIZED"
    );
  }

  static forbidden(
    message: string = "Forbidden"
  ): ApiError {
    return new ApiError(
      message,
      403,
      "FORBIDDEN"
    );
  }

  static notFound(
    message: string = "Resource Not Found"
  ): ApiError {
    return new ApiError(
      message,
      404,
      "NOT_FOUND"
    );
  }

  static conflict(
    message: string = "Conflict"
  ): ApiError {
    return new ApiError(
      message,
      409,
      "CONFLICT"
    );
  }

  static validation(
    message: string = "Validation Failed"
  ): ApiError {
    return new ApiError(
      message,
      422,
      "VALIDATION_ERROR"
    );
  }

  static rateLimit(
    message: string = "Too Many Requests"
  ): ApiError {
    return new ApiError(
      message,
      429,
      "RATE_LIMIT"
    );
  }

  static internal(
    message: string = "Internal Server Error"
  ): ApiError {
    return new ApiError(
      message,
      500,
      "INTERNAL_SERVER_ERROR"
    );
  }

  static serviceUnavailable(
    message: string = "Service Unavailable"
  ): ApiError {
    return new ApiError(
      message,
      503,
      "SERVICE_UNAVAILABLE"
    );
  }
}

export default ApiError;
