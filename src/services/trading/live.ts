/**
==========================================================
AURA Trade OS
Live Trading Service (REAL MONEY)
Version : 0.0.2 Alpha
Menempatkan order ASLI ke Indodax lewat private Trade API.
Selalu market order untuk konsistensi dengan paper trading.
Kredensial diambil dari akun aktif di Firestore (terenkripsi),
bukan dari env var statis - lihat indodaxAccountsAdmin.ts.

CATATAN PENTING SOAL RESIKO:
- Dokumentasi resmi Indodax cuma kasih contoh response untuk
  BUY (receive_<coin>, spend_rp, fee, remain_rp, order_id).
  Response SELL diasumsikan simetris (receive_idr, spend_<coin>)
  tapi TIDAK ada contoh resmi yang eksplisit. Karena itu, raw
  response SELALU dicatat penuh ke log (recordLog) supaya bisa
  diverifikasi manual di transaksi live pertama.
- Kalau field yang diharapkan tidak ada di response, kode fallback
  ke harga referensi (request.price) supaya tidak crash - tapi
  fallback ini TIDAK seakurat data asli dari exchange, jadi selalu
  cek log activity_logs setelah transaksi live pertama untuk
  konfirmasi field response yang benar.
==========================================================
*/

import { IndodaxClient } from "@/services/liveTrading/exchange/indodaxClient";
import { getActiveIndodaxAccount } from "@/services/firebase/indodaxAccountsAdmin";
import { recordTrade, recordLog } from "@/services/firebase/logService";
import { BOT_CONFIG } from "@/config/bot";

export interface LiveTradeRequest {
  pair: string;
  price: number; // harga referensi saat sinyal (dipakai sbg fallback & estimasi)
  amount?: number; // WAJIB untuk SELL (jumlah koin dari posisi tercatat)
}

export interface LiveTradeResult {
  success: boolean;
  orderId: string;
  pair: string;
  side: "BUY" | "SELL";
  price: number;
  amount: number;
  total: number;
  timestamp: string;
}

class LiveTradingService {

  /**
   * Ambil client Indodax dengan kredensial akun yang sedang
   * aktif (didekripsi dari Firestore). Kalau tidak ada akun
   * aktif, lempar error - JANGAN fallback diam-diam ke env var,
   * supaya jelas kalau memang belum ada akun yang dikonfigurasi.
   */
  private async getClient(): Promise<IndodaxClient> {

    const account = await getActiveIndodaxAccount();

    if (!account) {

      throw new Error(
        "Tidak ada akun Indodax aktif yang ditemukan (cek BOT_OWNER_UID & isActive di dashboard settings)."
      );

    }

    return new IndodaxClient({
      apiKey: account.apiKey,
      secretKey: account.secretKey,
    });

  }

