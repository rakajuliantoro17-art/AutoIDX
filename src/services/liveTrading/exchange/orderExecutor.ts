/**
==========================================================
AURA Trade OS
Indodax Order Executor
Version : 0.2.0 Alpha

Perubahan dari 0.1.0 (2 masalah diperbaiki):

1. BUG PARAMETER TRADE: sebelumnya mengirim `quantity: request.quantity`
   ke Indodax -- field ini TIDAK ADA di spesifikasi resmi Indodax TAPI.
   Jumlah koin harus dikirim dengan nama field DINAMIS sesuai simbol
   base currency (mis. "btc": 0.5 untuk pair btc_idr), dikonfirmasi
   dari dokumentasi resmi (github.com/btcid/indodax-official-api-docs)
   dan konsisten dengan pola yang sama di services/indodax/api.js
   (createTrade -- jalur trade yang SUDAH aktif & terbukti jalan).

1b. BUG CASING order_type: `OrderType` di sistem ini bernilai
    "LIMIT"/"MARKET" (huruf besar), tapi parameter order_type
    Indodax butuh huruf KECIL ("limit"/"market", dikonfirmasi dari
    contoh resmi dokumentasi). Sebelumnya dikirim apa adanya tanpa
    di-lowercase -- sekarang diperbaiki.

2. KREDENSIAL: sebelumnya memakai singleton `indodaxClient` yang
   default-nya baca env var TUNGGAL -- tidak kompatibel dengan
   sistem multi-akun Firestore. Sekarang IndodaxClient WAJIB
   disuntikkan lewat constructor, dengan createOrderExecutor()
   sebagai factory resmi (pola sama dengan account.ts dan
   createIndodaxExchangeClient.ts).
==========================================================
Live Trading Order Execution Adapter
==========================================================
*/

import { IndodaxClient } from "./indodaxClient";
import { getActiveIndodaxAccount } from "@/services/firebase/indodaxAccountsAdmin";
import { TRADING_CONFIG } from "@/config/trading";
import { ExchangeError } from "@/errors";

import type {
  LiveOrderRequest,
  LiveExecutionResult,
  ExchangeResponse,
} from "../types";

export class OrderExecutor {

  /**
   * IndodaxClient WAJIB disediakan pemanggil -- tidak ada
   * default. Pakai createOrderExecutor() di bawah untuk
   * otomatis memakai akun aktif dari Firestore.
   */
  public constructor(
    private readonly client: IndodaxClient,
  ) {}

  /**
   * Execute BUY order
   */
  async buy(request: LiveOrderRequest): Promise<LiveExecutionResult> {

    return this.execute({
      ...request,
      side: "BUY",
    });

  }

  /**
   * Execute SELL order
   */
  async sell(request: LiveOrderRequest): Promise<LiveExecutionResult> {

    return this.execute({
      ...request,
      side: "SELL",
    });

  }

