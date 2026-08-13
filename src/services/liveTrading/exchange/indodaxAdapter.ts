/**
 * ==========================================================
 * AutoIDX — Indodax Live Exchange Adapter
 * Phase 38 / Batch 2
 * ==========================================================
 *
 * SECURITY:
 * - Credentials are loaded only from environment variables.
 * - Secrets are never logged.
 * - No order is submitted without explicit canary/live gates.
 *
 * IMPORTANT:
 * This adapter is deliberately thin.
 * Risk, safety and canary decisions belong ABOVE this layer.
 *
 * Perubahan: kelas stub `IndodaxAdapter implements ExchangeClient`
 * (semua method throw "not wired") yang sebelumnya ada duluan di
 * file ini dihapus - bentrok nama dengan implementasi asli di
 * bawah ini (duplicate identifier, gagal build). Implementasi
 * lengkap Phase 38 ini yang dipertahankan sebagai satu-satunya
 * IndodaxAdapter di file ini.
 * ==========================================================
 */

import {
  createIndodaxAuthConfig,
  IndodaxAuthConfig,
} from "./indodaxAuth";

import {
  createNonce,
  signIndodaxRequest,
} from "./indodaxSigner";

import {
  assertIndodaxSuccess,
  parseIndodaxResponse,
} from "./indodaxResponse";

export interface IndodaxAdapterOptions {
  config?: IndodaxAuthConfig;
}

export interface IndodaxTradeRequest {
  pair: string;

  type:
    | "buy"
    | "sell";

  price?: number;

  amount: number;
}

export interface IndodaxTradeResult {
  orderId?: string;

  received: boolean;

  raw: unknown;
}

export interface IndodaxOrderResult {
  orderId: string;

  status?: string;

  type?: string;

  pair?: string;

  price?: string;

  amount?: string;

  remaining?: string;

  executed?: string;

  raw: unknown;
}

export interface IndodaxBalance {
  [currency: string]: number;
}

export class IndodaxAdapter {
  private readonly config: IndodaxAuthConfig;

  public constructor(
    options: IndodaxAdapterOptions = {},
  ) {
    this.config =
      options.config ??
      createIndodaxAuthConfig();
  }

  private async request<T>(
    method: string,
    params: Record<
      string,
      string | number | boolean
    > = {},
  ): Promise<T> {
    const signed =
      signIndodaxRequest({
        apiKey:
          this.config.credentials.apiKey,

        apiSecret:
          this.config.credentials.apiSecret,

        method,

        nonce: createNonce(),

        params,
      });

    const controller =
      new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      this.config.timeoutMs,
    );

