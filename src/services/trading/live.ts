/**
==========================================================
AURA Trade OS
Live Trading Service (REAL MONEY)
Version : 0.0.3 Alpha

Perubahan dari 0.0.2: buy() sekarang menerima tradeAmountIdr
eksplisit (opsional) dari caller (TradingEngine), konsisten
dengan paper.ts -- supaya risk-gate validation di
TradingEngine dan nominal order asli yang benar-benar
dikirim ke Indodax SELALU sama persis. Sisanya (ambil
kredensial dari akun aktif Firestore) TIDAK berubah.
==========================================================
*/

import { IndodaxClient } from "@/services/liveTrading/exchange/indodaxClient";
import { getActiveIndodaxAccount } from "@/services/firebase/indodaxAccountsAdmin";
import { recordTrade, recordLog } from "@/services/firebase/logService";
import { getOpenPositionsCount } from "@/services/firebase/botState";
import { BOT_CONFIG } from "@/config/bot";
import { validateLiveOrder } from "./liveOrderValidator";
import { getCanarySnapshot, getRecentCanaryOrders, recordCanaryOrder } from "@/services/liveTrading/monitoring/canaryStore";
import { CanaryOrderMetric } from "@/services/liveTrading/monitoring/canaryMetrics";
import { getLiveTradingConfig } from "@/services/liveTrading/risk/liveTradingConfig";
import { getReconciliationStatus } from "@/services/firebase/reconciliationStatus";
import {
  acquireLiveOrderLock,
  releaseLiveOrderLock,
  markLiveOrderUncertain,
} from "@/services/firebase/liveOrderLock";

export interface LiveTradeRequest {
  pair: string;
  price: number; // harga referensi saat sinyal (dipakai sbg fallback & estimasi)
  amount?: number; // WAJIB untuk SELL (jumlah koin dari posisi tercatat)
  /**
   * Nominal IDR eksplisit dari caller (TradingEngine).
   * Kalau tidak diisi, fallback ke BOT_CONFIG.defaultTradeAmount.
   */
  tradeAmountIdr?: number;
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
   * Umur maksimum reconciliation yang masih dianggap "segar" --
   * kalau cron/reconcile.ts belum jalan lagi dalam rentang ini,
   * statusnya dianggap BASI dan BUY diblokir (fail-closed), bukan
   * dianggap "aman karena belum pernah ketahuan bermasalah".
   * Default 15 menit -- longgar dibanding interval scan (30
   * detik) supaya tidak mem-block gara-gara reconcile.ts sendiri
   * dipanggil di cron terpisah dengan interval lebih jarang,
   * tapi tetap cukup ketat untuk menangkap kalau cron itu
   * berhenti jalan sama sekali.
   */
  private readonly RECONCILIATION_MAX_AGE_MS =
    (Number(process.env.BOT_CANARY_RECONCILIATION_MAX_AGE_MINUTES) || 15) * 60_000;

  /**
   * Menegakkan `requireReconciliation` dari liveTradingConfig.ts
   * -- SEBELUMNYA field ini "disimpan untuk kelengkapan config
   * tapi tidak pernah ditegakkan oleh kode manapun". Dipanggil
   * HANYA dari buy() (bukan sell()) -- exit posisi yang sudah ada
   * tidak boleh terhambat oleh gerbang keamanan tambahan ini,
   * konsisten dengan prinsip Emergency Stop di seluruh sistem.
   */
  private async assertReconciliationFresh(): Promise<void> {

    const status = await getReconciliationStatus();

    if (!status) {

      const reason =
        "Belum ada hasil reconciliation posisi vs Indodax sama sekali " +
        "(cron/reconcile.ts belum pernah jalan sukses). Pastikan cron " +
        "itu sudah dikonfigurasi & sempat jalan minimal sekali sebelum live BUY.";

      await recordLog("RISK", "warning", `LIVE BUY ditolak: ${reason}`);
      throw new Error(reason);

    }

    const ageMs = Date.now() - status.checkedAt;

    if (ageMs > this.RECONCILIATION_MAX_AGE_MS) {

      const reason =
        `Hasil reconciliation terakhir sudah basi (${Math.round(ageMs / 60_000)} menit lalu, ` +
        `batas ${Math.round(this.RECONCILIATION_MAX_AGE_MS / 60_000)} menit). ` +
        `Cek apakah cron/reconcile.ts masih berjalan terjadwal.`;

      await recordLog("RISK", "warning", `LIVE BUY ditolak: ${reason}`);
      throw new Error(reason);

    }

    if (!status.consistent) {

      const reason =
        `Reconciliation terakhir menemukan ${status.mismatchCount} mismatch antara posisi ` +
        `tercatat dan saldo/order asli di Indodax -- kemungkinan emergency stop sudah aktif, ` +
        `tapi gerbang ini tetap memblokir BUY secara eksplisit sampai diverifikasi manual.`;

      await recordLog("RISK", "danger", `LIVE BUY ditolak: ${reason}`);
      throw new Error(reason);

    }

  }

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
   * Helper best-effort - kegagalan mencatat metrik canary TIDAK
   * PERNAH boleh menggagalkan/membatalkan trade asli yang sudah
   * terjadi (order sudah dikirim ke Indodax, uang sudah bergerak).
   */
  private async recordCanarySafe(metric: CanaryOrderMetric): Promise<void> {
    try {
      await recordCanaryOrder(metric);
    } catch (error) {
      console.error("[LiveTrading] Gagal mencatat canary metric (non-fatal):", error);
    }
  }

