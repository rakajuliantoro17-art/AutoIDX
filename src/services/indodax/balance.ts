/**
 * ============================================================
 * AURA Trade OS
 * Indodax Balance Service
 * ============================================================
 *
 * Phase 38 - Integration / Fix
 *
 * Responsibility:
 * - Mengambil saldo akun dari Private REST API Indodax.
 * - Menormalisasi response balance.
 * - Menyediakan helper untuk membaca saldo currency tertentu.
 * - Menjaga agar credential/signature tidak bocor.
 *
 * NOT responsible for:
 * - Order placement
 * - Buy/Sell
 * - Strategy
 * - Risk decision
 * - Portfolio mutation
 *
 * Flow:
 *
 * IndodaxAuth
 *      ↓
 * BalanceService
 *      ↓
 * Indodax Private API
 *      ↓
 * Normalized Balance
 *      ↓
 * Risk / Portfolio / Execution
 * ============================================================
 */

import {
  IndodaxAuth,
  type IndodaxSignedRequest,
} from "./auth";

export interface IndodaxBalanceRequest {
  currency?: string;
}

export interface IndodaxBalanceRaw {
  [currency: string]: string | number;
}

export interface IndodaxBalance {
  currency: string;
  available: number;
  locked: number;
  total: number;
}

export interface IndodaxBalanceResponse {
  success: number;
  return?: {
    balance?: IndodaxBalanceRaw;
  };
  error?: string;
}

export interface IndodaxBalanceClient {
  request(
    body: string,
    headers: Record<string, string>,
  ): Promise<unknown>;
}

export interface BalanceSnapshot {
  balances: IndodaxBalance[];
  timestamp: number;
}

export class IndodaxBalanceError extends Error {
  public readonly code: string;