    try {
      const response =
        await fetch(
          this.config.apiUrl,
          {
            method: "POST",

            headers: {
              "Key":
                this.config.credentials
                  .apiKey,

              "Sign":
                signed.signature,

              "Content-Type":
                signed.contentType,
            },

            body: signed.body,

            signal:
              controller.signal,
          },
        );

      if (!response.ok) {
        throw new Error(
          `Indodax HTTP ${response.status}`,
        );
      }

      const raw =
        await response.json();

      const parsed =
        parseIndodaxResponse<T>(
          raw,
        );

      return assertIndodaxSuccess(
        parsed,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  public async getInfo(): Promise<unknown> {
    return this.request(
      "getInfo",
    );
  }

  public async getBalance(): Promise<IndodaxBalance> {
    const info =
      await this.getInfo();

    if (
      !info ||
      typeof info !== "object"
    ) {
      throw new Error(
        "Invalid getInfo response.",
      );
    }

    const record =
      info as Record<
        string,
        unknown
      >;

    const balance =
      record.balance;

    if (
      !balance ||
      typeof balance !== "object"
    ) {
      throw new Error(
        "Balance data is missing.",
      );
    }

    const output: IndodaxBalance =
      {};

    for (
      const [currency, value]
      of Object.entries(
        balance as Record<
          string,
          unknown
        >,
      )
    ) {
      const numeric =
        Number(value);

      if (
        Number.isFinite(numeric)
      ) {
        output[currency] =
          numeric;
      }
    }

    return output;
  }

  public async submitOrder(
    request: IndodaxTradeRequest,
  ): Promise<IndodaxTradeResult> {
    if (
      !Number.isFinite(
        request.amount,
      ) ||
      request.amount <= 0
    ) {
      throw new Error(
        "Invalid order amount.",
      );
    }

    if (
      request.price !== undefined &&
      (
        !Number.isFinite(
          request.price,
        ) ||
        request.price <= 0
      )
    ) {
      throw new Error(
        "Invalid order price.",
      );
    }

    const params: Record<
      string,
      string | number | boolean
    > = {
      pair: request.pair,

      type: request.type,

      amount:
        request.amount,
    };

    if (
      request.price !== undefined
    ) {
      params.price =
        request.price;
    }

    const result =
      await this.request<
        Record<
          string,
          unknown
        >
      >(
        "trade",
        params,
      );

    const orderId =
      result.order_id;

    return {
      orderId:
        orderId !== undefined
          ? String(orderId)
          : undefined,

      received: true,

      raw: result,
    };
  }

  public async getOrder(
    orderId: string,
    pair: string,
  ): Promise<IndodaxOrderResult> {
    if (!orderId.trim()) {
      throw new Error(
        "Order ID is required.",
      );
    }

    const result =
      await this.request<
        Record<
          string,
          unknown
        >
      >(
        "orderInfo",
        {
          order: orderId,

          pair,
        },
      );

    return {
      orderId,

      status:
        result.status !== undefined
          ? String(result.status)
          : undefined,

      type:
        result.type !== undefined
          ? String(result.type)
          : undefined,

      pair:
        result.pair !== undefined
          ? String(result.pair)
          : undefined,

      price:
        result.price !== undefined
          ? String(result.price)
          : undefined,

      amount:
        result.amount !== undefined
          ? String(result.amount)
          : undefined,

      remaining:
        result.remaining !== undefined
          ? String(result.remaining)
          : undefined,

      executed:
        result.executed !== undefined
          ? String(result.executed)
          : undefined,

      raw: result,
    };
  }

  public async cancelOrder(
    orderId: string,
    pair: string,
    type:
      | "buy"
      | "sell",
  ): Promise<unknown> {
    if (!orderId.trim()) {
      throw new Error(
        "Order ID is required.",
      );
    }

    return this.request(
      "cancelOrder",
      {
        pair,

        type,

        order: orderId,
      },
    );
  }
}

export const indodaxAdapter =
  new IndodaxAdapter();


/*
==========================================================
Exchange Client Bridge
==========================================================
Phase 38 / Batch (bridge)

IndodaxAdapter di atas sengaja "tipis" dan memakai bentuk
API asli Indodax (pair, type "buy"/"sell", amount). Kontrak
generik ExchangeClient (dipakai LiveTradingEngine, dkk.)
memakai bentuk berbeda (symbol, side "BUY"/"SELL", quantity).
Class ini menjembatani keduanya tanpa mengubah IndodaxAdapter
di atas.
==========================================================
*/

import type {
  ExchangeClient,
} from "./exchangeClient";

import type {
  ExchangeOrder,
  ExchangeOrderRequest,
} from "./exchangeOrder";

/**
 * Normalisasi simbol ke format pair Indodax ("btc_idr").
 * Menerima "BTC_IDR", "btc_idr", atau "BTCIDR".
 */
function symbolToPair(symbol: string): string {
  const lower = symbol.toLowerCase();

  if (lower.includes("_")) {
    return lower;
  }

  if (lower.endsWith("idr")) {
    return `${lower.slice(0, -3)}_idr`;
  }

  return lower;
}

function pairToSymbol(pair: string): string {
  return pair.toUpperCase();
}

function mapStatus(
  received: boolean,
): ExchangeOrder["status"] {
  return received ? "OPEN" : "REJECTED";
}

export class IndodaxExchangeClient implements ExchangeClient {

  public constructor(
    private readonly adapter: IndodaxAdapter = indodaxAdapter,
  ) {}

  public async submitOrder(
    request: ExchangeOrderRequest,
  ): Promise<ExchangeOrder> {
    const amount =
      request.side === "BUY" && request.quoteAmount !== undefined
        ? request.quoteAmount
        : request.quantity;

    const result = await this.adapter.submitOrder({
      pair: symbolToPair(request.symbol),
      type: request.side === "BUY" ? "buy" : "sell",
      amount,
    });

    const now = Date.now();

    return {
      id: result.orderId ?? request.clientOrderId,
      clientOrderId: request.clientOrderId,
      symbol: request.symbol,
      side: request.side,
      quantity: request.quantity,
      filledQuantity: 0,
      status: mapStatus(result.received),
      createdAt: now,
      updatedAt: now,
      raw: result.raw,
    };
  }

  public async getOrder(
    orderId: string,
    symbol: string,
  ): Promise<ExchangeOrder> {
    const result = await this.adapter.getOrder(
      orderId,
      symbolToPair(symbol),
    );

    const now = Date.now();

    return {
      id: result.orderId,
      clientOrderId: result.orderId,
      symbol: result.pair ? pairToSymbol(result.pair) : symbol,
      side: result.type === "sell" ? "SELL" : "BUY",
      quantity: Number(result.amount ?? 0),
      filledQuantity: Number(result.executed ?? 0),
      status: mapExchangeOrderStatus(result.status),
      createdAt: now,
      updatedAt: now,
      raw: result.raw,
    };
  }

  public async cancelOrder(
    orderId: string,
    symbol: string,
  ): Promise<ExchangeOrder> {
    // Indodax butuh tahu sisi (buy/sell) order untuk cancel;
    // ambil dulu detail order-nya sebelum cancel.
    const existing = await this.getOrder(orderId, symbol);

    await this.adapter.cancelOrder(
      orderId,
      symbolToPair(symbol),
      existing.side === "SELL" ? "sell" : "buy",
    );

    return {
      ...existing,
      status: "CANCELLED",
      updatedAt: Date.now(),
    };
  }

  public async getBalance(
    asset: string,
  ): Promise<number> {
    const balance = await this.adapter.getBalance();

    return balance[asset.toLowerCase()] ?? 0;
  }

}

function mapExchangeOrderStatus(
  status: string | undefined,
): ExchangeOrder["status"] {
  switch (status) {
    case "open":
      return "OPEN";
    case "filled":
      return "FILLED";
    case "partially_filled":
      return "PARTIALLY_FILLED";
    case "cancelled":
      return "CANCELLED";
    default:
      return "UNKNOWN";
  }
}