  /**
   * BUY asli - market order.
   *
   * SEKARANG dibungkus DUA lapis pemeriksaan tambahan
   * (sebelumnya orphan total/tidak pernah dipakai):
   *
   * 1. Canary Metrics (canaryMetrics.ts/canaryStore.ts) - blokir
   *    kalau statistik eksekusi (win rate/error rate/drawdown)
   *    sedang CRITICAL.
   * 2. Live Trading Config (liveTradingConfig.ts) - gerbang
   *    TAMBAHAN khusus fase canary/testing skala kecil:
   *    - `BOT_CANARY_ENABLED` harus eksplisit "true" (default
   *      FALSE - fail-closed, terpisah dari BOT_MODE/BOT_LIVE_CONFIRM
   *      yang sudah ada).
   *    - Kalau `canaryOnly` aktif (default true), nominal per
   *      trade DIBATASI ke `maxTradeAmount` (default Rp25.000).
   *    - `maxOpenOrders` (default 1) dan `maxConsecutiveFailures`
   *      (default 3, dihitung dari histori canary) ditegakkan di
   *      sini juga.
   *
   * CATATAN: `requireReconciliation` di config BELUM ditegakkan -
   * butuh logika bandingkan posisi tercatat vs saldo/posisi asli
   * di Indodax yang belum ada.
   */
  async buy(
    request: LiveTradeRequest
  ): Promise<LiveTradeResult> {

    const canaryConfig = getLiveTradingConfig();

    if (!canaryConfig.enabled) {

      const reason =
        "Gerbang canary (BOT_CANARY_ENABLED) belum diaktifkan - set env var ini ke \"true\" di Vercel kalau memang sudah siap live trading skala kecil.";

      await recordLog("RISK", "warning", `LIVE BUY ditolak: ${reason}`);

      throw new Error(reason);

    }

    if (canaryConfig.requireReconciliation) {
      await this.assertReconciliationFresh();
    }

    const effectiveTradeAmountIdr =
      request.tradeAmountIdr ?? BOT_CONFIG.defaultTradeAmount;

    if (canaryConfig.canaryOnly && effectiveTradeAmountIdr > canaryConfig.maxTradeAmount) {

      const reason = `Fase canary aktif - nominal trade (Rp${effectiveTradeAmountIdr.toLocaleString("id-ID")}) melebihi batas Rp${canaryConfig.maxTradeAmount.toLocaleString("id-ID")}. Set BOT_CANARY_MAX_TRADE_AMOUNT lebih besar atau BOT_CANARY_ONLY=false kalau sudah siap keluar fase canary.`;

      await recordLog("RISK", "warning", `LIVE BUY ditolak: ${reason}`);

      throw new Error(reason);

    }

    const openPositions = await getOpenPositionsCount();

    if (openPositions >= canaryConfig.maxOpenOrders) {

      const reason = `Fase canary aktif - posisi terbuka (${openPositions}) sudah mencapai batas ${canaryConfig.maxOpenOrders}.`;

      await recordLog("RISK", "warning", `LIVE BUY ditolak: ${reason}`);

      throw new Error(reason);

    }

    const canarySnapshot = await getCanarySnapshot();

    if (canarySnapshot.status === "CRITICAL") {

      const reason = `Canary CRITICAL - BUY live diblokir otomatis (${canarySnapshot.reasons.join("; ") || "lihat snapshot"}).`;

      await recordLog("RISK", "danger", `LIVE BUY ditolak: ${reason}`);

      throw new Error(reason);

    }

    // Consecutive failures TERBARU (bukan dari seluruh histori) -
    // ambil order terakhir dari canaryStore, hitung mundur selama
    // masih FAILED/REJECTED berturut-turut.
    const recentOrders = await getRecentCanaryOrders(canaryConfig.maxConsecutiveFailures + 5);

    if (recentOrders.length > 0) {

      let consecutiveFailures = 0;

      for (let i = recentOrders.length - 1; i >= 0; i--) {

        if (recentOrders[i].status === "FAILED" || recentOrders[i].status === "REJECTED") {
          consecutiveFailures++;
        } else {
          break;
        }

      }

      if (consecutiveFailures >= canaryConfig.maxConsecutiveFailures) {

        const reason = `${consecutiveFailures} kegagalan berturut-turut - melebihi batas ${canaryConfig.maxConsecutiveFailures}. Periksa dulu penyebabnya sebelum lanjut.`;

        await recordLog("RISK", "danger", `LIVE BUY ditolak: ${reason}`);

        throw new Error(reason);

      }

    }

    const startedAt = Date.now();

    try {

      const result = await this.buyInternal(request);

      await this.recordCanarySafe({
        orderId: result.orderId,
        symbol: result.pair,
        side: "BUY",
        amount: result.amount,
        price: result.price,
        status: "FILLED",
        latencyMs: Date.now() - startedAt,
        timestamp: Date.now(),
      });

      return result;

    } catch (error) {

      await this.recordCanarySafe({
        orderId: `failed_${startedAt}`,
        symbol: request.pair,
        side: "BUY",
        // CanaryMetrics.recordOrder() menolak amount<=0 - pakai
        // tradeAmountIdr sbg proxy jumlah order yang DICOBA (bukan
        // jumlah koin, karena order gagal sebelum sempat tahu itu),
        // dengan fallback kecil kalau nilainya somehow 0/negatif.
        amount: (request.tradeAmountIdr ?? BOT_CONFIG.defaultTradeAmount) || 1,
        status: "FAILED",
        latencyMs: Date.now() - startedAt,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;

    }

  }

  private async buyInternal(
    request: LiveTradeRequest
  ): Promise<LiveTradeResult> {

    const tradeAmountIdr =
      request.tradeAmountIdr ?? BOT_CONFIG.defaultTradeAmount;

    // --- Pre-flight validation (pair format + minimum order
    // Indodax) SEBELUM panggilan API apa pun -- gagal cepat
    // dengan pesan jelas, bukan baru ketahuan setelah request
    // ke Indodax gagal dengan pesan mentah dari API mereka. ---
    const validation = validateLiveOrder({
      pair: request.pair,
      tradeAmountIdr,
    });

    if (!validation.valid) {

      await recordLog(
        "RISK",
        "danger",
        `LIVE BUY ditolak validasi pre-flight ${request.pair.toUpperCase()}: ${validation.message}`
      );

      throw new Error(
        `Order tidak valid: ${validation.message}`
      );

    }

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

    // --- Idempotency guard (services/firebase/liveOrderLock.ts,
    // sebelumnya orphan) - diambil SEBELUM order asli dikirim ke
    // Indodax. Kalau ada lock PENDING lain untuk pair+BUY yang
    // sama (mis. cron overlap), acquire() ini akan throw dan
    // order TIDAK dikirim sama sekali - fail-safe di sisi kita,
    // bukan cuma mengandalkan Indodax menolak duplikat.
    await acquireLiveOrderLock(request.pair, "BUY");

    // Sengaja BUKAN try/finally biasa dengan release tanpa syarat
    // - kasus certainty==="UNCERTAIN" (exception network SEBELUM
    // dapat jawaban jelas dari Indodax) harus MENAHAN lock lewat
    // markLiveOrderUncertain(), bukan melepasnya seolah aman untuk
    // dicoba lagi. Flag lockResolved menandai jalur mana yang
    // sudah menangani lock supaya finally di bawah tidak
    // menimpanya dengan release biasa.
    let lockResolved = false;

    try {

      // --- Tempatkan order asli ---
      const result = await client.trade({
        pair: request.pair,
        type: "buy",
        orderType: "market",
        idr: tradeAmountIdr,
      });

      if (!result.success) {

        if (result.certainty === "UNCERTAIN") {

          await markLiveOrderUncertain(
            request.pair,
            "BUY",
            result.message ?? "Trade gagal via exception, status tidak pasti."
          );

          lockResolved = true;

          await recordLog(
            "BOT",
            "danger",
            `LIVE BUY ${request.pair.toUpperCase()} STATUS TIDAK PASTI (kemungkinan tereksekusi tapi respons gagal diterima) - lock ditahan, cek riwayat order asli di Indodax sebelum resolve manual: ${result.message}`
          );

        } else {

          await recordLog(
            "BOT",
            "danger",
            `LIVE BUY GAGAL ${request.pair.toUpperCase()}: ${result.message}`
          );

        }

        throw new Error(result.message);

      }

      await releaseLiveOrderLock(request.pair, "BUY", true);
      lockResolved = true;

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

    } finally {

      // Jalur error mana pun yang belum menangani lock secara
      // eksplisit (mis. exception dari recordTrade/recordLog
      // setelah order sukses TIDAK akan sampai sini karena
      // lockResolved sudah true di atas; ini menangani jalur
      // gagal CERTAIN yang belum sempat release di atas).
      if (!lockResolved) {
        await releaseLiveOrderLock(request.pair, "BUY", false);
      }

    }

  }

  /**
   * SELL asli - market order.
   *
   * TIDAK ADA pemeriksaan Canary CRITICAL di sini secara sengaja -
   * konsisten dengan prinsip Emergency Stop yang sudah ada di
   * TradingEngine ("Emergency Stop HANYA memblokir BUY baru,
   * TIDAK PERNAH memblokir SELL/stop-loss/take-profit paksa").
   * Kalau canary lagi CRITICAL, yang perlu diblokir adalah posisi
   * BARU (BUY), bukan keluar dari posisi yang sudah ada.
   */
  async sell(
    request: LiveTradeRequest
  ): Promise<LiveTradeResult> {

    const startedAt = Date.now();

    try {

      const result = await this.sellInternal(request);

      await this.recordCanarySafe({
        orderId: result.orderId,
        symbol: result.pair,
        side: "SELL",
        amount: result.amount,
        price: result.price,
        status: "FILLED",
        latencyMs: Date.now() - startedAt,
        timestamp: Date.now(),
      });

      return result;

    } catch (error) {

      await this.recordCanarySafe({
        orderId: `failed_${startedAt}`,
        symbol: request.pair,
        side: "SELL",
        // Sama seperti di atas - amount<=0 ditolak CanaryMetrics,
        // pakai fallback kecil kalau amount asli tidak diketahui.
        amount: request.amount || 1e-8,
        status: "FAILED",
        latencyMs: Date.now() - startedAt,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;

    }

  }

  private async sellInternal(
    request: LiveTradeRequest
  ): Promise<LiveTradeResult> {

    if (!request.amount || request.amount <= 0) {

      throw new Error(
        "LIVE SELL butuh amount (jumlah koin) dari posisi yang tercatat di bot_state."
      );

    }

    const client = await this.getClient();

    // --- Idempotency guard, sama seperti buyInternal() di atas -
    // lihat komentar di sana untuk penjelasan lengkap pola
    // lockResolved. SELL sama pentingnya untuk dijaga dari
    // duplikat - overlap cron yang mengirim SELL dua kali bisa
    // menjual koin lebih dari posisi yang sebenarnya tercatat. ---
    await acquireLiveOrderLock(request.pair, "SELL");

    let lockResolved = false;

    try {

      const result = await client.trade({
        pair: request.pair,
        type: "sell",
        orderType: "market",
        coinAmount: request.amount,
      });

      if (!result.success) {

        if (result.certainty === "UNCERTAIN") {

          await markLiveOrderUncertain(
            request.pair,
            "SELL",
            result.message ?? "Trade gagal via exception, status tidak pasti."
          );

          lockResolved = true;

          await recordLog(
            "BOT",
            "danger",
            `LIVE SELL ${request.pair.toUpperCase()} STATUS TIDAK PASTI (kemungkinan tereksekusi tapi respons gagal diterima) - lock ditahan, cek riwayat order asli di Indodax sebelum resolve manual: ${result.message}`
          );

        } else {

          await recordLog(
            "BOT",
            "danger",
            `LIVE SELL GAGAL ${request.pair.toUpperCase()}: ${result.message}`
          );

        }

        throw new Error(result.message);

      }

      await releaseLiveOrderLock(request.pair, "SELL", true);
      lockResolved = true;

      // --- Catat RAW response penuh, untuk verifikasi manual ---
      await recordLog(
        "SYSTEM",
        "info",
        `LIVE SELL raw response ${request.pair.toUpperCase()}: ${JSON.stringify(
          result.data
        )}`
      );

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

    } finally {

      if (!lockResolved) {
        await releaseLiveOrderLock(request.pair, "SELL", false);
      }

    }

  }

}

const liveTradingService = new LiveTradingService();

export default liveTradingService;
