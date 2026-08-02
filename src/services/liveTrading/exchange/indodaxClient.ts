/**
==========================================================
AURA Trade OS
Indodax API Client
Version : 0.2.2 Alpha
(Ditambahkan: method getInfo() untuk cek saldo, dan trade()
untuk menempatkan order asli - market buy/sell. Base URL juga
diperbaiki supaya konsisten dengan docs/environment-variables.md.
Fix: return type Promise<...> jadi type alias satu baris, dan
fallback "Unknown error" untuk message yang optional dari
ExchangeResponse.)
==========================================================
Exchange Communication Layer
==========================================================
*/

import crypto from "crypto";

import type { ExchangeResponse } from "../types";

export interface IndodaxBalance {
  [asset: string]: string;
}

export interface IndodaxGetInfoResult {
  balance: IndodaxBalance;
  balance_hold: IndodaxBalance;
  server_time: number;
}

export interface IndodaxTradeParams {
  pair: string; // e.g. "btc_idr"
  type: "buy" | "sell";
  orderType?: "market" | "limit";
  price?: number; // wajib untuk limit order
  idr?: number; // nominal IDR untuk BUY
  coinAmount?: number; // jumlah koin untuk SELL
  clientOrderId?: string;
}

export interface IndodaxTradeResult {
  order_id: number;
  client_order_id?: string;
  spend_rp?: number;
  receive_rp?: number;
  fee?: number;
  remain_rp?: number;
  [key: string]: unknown; // receive_<coin> / <coin>_remaining, field-nya dinamis sesuai coin
}

export interface IndodaxCredentials {
  apiKey: string;
  secretKey: string;
}

export type IndodaxGetInfoResponse =
  | { success: true; data: IndodaxGetInfoResult }
  | { success: false; message: string };

export type IndodaxTradeResponse =
  | { success: true; data: IndodaxTradeResult }
  | { success: false; message: string };

export class IndodaxClient {

  private apiKey: string;

  private secretKey: string;

  private baseURL: string;

  constructor(credentials?: IndodaxCredentials) {

    this.apiKey =
      credentials?.apiKey
      ?? process.env.INDODAX_API_KEY
      ?? "";

    this.secretKey =
      credentials?.secretKey
      ?? process.env.INDODAX_SECRET_KEY
      ?? "";

    // INDODAX_API_URL cuma untuk override host, path /tapi
    // selalu ditambahkan otomatis (konsisten dengan docs).
    const host =
      process.env.INDODAX_API_URL
      ?? "https://indodax.com";

    this.baseURL = `${host.replace(/\/$/, "")}/tapi`;

  }

  /**
   * Public endpoint request
   */
  async publicRequest(
    endpoint: string
  ): Promise<ExchangeResponse> {

    try {

      const response = await fetch(
        `https://indodax.com/api/${endpoint}`
      );

      const data = await response.json();

      return {
        success: true,
        message: "OK",
        data,
      };

    } catch (error: any) {

      return {
        success: false,
        message: error.message,
        data: null,
      };

    }

  }

  /**
   * Private endpoint request
   */
  async privateRequest(
    method: string,
    params: any = {}
  ): Promise<ExchangeResponse> {

    if (!this.apiKey || !this.secretKey) {

      return {
        success: false,
        message: "INDODAX_API_KEY / INDODAX_SECRET_KEY belum di-set.",
        data: null,
      };

    }

    try {

      const timestamp = Date.now();

      const payload = {
        method,
        timestamp,
        recvWindow: 5000,
        ...params,
      };

      const body = new URLSearchParams(payload).toString();

      const signature = crypto
        .createHmac("sha512", this.secretKey)
        .update(body)
        .digest("hex");

      const response = await fetch(this.baseURL, {
        method: "POST",
        headers: {
          Key: this.apiKey,
          Sign: signature,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      const data = await response.json();

      if (data.success !== 1) {

        return {
          success: false,
          message: data.error ?? "API Error",
          data: null,
        };

      }

      return {
        success: true,
        message: "OK",
        data: data.return,
      };

    } catch (error: any) {

      return {
        success: false,
        message: error.message,
        data: null,
      };

    }

  }

  /**
   * Ambil informasi saldo akun (view permission)
   */
  async getInfo(): Promise<IndodaxGetInfoResponse> {

    const result = await this.privateRequest("getInfo");

    if (!result.success) {

      return {
        success: false,
        message: result.message ?? "Unknown error",
      };

    }

    return {
      success: true,
      data: result.data as IndodaxGetInfoResult,
    };

  }

  /**
   * Menempatkan order (trade permission).
   * Selalu market order untuk konsistensi dengan paper trading -
   * limit order butuh price & bisa tidak fully-filled, di luar
   * scope MVP ini.
   */
  async trade(
    params: IndodaxTradeParams
  ): Promise<IndodaxTradeResponse> {

    const orderType = params.orderType ?? "market";

    const body: Record<string, unknown> = {
      pair: params.pair,
      type: params.type,
      order_type: orderType,
    };

    if (orderType === "limit") {

      if (!params.price) {

        return {
          success: false,
          message: "Limit order butuh parameter price.",
        };

      }

      body.price = params.price;

    }

    if (params.type === "buy") {

      if (!params.idr) {

        return {
          success: false,
          message: "BUY order butuh parameter idr (nominal IDR).",
        };

      }

      body.idr = params.idr;

    } else {

      if (!params.coinAmount) {

        return {
          success: false,
          message: "SELL order butuh parameter coinAmount.",
        };

      }

      const coin = params.pair.replace(/_idr$/i, "");

      body[coin] = params.coinAmount;

    }

    if (params.clientOrderId) {
      body.client_order_id = params.clientOrderId;
    }

    const result = await this.privateRequest("trade", body);

    if (!result.success) {

      return {
        success: false,
        message: result.message ?? "Unknown error",
      };

    }

    return {
      success: true,
      data: result.data as IndodaxTradeResult,
    };

  }

  /**
   * Check API connection
   */
  async ping() {

    const result = await this.publicRequest("ticker");

    return result.success;

  }

}

const indodaxClient = new IndodaxClient();

export default indodaxClient;