  public constructor(
    message: string,
    code = "INDODAX_BALANCE_ERROR",
  ) {
    super(message);

    this.name = "IndodaxBalanceError";
    this.code = code;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

export class IndodaxBalanceService {
  private readonly auth: IndodaxAuth;

  private readonly client: IndodaxBalanceClient;

  public constructor(
    auth: IndodaxAuth,
    client: IndodaxBalanceClient,
  ) {
    if (!auth) {
      throw new IndodaxBalanceError(
        "IndodaxAuth is required",
        "AUTH_REQUIRED",
      );
    }

    if (!client) {
      throw new IndodaxBalanceError(
        "Indodax balance client is required",
        "CLIENT_REQUIRED",
      );
    }

    this.auth = auth;
    this.client = client;
  }

  /**
   * Fetch all account balances.
   */
  public async getBalances(): Promise<
    IndodaxBalance[]
  > {
    const request =
      this.auth.createSignedRequest({
        method: "getInfo",
      });

    const response =
      await this.executeRequest(request);

    return this.normalizeBalances(
      response,
    );
  }

  /**
   * Fetch a specific currency balance.
   *
   * Example:
   *
   * getBalance("idr")
   * getBalance("btc")
   */
  public async getBalance(
    currency: string,
  ): Promise<IndodaxBalance> {
    const normalizedCurrency =
      this.normalizeCurrency(currency);

    const balances =
      await this.getBalances();

    const balance =
      balances.find(
        (item) =>
          item.currency ===
          normalizedCurrency,
      );

    if (!balance) {
      return {
        currency: normalizedCurrency,
        available: 0,
        locked: 0,
        total: 0,
      };
    }

    return balance;
  }

  /**
   * Return available balance only.
   */
  public async getAvailableBalance(
    currency: string,
  ): Promise<number> {
    const balance =
      await this.getBalance(currency);

    return balance.available;
  }

  /**
   * Return locked balance only.
   */
  public async getLockedBalance(
    currency: string,
  ): Promise<number> {
    const balance =
      await this.getBalance(currency);

    return balance.locked;
  }

  /**
   * Return total balance.
   */
  public async getTotalBalance(
    currency: string,
  ): Promise<number> {
    const balance =
      await this.getBalance(currency);

    return balance.total;
  }

  /**
   * Fetch and return a complete timestamped
   * balance snapshot.
   */
  public async getSnapshot(): Promise<
    BalanceSnapshot
  > {
    const balances =
      await this.getBalances();

    return {
      balances,
      timestamp: Date.now(),
    };
  }

  /**
   * Check whether the account has enough
   * available balance.
   */
  public async hasAvailableBalance(
    currency: string,
    requiredAmount: number,
  ): Promise<boolean> {
    if (
      !Number.isFinite(
        requiredAmount,
      ) ||
      requiredAmount < 0
    ) {
      throw new IndodaxBalanceError(
        "Required balance amount must be a non-negative finite number",
        "INVALID_REQUIRED_AMOUNT",
      );
    }

    const available =
      await this.getAvailableBalance(
        currency,
      );

    return available >=
      requiredAmount;
  }

  /**
   * Normalize the raw Indodax balance response.
   */
  private normalizeBalances(
    response: unknown,
  ): IndodaxBalance[] {
    const parsed =
      this.parseResponse(response);

    if (
      parsed.success !== 1
    ) {
      throw new IndodaxBalanceError(
        parsed.error ??
          "Indodax balance request failed",
        "BALANCE_REQUEST_FAILED",
      );
    }

    const rawBalance =
      parsed.return?.balance;

    if (!rawBalance) {
      throw new IndodaxBalanceError(
        "Indodax response does not contain balance data",
        "BALANCE_DATA_MISSING",
      );
    }

    return Object.entries(
      rawBalance,
    ).map(
      ([currency, value]) =>
        this.normalizeBalance(
          currency,
          value,
        ),
    );
  }

  /**
   * Normalize a single currency balance.
   *
   * Indodax commonly exposes available
   * balance as the currency value and may
   * expose locked values separately depending
   * on API response shape.
   */
  private normalizeBalance(
    currency: string,
    value:
      | string
      | number,
  ): IndodaxBalance {
    const numericValue =
      this.toNumber(value);

    return {
      currency:
        this.normalizeCurrency(
          currency,
        ),
      available: numericValue,
      locked: 0,
      total: numericValue,
    };
  }

  /**
   * Execute signed request through the
   * injected private API client.
   */
  private async executeRequest(
    request: IndodaxSignedRequest,
  ): Promise<unknown> {
    try {
      return await this.client.request(
        request.body,
        request.headers,
      );
    } catch (error) {
      throw new IndodaxBalanceError(
        this.sanitizeErrorMessage(
          error,
        ),
        "BALANCE_NETWORK_ERROR",
      );
    }
  }

  /**
   * Validate and normalize API response.
   */
  private parseResponse(
    response: unknown,
  ): IndodaxBalanceResponse {
    if (
      !this.isRecord(response)
    ) {
      throw new IndodaxBalanceError(
        "Invalid Indodax balance response",
        "INVALID_RESPONSE",
      );
    }

    const success =
      response.success;

    if (
      typeof success !==
      "number"
    ) {
      throw new IndodaxBalanceError(
        "Invalid Indodax response success field",
        "INVALID_SUCCESS_FIELD",
      );
    }

    return {
      success,

      return:
        this.isRecord(
          response.return,
        )
          ? {
              balance:
                this.isRecord(
                  response.return
                    .balance,
                )
                  ? this.toBalanceRecord(
                      response.return
                        .balance,
                    )
                  : undefined,
            }
          : undefined,

      error:
        typeof response.error ===
        "string"
          ? response.error
          : undefined,
    };
  }

  /**
   * Convert unknown object into a
   * normalized balance record.
   */
  private toBalanceRecord(
    value: Record<
      string,
      unknown
    >,
  ): IndodaxBalanceRaw {
    const result: IndodaxBalanceRaw =
      {};

    for (
      const [key, item] of Object.entries(
        value,
      )
    ) {
      if (
        typeof item ===
          "string" ||
        typeof item ===
          "number"
      ) {
        result[key] = item;
      }
    }

    return result;
  }

  /**
   * Convert supported numeric values
   * into finite numbers.
   */
  private toNumber(
    value:
      | string
      | number,
  ): number {
    const parsed =
      typeof value ===
      "number"
        ? value
        : Number(value);

    if (
      !Number.isFinite(parsed)
    ) {
      throw new IndodaxBalanceError(
        "Invalid numeric balance value",
        "INVALID_BALANCE_VALUE",
      );
    }

    return parsed;
  }

  /**
   * Normalize currency symbols.
   */
  private normalizeCurrency(
    currency: string,
  ): string {
    if (
      typeof currency !==
        "string" ||
      currency.trim()
        .length === 0
    ) {
      throw new IndodaxBalanceError(
        "Currency is required",
        "CURRENCY_REQUIRED",
      );
    }

    return currency
      .trim()
      .toLowerCase();
  }

  /**
   * Prevent sensitive authentication
   * information from appearing in errors.
   */
  private sanitizeErrorMessage(
    error: unknown,
  ): string {
    if (
      error instanceof Error
    ) {
      return error.message;
    }

    if (
      typeof error ===
      "string"
    ) {
      return error;
    }

    return "Unknown Indodax balance request error";
  }

  private isRecord(
    value: unknown,
  ): value is Record<
    string,
    unknown
  > {
    return (
      typeof value ===
        "object" &&
      value !== null &&
      !Array.isArray(value)
    );
  }
}

/**
 * Factory helper.
 */
export function createIndodaxBalanceService(
  auth: IndodaxAuth,
  client: IndodaxBalanceClient,
): IndodaxBalanceService {
  return new IndodaxBalanceService(
    auth,
    client,
  );
}

export default IndodaxBalanceService;
