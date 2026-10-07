/**
 * AURA Trade OS -- Legacy Error Adapter
 *
 * Repo ini punya beberapa hierarki error paralel (services/exchange/errors,
 * services/indodax/*, lib/error/AppError, src/errors, error bawaan Node
 * seperti ETIMEDOUT). Penyatuan dilakukan di SATU titik: error apa pun yang
 * lewat normalizeAURAError() dipetakan ke ErrorCode terpusat, sehingga
 * handleError() mendapat kategori + retryable yang benar tanpa perlu
 * mengubah puluhan tempat yang melempar error lama.
 *
 * Sengaja berbasis NAMA/BENTUK (duck typing), bukan `instanceof`:
 * - tidak meng-import kelas lama (tidak ada dependensi melingkar),
 * - tetap bekerja lintas modul/bundle,
 * - stateless dan murni, aman di Vercel (serverless) maupun server fisik.
 *
 * Mengembalikan undefined bila tidak dikenali (perilaku lama tidak berubah).
 */

import type { ErrorCode } from "./errorCode";

/** Kode error Node/undici (error.code atau error.cause.code) -> ErrorCode. */
const NODE_NETWORK_CODES: Readonly<Record<string, ErrorCode>> = {
  ETIMEDOUT: "NETWORK_TIMEOUT",
  UND_ERR_CONNECT_TIMEOUT: "NETWORK_TIMEOUT",
  UND_ERR_HEADERS_TIMEOUT: "NETWORK_TIMEOUT",
  ECONNRESET: "NETWORK_CONNECTION_RESET",
  UND_ERR_SOCKET: "NETWORK_CONNECTION_RESET",
  ECONNREFUSED: "NETWORK_CONNECTION_FAILED",
  EPIPE: "NETWORK_CONNECTION_FAILED",
  ENOTFOUND: "NETWORK_DNS_FAILED",
  EAI_AGAIN: "NETWORK_DNS_FAILED",
};

/** error.name -> ErrorCode untuk kelas error lama di repo ini. */
const NAME_TO_CODE: Readonly<Record<string, ErrorCode>> = {
  // services/exchange/errors + services/indodax/*
  RateLimitError: "EXCHANGE_RATE_LIMIT",
  IndodaxRateLimitError: "EXCHANGE_RATE_LIMIT",
  AuthenticationError: "EXCHANGE_AUTHENTICATION_FAILED",
  IndodaxAuthError: "EXCHANGE_AUTHENTICATION_FAILED",
  NetworkError: "NETWORK_ERROR",
  ExchangeError: "EXCHANGE_ERROR",
  IndodaxClientError: "EXCHANGE_ERROR",
  IndodaxPublicApiError: "EXCHANGE_ERROR",
  IndodaxDepthError: "EXCHANGE_ERROR",
  IndodaxSummariesError: "EXCHANGE_ERROR",
  IndodaxTradesError: "EXCHANGE_ERROR",
  IndodaxBalanceError: "EXCHANGE_ERROR",
  // fetch dibatalkan oleh AbortController / AbortSignal.timeout()
  AbortError: "NETWORK_TIMEOUT",
  TimeoutError: "NETWORK_TIMEOUT",
  // validasi
  ValidationError: "VALIDATION_ERROR",
};

/** lib/error/AppError.code -> ErrorCode. */
const APP_ERROR_CODES: Readonly<Record<string, ErrorCode>> = {
  CONFIG_ERROR: "CONFIGURATION_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INDODAX_ERROR: "EXCHANGE_ERROR",
  FIREBASE_ERROR: "STORAGE_ERROR",
};

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * Tentukan ErrorCode terpusat untuk error lama/native, atau undefined
 * bila tidak dikenali.
 */
export function inferLegacyErrorCode(error: Error): ErrorCode | undefined {
  const record = error as unknown as Record<string, unknown>;

  // 1. Kode jaringan Node, langsung atau pada error.cause (undici fetch).
  const directCode = readString(record.code);
  const cause = record.cause as Record<string, unknown> | undefined;
  const causeCode = cause ? readString(cause.code) : undefined;
  const networkCode =
    (directCode && NODE_NETWORK_CODES[directCode]) ||
    (causeCode && NODE_NETWORK_CODES[causeCode]);
  if (networkCode) {
    return networkCode;
  }

  // 2. Nama kelas lama.
  const byName = NAME_TO_CODE[error.name];
  if (byName) {
    // NetworkError berpesan timeout -> kode yang lebih spesifik.
    if (byName === "NETWORK_ERROR" && /timed? ?out|timeout/i.test(error.message)) {
      return "NETWORK_TIMEOUT";
    }
    return byName;
  }

  // 3. AppError (lib/error) membawa kode string sendiri.
  if (error.name === "AppError" && directCode) {
    return APP_ERROR_CODES[directCode];
  }

  return undefined;
}
