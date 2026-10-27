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

/**
 * fetch() TIDAK PUNYA timeout bawaan -- kalau Indodax hang/sangat
 * lambat, request bisa menggantung nyaris tanpa batas (jauh
 * melebihi timeout cron-job.org/GitHub Actions 30 detik, bahkan
 * bisa menahan seluruh function sampai Vercel paksa matikan).
 * Helper ini membatasi setiap request individual dengan
 * AbortController, supaya kegagalan Indodax gagal CEPAT dan jelas
 * (masuk ke catch block yang sudah ada di publicRequest/
 * privateRequest sebagai error biasa -- certainty: "UNCERTAIN"
 * untuk privateRequest, konsisten dengan penanganan error network
 * lain yang sudah ada).
 *
 * PENTING: sebelumnya 15 detik -- diturunkan ke 6 detik. Trigger
 * cron UTAMA (cron-job.org) punya batas keras 30 detik untuk
 * SELURUH siklus (dikonfirmasi dari pesan error mereka sendiri).
 * reconcile.ts bisa memanggil getInfo()/openOrders() berurutan
 * untuk beberapa pair posisi terbuka -- satu panggilan yang
 * mendekati 15 detik saja sudah menghabiskan separuh budget
 * total, sebelum panggilan lain sempat jalan.
 */
