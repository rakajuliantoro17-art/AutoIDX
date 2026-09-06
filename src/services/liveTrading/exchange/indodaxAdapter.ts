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
 * Perubahan (fix keamanan live trading, diverifikasi dari
 * dokumentasi resmi Indodax - Private-RestAPI.md):
 * - submitOrder() sekarang selalu mengirim `order_type`
 *   secara eksplisit. Sebelumnya field ini TIDAK PERNAH
 *   dikirim, sehingga Indodax diam-diam menganggapnya
 *   sebagai "limit" (default API), padahal order MARKET
 *   tidak pernah menyertakan `price` -> berisiko ditolak
 *   atau berperilaku tak terduga.
 * - Amount sekarang dipisah sesuai kontrak resmi Indodax:
 *   `idr` untuk BUY (jumlah rupiah), dan field bernama
 *   sesuai mata uang dasar pair (mis. `btc` untuk pair
 *   btc_idr) untuk SELL. Field generik `amount` yang lama
 *   BUKAN nama parameter yang dikenali Indodax.
 * - `client_order_id` sekarang diteruskan ke Indodax,
 *   supaya proteksi OrderIdempotency di LiveTradingEngine
 *   benar-benar tersambung ke dedup order_id Indodax.
 * - getOrder()/cancelOrder() sekarang memanggil method
 *   Indodax "getOrder" dengan parameter "order_id"
 *   (sebelumnya memakai "orderInfo"/"order", nama lama
 *   yang tidak sesuai dokumentasi resmi saat ini).
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

  /** Default Indodax: "limit". Untuk live trading kita selalu pakai "market". */
  orderType?:
    | "limit"
    | "market";

  /** Wajib untuk order "limit". */
  price?: number;

  /** Jumlah dalam IDR - dipakai untuk order BUY. */
  idr?: number;

  /**
   * Jumlah dalam mata uang dasar pair (mis. btc untuk btc_idr) -
   * dipakai untuk order SELL, atau limit BUY dengan jumlah koin.
   */
  coinAmount?: number;

  clientOrderId?: string;
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
    params: Record
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
      info as Record
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
        balance as Record
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

    const orderType =
      request.orderType ?? "limit";

    if (
      orderType === "limit" &&
      request.price === undefined
    ) {
      throw new Error(
        "Limit order requires a price.",
      );
    }

    if (
      orderType === "market" &&
      request.type === "buy" &&
      request.idr === undefined
    ) {
      throw new Error(
        "Market BUY order requires an IDR amount (idr field). " +
        "Indodax currently only supports IDR-based amounts for market buy orders.",
      );
    }

    if (
      request.type === "sell" &&
      request.coinAmount === undefined
    ) {
      throw new Error(
        "Sell order requires a coin amount (coinAmount field).",
      );
    }

    if (
      request.idr !== undefined &&
      (
        !Number.isFinite(request.idr) ||
        request.idr <= 0
      )
    ) {
      throw new Error(
        "Invalid IDR amount.",
      );
    }

    if (
      request.coinAmount !== undefined &&
      (
        !Number.isFinite(request.coinAmount) ||
        request.coinAmount <= 0
      )
    ) {
      throw new Error(
        "Invalid coin amount.",
      );
    }

    if (
      request.price !== undefined &&
      (
        !Number.isFinite(request.price) ||
        request.price <= 0
      )
    ) {
      throw new Error(
        "Invalid order price.",
      );
    }

    const baseCurrency =
      request.pair.split("_")[0];

    const params: Record
      string,
      string | number | boolean
    > = {
      pair: request.pair,

      type: request.type,

      order_type: orderType,
    };

    if (
      request.price !== undefined
    ) {
      params.price =
        request.price;
    }

    if (
      request.idr !== undefined
    ) {
      params.idr =
        request.idr;
    }

    if (
      request.coinAmount !== undefined
    ) {
      params[baseCurrency] =
        request.coinAmount;
    }

    if (
      request.clientOrderId
    ) {
      params.client_order_id =
        request.clientOrderId;
    }

    const result =
      await this.request
        Record
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
      await this.request
        Record
          string,
          unknown
        >
      >(
        "getOrder",
        {
          order_id: orderId,

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

        order_id: orderId,
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
API asli Indodax (pair, type "buy"/"sell", idr/coinAmount).
Kontrak generik ExchangeClient (dipakai LiveTradingEngine,
dkk.) memakai bentuk berbeda (symbol, side "BUY"/"SELL",
quantity). Class ini menjembatani keduanya tanpa mengubah
IndodaxAdapter di atas.
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

    const pair = symbolToPair(request.symbol);

    const tradeRequest: IndodaxTradeRequest = {
      pair,
      type: request.side === "BUY" ? "buy" : "sell",
      orderType: "market",
      clientOrderId: request.clientOrderId,
    };

    if (request.side === "BUY") {
      if (request.quoteAmount === undefined) {
        throw new Error(
          "Market BUY order requires quoteAmount (IDR amount to spend).",
        );
      }
      tradeRequest.idr = request.quoteAmount;
    } else {
      tradeRequest.coinAmount = request.quantity;
    }

    const result = await this.adapter.submitOrder(tradeRequest);

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
