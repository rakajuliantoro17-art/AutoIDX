/**
==========================================================
AURA Trade OS
API Request Validator
Version : 0.0.5 Alpha
==========================================================
*/

import { ApiError } from "@/lib/error/ApiError";

export interface ApiValidationOptions {
  methods?: string[];
  requireBody?: boolean;
  requireAuthorization?: boolean;
}

export class ApiValidator {

  /**
   * Validasi HTTP Method
   */
  static validateMethod(
    method: string,
    allowedMethods: string[]
  ): void {

    if (!allowedMethods.includes(method.toUpperCase())) {
      throw new ApiError(
        `Method ${method} is not allowed.`,
        405,
        "METHOD_NOT_ALLOWED"
      );
    }

  }

  /**
   * Validasi Authorization Header
   */
  static validateAuthorization(
    request: Request
  ): string {

    const authHeader =
      request.headers.get("authorization");

    if (!authHeader) {
      throw ApiError.unauthorized(
        "Authorization header is required."
      );
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized(
        "Invalid authorization format."
      );
    }

    return authHeader.substring(7).trim();

  }

  /**
   * Validasi JSON Body
   */
  static async validateJsonBody<T>(
    request: Request
  ): Promise<T> {

    try {

      return await request.json();

    } catch {

      throw ApiError.badRequest(
        "Invalid JSON request body."
      );

    }

  }

  /**
   * Validasi Query Parameter
   */
  static getQueryParam(
    request: Request,
    key: string,
    required = false
  ): string | null {

    const url = new URL(request.url);

    const value = url.searchParams.get(key);

    if (required && (!value || value.trim() === "")) {
      throw ApiError.badRequest(
        `Query parameter "${key}" is required.`
      );
    }

    return value;

  }

  /**
   * Validasi seluruh request
   */
  static async validateRequest(
    request: Request,
    options: ApiValidationOptions = {}
  ): Promise<unknown> {

    if (options.methods) {
      this.validateMethod(
        request.method,
        options.methods
      );
    }

    if (options.requireAuthorization) {
      this.validateAuthorization(request);
    }

    if (options.requireBody) {
      return await this.validateJsonBody(request);
    }

    return null;

  }

}

export default ApiValidator;
