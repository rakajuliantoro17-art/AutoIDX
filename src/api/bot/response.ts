/**
==========================================================
AutoIDX
Response Helper
Version : 0.0.1 Alpha
==========================================================
*/

import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  status: number;
  timestamp: string;
  version: string;
  message: string;
  data?: T;
  error?: unknown;
}

const VERSION = "0.0.1";

export function successResponse<T>(
  data: T,
  message = "Success",
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      status,
      timestamp: new Date().toISOString(),
      version: VERSION,
      message,
      data,
    },
    {
      status,
    }
  );
}

export function errorResponse(
  message = "Internal Server Error",
  status = 500,
  error?: unknown
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      status,
      timestamp: new Date().toISOString(),
      version: VERSION,
      message,
      error,
    },
    {
      status,
    }
  );
}

export function validationResponse(
  message = "Validation Failed",
  error?: unknown
): NextResponse<ApiResponse> {
  return errorResponse(
    message,
    400,
    error
  );
}

export function unauthorizedResponse(
  message = "Unauthorized"
): NextResponse<ApiResponse> {
  return errorResponse(
    message,
    401
  );
}

export function forbiddenResponse(
  message = "Forbidden"
): NextResponse<ApiResponse> {
  return errorResponse(
    message,
    403
  );
}

export function notFoundResponse(
  message = "Not Found"
): NextResponse<ApiResponse> {
  return errorResponse(
    message,
    404
  );
}