const DEFAULT_REQUEST_TIMEOUT_MS = 6_000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<Response> {

  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {

    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });

  } catch (error) {

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Indodax request timed out after ${timeoutMs}ms: ${url}`);
    }

    throw error;

  } finally {

    clearTimeout(timeout);

  }

}

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
  /** Kunci TAPIv2 khusus (opsional) -- hanya dipakai endpoint v2 (riwayat). */
  v2ApiKey?: string;
  v2SecretKey?: string;
}

export type IndodaxGetInfoResponse =
  | { success: true; data: IndodaxGetInfoResult }
  | { success: false; message: string };

export type IndodaxTradeResponse =
  | { success: true; data: IndodaxTradeResult }
  | { success: false; message: string; certainty?: "CERTAIN" | "UNCERTAIN" };

/** Normalisasi satu trade v2 (myTrades) ke field gaya legacy. */
export function normalizeV2Trade(t: Record<string, unknown>, asset: string): Record<string, unknown> {
  const timeMs = Number(t.time);
  const sec = Number.isFinite(timeMs) ? Math.floor(timeMs / 1000) : NaN;
  return {
    trade_id: t.tradeId,
    order_id: t.orderId,
    type: t.isBuyer === true ? "buy" : "sell",
    price: t.price,
    fee: t.commission,
    date: sec,
    trade_time: sec,
    [asset]: t.qty,
    idr: t.quoteQty,
  };
}

export class IndodaxClient {

  private apiKey: string;

  private secretKey: string;

  private v2ApiKey: string | undefined;

  private v2SecretKey: string | undefined;

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

    this.v2ApiKey = credentials?.v2ApiKey || undefined;
    this.v2SecretKey = credentials?.v2SecretKey || undefined;

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

      const response = await fetchWithTimeout(
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

      const response = await fetchWithTimeout(this.baseURL, {
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
          // Indodax MERESPONS dengan jelas menolak -- order pasti
          // tidak tereksekusi.
          certainty: "CERTAIN",
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
        // Gagal lewat exception (network/timeout/parse error)
        // SEBELUM dapat jawaban jelas dari Indodax -- order BISA
        // JADI tetap tereksekusi di sisi mereka. Lihat catatan
        // lengkap di types.ts ExchangeResponse.certainty.
        certainty: "UNCERTAIN",

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

    if (params.type === "buy" && orderType === "limit") {

      // Limit BUY di Indodax WAJIB menyebut jumlah koin ("btc"), bukan
      // nominal IDR (respons: "Please submit Limit order type with btc
      // quantity specified"). Market BUY tetap memakai `idr`.
      if (!params.coinAmount) {
        return {
          success: false,
          message: "Limit BUY order butuh parameter coinAmount.",
        };
      }

      const coin = params.pair.replace(/_idr$/i, "");

      body[coin] = Number(params.coinAmount).toFixed(8);

    } else if (params.type === "buy") {
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
        // Diteruskan dari privateRequest() -- lihat catatan
        // lengkap di types.ts ExchangeResponse.certainty. Dipakai
        // trading/live.ts untuk memutuskan aman-tidaknya lock
        // di-release sebagai "boleh retry".
        certainty: result.certainty,
      };

    }

    return {
      success: true,
      data: result.data as IndodaxTradeResult,
    };

  }

  /**
   * Riwayat trade akun (private endpoint "trades") -- dipakai
   * uncertainOrderReconciler.ts untuk memverifikasi apakah order
   * yang responsnya UNCERTAIN (exception network sebelum dapat
   * jawaban jelas) SEBENARNYA tereksekusi atau tidak di sisi
   * Indodax, dengan cara mencari trade pair+side yang cocok
   * SETELAH timestamp order tersebut dikirim.
   *
   * `since` dalam UNIX SECONDS (bukan milliseconds) sesuai
   * dokumentasi TAPI Indodax.
   */
  async tradeHistory(
    params: { pair: string; since?: number; count?: number }
  ): Promise<
    | { success: true; data: unknown[] }
    | { success: false; message: string }
  > {
    // Method legacy "tradeHistory" dihentikan Indodax (membalas teks
    // "DEPRECATED"); penggantinya GET /api/v2/myTrades. Bentuk keluaran
    // dinormalisasi ke field legacy (type, date/trade_time dalam DETIK,
    // price, fee, order_id, <asset>) supaya pemanggil lama tetap jalan.
    const asset = params.pair.split("_")[0];
    const query: Record<string, string | number> = {
      symbol: params.pair.replace("_", ""),
      limit: Math.min(Math.max(params.count ?? 50, 10), 1000),
      sort: "desc",
    };
    if (params.since !== undefined) {
      // since = detik (legacy) -> startTime ms. Rentang maks 7 hari.
      const now = Date.now();
      query.startTime = Math.max(Math.floor(params.since) * 1000, now - 7 * 24 * 3600 * 1000 + 60_000);
      query.endTime = now;
    }
    const result = await this.signedGetV2("/api/v2/myTrades", query);
    if (!result.success) return result;
    const rows = Array.isArray((result.data as { data?: unknown })?.data)
      ? ((result.data as { data: Record<string, unknown>[] }).data)
      : [];
    return { success: true, data: rows.map((t) => normalizeV2Trade(t, asset)) };
  }

  /**
   * GET bertanda tangan ke API v2 (X-APIKEY + Sign = HMAC-SHA256 hex atas
   * query string). BACA-SAJA: dipakai hanya untuk riwayat. Kegagalan
   * dikembalikan sebagai {success:false}, tidak pernah melempar.
   */
  private async signedGetV2(
    path: string,
    query: Record<string, string | number>
  ): Promise<{ success: true; data: unknown } | { success: false; message: string }> {
    try {
      const host = (process.env.INDODAX_V2_API_URL ?? "https://api.indodax.com").replace(/\/$/, "");
      const qs = new URLSearchParams(
        Object.entries({ ...query, timestamp: Date.now(), recvWindow: 10_000 }).map(([k, v]) => [k, String(v)])
      ).toString();
      // API v2 WAJIB kunci TAPIv2 khusus (kunci TAPI lama ditolak 401).
      // Pakai INDODAX_V2_API_KEY/INDODAX_V2_SECRET_KEY bila ada (disarankan
      // kunci BACA-SAJA), kalau tidak jatuh ke kunci akun aktif.
      const v2Key = this.v2ApiKey ?? process.env.INDODAX_V2_API_KEY;
      const v2Secret = this.v2SecretKey ?? process.env.INDODAX_V2_SECRET_KEY;
      const useV2 = Boolean(v2Key && v2Secret);
      const apiKey = useV2 ? (v2Key as string) : this.apiKey;
      const secret = useV2 ? (v2Secret as string) : this.secretKey;
      const sign = crypto.createHmac("sha256", secret).update(qs).digest("hex");
      const res = await fetchWithTimeout(`${host}${path}?${qs}`, {
        method: "GET",
        headers: { Accept: "application/json", "X-APIKEY": apiKey, Sign: sign },
      });
      const text = await res.text();
      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch {
        return { success: false, message: `Respons v2 bukan JSON (HTTP ${res.status}): ${text.slice(0, 120)}` };
      }
      const err = json as { code?: unknown; msg?: unknown };
      if (!res.ok || (err && typeof err === "object" && err.code !== undefined && err.msg !== undefined)) {
        const hint = res.status === 401 && !useV2 ? " -- kunci TAPI lama tidak berlaku di v2; buat kunci TAPIv2 (indodax.com/trade_api) dan simpan di Settings > API Indodax (Kunci API v2) atau env INDODAX_V2_API_KEY/INDODAX_V2_SECRET_KEY" : "";
        return { success: false, message: `Indodax v2 ${res.status}: ${String(err?.msg ?? "error")} (${String(err?.code ?? "")})${hint}` };
      }
      return { success: true, data: json };
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : String(e) };
    }
  }

  /**
   * Riwayat ORDER akun (private method "orderHistory"). Dicoba sebagai
   * pengganti "tradeHistory" yang pada 27 Okt 2026 membalas teks
   * "DEPRECATED" (bukan JSON). BACA-SAJA; bentuk respons belum diverifikasi,
   * jadi dikembalikan apa adanya.
   */
  async orderHistory(
    params: { pair: string; count?: number; since?: number }
  ): Promise<
    | { success: true; data: unknown }
    | { success: false; message: string }
  > {
    const now = Date.now();
    return this.signedGetV2("/api/v2/order/histories", {
      symbol: params.pair.replace("_", ""),
      limit: Math.min(Math.max(params.count ?? 20, 10), 1000),
      sort: "desc",
      startTime: params.since !== undefined ? Math.max(params.since * 1000, now - 7 * 24 * 3600 * 1000 + 60_000) : now - 7 * 24 * 3600 * 1000 + 60_000,
      endTime: now,
    });
  }

  /**
   * Riwayat deposit/penarikan akun (private method "transHistory").
   * BACA-SAJA; dipakai laporan dompet untuk menjelaskan perubahan saldo IDR.
   */
  async transHistory(): Promise<
    | { success: true; data: unknown }
    | { success: false; message: string }
  > {
    const result = await this.privateRequest("transHistory", {});
    if (!result.success) {
      return { success: false, message: result.message ?? "Unknown error" };
    }
    return { success: true, data: result.data };
  }

  /**
   * Daftar order yang masih OPEN (belum fully filled/cancelled)
   * untuk satu pair -- private endpoint "openOrders". Dipakai
   * cron/reconcile.ts untuk mengisi `unknownOrderIds` yang
   * sebelumnya SELALU kosong (lihat catatan di reconcile.ts).
   *
   * Bot ini SELALU pakai market order (fill instan), jadi order
   * apa pun yang masih OPEN di sini pada dasarnya "tidak dikenal"
   * dari sudut pandang bot -- bot tidak punya registry order
   * limit yang sengaja dibiarkan terbuka. Kemunculan hasil di
   * sini kemungkinan besar order manual di luar bot, atau order
   * yang macet/partial-fill yang butuh perhatian operator.
   */
  async openOrders(
    pair: string
  ): Promise<
    | { success: true; data: Array<{ order_id: string | number }> }
    | { success: false; message: string }
  > {

    const result = await this.privateRequest("openOrders", { pair });

    if (!result.success) {

      return {
        success: false,
        message: result.message ?? "Unknown error",
      };

    }

    const raw = Array.isArray(result.data)
      ? result.data
      : ((result.data as Record<string, unknown>)?.[pair] as unknown[]) ?? [];

    return {
      success: true,
      data: raw as Array<{ order_id: string | number }>,
    };

  }

  /**
   * Batalkan satu order OPEN (private endpoint "cancelOrder"). Dipakai
   * uji izin trade (services/accounts/tradePermissionTest.ts).
   */
  async cancelOrder(
    params: { pair: string; orderId: string | number; type: "buy" | "sell" }
  ): Promise<
    | { success: true; data: unknown }
    | { success: false; message: string }
  > {
    const result = await this.privateRequest("cancelOrder", {
      pair: params.pair,
      order_id: params.orderId,
      type: params.type,
    });
    if (!result.success) {
      return { success: false, message: result.message ?? "Unknown error" };
    }
    return { success: true, data: result.data };
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