  /**
   * Main execution
   */
  private async execute(request: LiveOrderRequest): Promise<LiveExecutionResult> {

    /**
     * PENGAMAN KESELAMATAN (jangan dihapus):
     * Order hanya benar-benar dikirim ke Indodax kalau
     * TRADING_CONFIG.mode === "live". Folder liveTrading/
     * ini sebelumnya TIDAK punya pengecekan mode sama
     * sekali -- ditambahkan supaya konsisten dengan
     * pengaman yang sama di services/exchange/adapters/indodax.ts.
     */
    if (TRADING_CONFIG.mode !== "live") {

      return {
        success: false,
        symbol: request.symbol,
        side: request.side,
        orderId: null,
        status: "REJECTED",
        executedPrice: null,
        executedQuantity: 0,
        fee: 0,
        message:
          "[SAFETY] Order ditolak: TRADING_CONFIG.mode bukan 'live'. " +
          "Jalur liveTrading/ ini tidak akan mengirim order asli selama " +
          "masih mode paper.",
        timestamp: Date.now(),
      };

    }

    // Jumlah koin dikirim dengan nama field DINAMIS sesuai simbol
    // base currency (mis. "btc" untuk pair "btc_idr") -- BUKAN
    // field generik "quantity" yang tidak dikenali Indodax.
    const coinSymbol = request.symbol.split("_")[0]?.toLowerCase() ?? "";

    // OrderType di sistem ini huruf besar ("LIMIT"/"MARKET"), tapi
    // parameter order_type Indodax butuh huruf KECIL (dikonfirmasi
    // dari contoh resmi: "order_type": "market") -- tanpa ini,
    // Indodax kemungkinan menolak/salah interpretasi order_type.
    //
    // `price` bersifat opsional di LiveOrderRequest (order MARKET
    // memang tidak wajib harga, sesuai dokumentasi resmi Indodax:
    // "Not required for market orders") -- jadi hanya disertakan
    // ke params kalau memang ada nilainya, bukan dikirim sebagai
    // undefined (yang gagal type-check DAN tidak masuk akal
    // dikirim ke API).
    const params: Record<string, string | number> = {
      pair: request.symbol,
      type: request.side === "BUY" ? "buy" : "sell",
      order_type: request.type.toLowerCase(),
      [coinSymbol]: request.quantity,
    };

    if (request.price !== undefined) {
      params.price = request.price;
    }

    const response = await this.client.privateRequest("trade", params);

    return this.normalize(response, request);

  }

  /**
   * Normalize exchange response
   */
  private normalize(
    response: ExchangeResponse,
    request: LiveOrderRequest,
  ): LiveExecutionResult {

    if (!response.success) {

      // Klasifikasi heuristik dari pesan mentah Indodax -- API mereka
      // tidak mengembalikan kode error terstruktur, cuma teks bebas,
      // jadi ini best-effort (default UNKNOWN kalau tidak cocok pola
      // yang dikenal). Tetap lebih berguna daripada teks mentah saja
      // saat di-filter di log Firestore.
      const rawMessage = response.message ?? "Order rejected by exchange.";
      const lowerMessage = rawMessage.toLowerCase();

      const exchangeError = new ExchangeError({
        message: rawMessage,
        code: lowerMessage.includes("balance") || lowerMessage.includes("saldo")
          ? "INSUFFICIENT_BALANCE"
          : lowerMessage.includes("signature") || lowerMessage.includes("sign")
          ? "INVALID_SIGNATURE"
          : lowerMessage.includes("key")
          ? "INVALID_API_KEY"
          : lowerMessage.includes("not found")
          ? "ORDER_NOT_FOUND"
          : "UNKNOWN",
        exchange: "INDODAX",
        details: response.data,
      });

      return {
        success: false,
        symbol: request.symbol,
        side: request.side,
        orderId: null,
        status: "REJECTED",
        executedPrice: null,
        executedQuantity: 0,
        fee: 0,
        message: `[${exchangeError.code}] ${exchangeError.message}`,
        timestamp: Date.now(),
      };

    }

    const data = response.data;

    return {
      success: true,
      symbol: request.symbol,
      side: request.side,
      orderId: data.order_id ?? null,
      status: "FILLED",
      executedPrice: Number(data.price ?? 0),
      executedQuantity: Number(data.filled ?? 0),
      fee: Number(data.fee ?? 0),
      message: "Order executed",
      timestamp: Date.now(),
    };

  }

}

/**
 * Factory resmi: membuat OrderExecutor dengan kredensial dari
 * AKUN AKTIF di Firestore -- bukan env var tunggal. Melempar
 * error kalau tidak ada akun aktif yang dikonfigurasi (JANGAN
 * fallback diam-diam), sama seperti pola di trading/live.ts.
 */
export async function createOrderExecutor(): Promise<OrderExecutor> {

  const account = await getActiveIndodaxAccount();

  if (!account) {
    throw new Error(
      "Tidak ada akun Indodax aktif yang ditemukan (cek BOT_OWNER_UID & isActive di dashboard settings)."
    );
  }

  const client = new IndodaxClient({
    apiKey: account.apiKey,
    secretKey: account.secretKey,
  });

  return new OrderExecutor(client);

}

export default createOrderExecutor;