  /**
   * BUY asli - market order, nominal IDR = BOT_CONFIG.defaultTradeAmount
   */
  async buy(
    request: LiveTradeRequest
  ): Promise<LiveTradeResult> {

    const tradeAmountIdr = BOT_CONFIG.defaultTradeAmount;

    const client = await this.getClient();

    // --- Cek saldo IDR cukup sebelum order ---
    const info = await client.getInfo();

    if (!info.success) {

      await recordLog(
        "BOT",
        "danger",
        `LIVE BUY GAGAL ${request.pair.toUpperCase()} - tidak bisa ambil saldo: ${info.message}`
      );

      throw new Error(`Gagal ambil saldo Indodax: ${info.message}`);

    }

    const idrBalance = Number(info.data.balance?.idr ?? 0);

    if (idrBalance < tradeAmountIdr) {

      await recordLog(
        "RISK",
        "warning",
        `LIVE BUY dibatalkan - saldo IDR tidak cukup (${idrBalance} < ${tradeAmountIdr})`
      );

      throw new Error(
        `Saldo IDR tidak cukup (tersedia ${idrBalance}, butuh ${tradeAmountIdr})`
      );

    }

    // --- Tempatkan order asli ---
    const result = await client.trade({
      pair: request.pair,
      type: "buy",
      orderType: "market",
      idr: tradeAmountIdr,
    });

    if (!result.success) {

      await recordLog(
        "BOT",
        "danger",
        `LIVE BUY GAGAL ${request.pair.toUpperCase()}: ${result.message}`
      );

      throw new Error(result.message);

    }

    // --- Catat RAW response penuh, untuk verifikasi manual ---
    await recordLog(
      "SYSTEM",
      "info",
      `LIVE BUY raw response ${request.pair.toUpperCase()}: ${JSON.stringify(
        result.data
      )}`
    );

    const coin = request.pair.replace(/_idr$/i, "");

    const receivedCoin = Number(
      (result.data as any)[`receive_${coin}`] ?? 0
    );

    const spentIdr = Number(
      (result.data as any).spend_rp ?? tradeAmountIdr
    );

    const actualPrice =
      receivedCoin > 0
        ? spentIdr / receivedCoin
        : request.price;

    await recordTrade({

      pair: request.pair,

      type: "BUY",

      price: actualPrice,

      amount: receivedCoin,

      totalIdr: spentIdr,

      fee: Number((result.data as any).fee ?? 0),

      orderId: String(result.data.order_id),

      reason: "Live Trading BUY",

      mode: "live",

    });

    await recordLog(
      "BOT",
      "success",
      `LIVE BUY ${request.pair.toUpperCase()} @ ${actualPrice.toFixed(
        0
      )} (order_id: ${result.data.order_id})`
    );

    return {

      success: true,

      orderId: String(result.data.order_id),

      pair: request.pair,

      side: "BUY",

      price: actualPrice,

      amount: receivedCoin,

      total: spentIdr,

      timestamp: new Date().toISOString(),

    };

  }

  /**
   * SELL asli - market order, jual seluruh koin dari posisi tercatat
   */
  async sell(
    request: LiveTradeRequest
  ): Promise<LiveTradeResult> {

    if (!request.amount || request.amount <= 0) {

      throw new Error(
        "LIVE SELL butuh amount (jumlah koin) dari posisi yang tercatat di bot_state."
      );

    }

    const client = await this.getClient();

    const result = await client.trade({
      pair: request.pair,
      type: "sell",
      orderType: "market",
      coinAmount: request.amount,
    });

    if (!result.success) {

      await recordLog(
        "BOT",
        "danger",
        `LIVE SELL GAGAL ${request.pair.toUpperCase()}: ${result.message}`
      );

      throw new Error(result.message);

    }

    // --- Catat RAW response penuh, untuk verifikasi manual ---
    await recordLog(
      "SYSTEM",
      "info",
      `LIVE SELL raw response ${request.pair.toUpperCase()}: ${JSON.stringify(
        result.data
      )}`
    );

    // Field belum ada contoh resmi utk SELL - coba beberapa
    // kemungkinan nama, fallback ke estimasi dari request.price
    // kalau semuanya tidak ketemu.
    const data = result.data as any;

    const receivedIdr = Number(
      data.receive_idr ?? data.receive_rp ?? 0
    );

    const total =
      receivedIdr > 0
        ? receivedIdr
        : request.amount * request.price;

    const actualPrice =
      receivedIdr > 0
        ? receivedIdr / request.amount
        : request.price;

    await recordTrade({

      pair: request.pair,

      type: "SELL",

      price: actualPrice,

      amount: request.amount,

      totalIdr: total,

      fee: Number(data.fee ?? 0),

      orderId: String(data.order_id),

      reason: "Live Trading SELL",

      mode: "live",

    });

    await recordLog(
      "BOT",
      "success",
      `LIVE SELL ${request.pair.toUpperCase()} @ ${actualPrice.toFixed(
        0
      )} (order_id: ${data.order_id})`
    );

    return {

      success: true,

      orderId: String(data.order_id),

      pair: request.pair,

      side: "SELL",

      price: actualPrice,

      amount: request.amount,

      total,

      timestamp: new Date().toISOString(),

    };

  }

}

const liveTradingService = new LiveTradingService();

export default liveTradingService;
