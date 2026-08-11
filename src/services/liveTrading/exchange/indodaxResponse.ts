/**
 * ==========================================================
 * AutoIDX — Indodax Response Parser
 * Phase 38 / Batch 2
 * ==========================================================
 */

export interface IndodaxRawResponse {
  success?: number;

  return?: unknown;

  error?: string;

  [key: string]: unknown;
}

export interface ParsedIndodaxResponse<T> {
  success: boolean;

  data?: T;

  error?: string;

  raw: IndodaxRawResponse;
}

export const parseIndodaxResponse =
  <T>(
    raw: unknown,
  ): ParsedIndodaxResponse<T> => {
    if (
      !raw ||
      typeof raw !== "object"
    ) {
      return {
        success: false,
        error:
          "Invalid exchange response.",
        raw: {},
      };
    }

    const response =
      raw as IndodaxRawResponse;

    const success =
      response.success === 1;

    if (!success) {
      return {
        success: false,

        error:
          typeof response.error === "string"
            ? response.error
            : "Exchange rejected request.",

        raw: response,
      };
    }

    return {
      success: true,

      data: response.return as T,

      raw: response,
    };
  };

export const assertIndodaxSuccess =
  <T>(
    parsed: ParsedIndodaxResponse<T>,
  ): T => {
    if (
      !parsed.success ||
      parsed.data === undefined
    ) {
      throw new Error(
        parsed.error ||
          "Indodax request failed.",
      );
    }

    return parsed.data;
  };
