/**
==========================================================
AURA Trade OS
API Response Helper
Version : 0.0.5 Alpha
==========================================================
*/

import { NextResponse } from "next/server";

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export class ResponseHelper {

  /**
   * Success Response
   */
  static success<T>(
    data: T,
    status: number = 200
  ) {

    return NextResponse.json<ApiSuccessResponse<T>>(
      {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      },
      {
        status,
      }
    );

  }

  /**
   * Error Response
   */
  static error(
    message: string,
    status: number = 500,
    code: string = "INTERNAL_SERVER_ERROR"
  ) {

    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        error: {
          code,
          message,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status,
      }
    );

  }

  /**
   * Created (201)
   */
  static created<T>(data: T) {

    return this.success(data, 201);

  }

  /**
   * No Content (204)
   */
  static noContent() {

    return new NextResponse(null, {
      status: 204,
    });

  }

  /**
   * Bad Request (400)
   */
  static badRequest(
    message = "Bad Request"
  ) {

    return this.error(
      message,
      400,
      "BAD_REQUEST"
    );

  }

  /**
   * Unauthorized (401)
   */
  static unauthorized(
    message = "Unauthorized"
  ) {

    return this.error(
      message,
      401,
      "UNAUTHORIZED"
    );

  }

  /**
   * Forbidden (403)
   */
  static forbidden(
    message = "Forbidden"
  ) {

    return this.error(
      message,
      403,
      "FORBIDDEN"
    );

  }

  /**
   * Not Found (404)
   */
  static notFound(
    message = "Resource Not Found"
  ) {

    return this.error(
      message,
      404,
      "NOT_FOUND"
    );

  }

  /**
   * Validation Error (422)
   */
  static validation(
    message = "Validation Failed"
  ) {

    return this.error(
      message,
      422,
      "VALIDATION_ERROR"
    );

  }

  /**
   * Internal Server Error (500)
   */
  static internal(
    message = "Internal Server Error"
  ) {

    return this.error(
      message,
      500,
      "INTERNAL_SERVER_ERROR"
    );

  }

  /**
   * Service Unavailable (503)
   */
  static unavailable(
    message = "Service Unavailable"
  ) {

    return this.error(
      message,
      503,
      "SERVICE_UNAVAILABLE"
    );

  }

}

export default ResponseHelper;
