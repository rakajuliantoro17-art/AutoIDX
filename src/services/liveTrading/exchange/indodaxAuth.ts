/**
 * ==========================================================
 * AutoIDX — Indodax Authentication Configuration
 * Phase 38 / Batch 2
 * ==========================================================
 *
 * SECURITY:
 * - API credentials MUST come from environment variables.
 * - NEVER commit API_KEY / API_SECRET.
 * - NEVER log API_SECRET.
 * ==========================================================
 */

export interface IndodaxCredentials {
  apiKey: string;
  apiSecret: string;
}

export interface IndodaxAuthConfig {
  apiUrl: string;
  credentials: IndodaxCredentials;
  timeoutMs: number;
}

const DEFAULT_API_URL =
  "https://indodax.com/tapi";

const DEFAULT_TIMEOUT_MS = 10_000;

const readRequired = (
  name: string,
): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`,
    );
  }

  return value;
};

const readTimeout = (): number => {
  const raw =
    process.env.AUTOIDX_INDODAX_TIMEOUT_MS;

  if (!raw) {
    return DEFAULT_TIMEOUT_MS;
  }

  const parsed = Number(raw);

  if (
    !Number.isFinite(parsed) ||
    parsed <= 0
  ) {
    return DEFAULT_TIMEOUT_MS;
  }

  return parsed;
};

export const createIndodaxAuthConfig =
  (): IndodaxAuthConfig => ({
    apiUrl:
      process.env.AUTOIDX_INDODAX_API_URL?.trim() ||
      DEFAULT_API_URL,

    credentials: {
      apiKey: readRequired(
        "INDODAX_API_KEY",
      ),

      apiSecret: readRequired(
        "INDODAX_API_SECRET",
      ),
    },

    timeoutMs: readTimeout(),
  });
