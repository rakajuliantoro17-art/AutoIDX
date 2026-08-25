import crypto from 'crypto';
import querystring from 'querystring';
import indodaxLimiter from './limiter';
import IndodaxCache from './cache';
import RetryExecutor from '@/services/resilience/retryExecutor';
import { latencyMonitor } from '@/services/monitor/latencyMonitor';

// Cache khusus daftar pair (/api/pairs jarang berubah - TTL 6 jam cukup
// aman, tetap bisa dipaksa refresh lewat forceRefresh()).
const pairsCache = new IndodaxCache({ ttlMs: 6 * 60 * 60 * 1000, maxEntries: 4 });
const PAIRS_CACHE_KEY = 'indodax:pairs:all';

// Mengaktifkan services/resilience/retryExecutor.ts yang sebelumnya
// orphan. HANYA dipasang di endpoint PUBLIK (baca data, idempoten) --
// SENGAJA TIDAK dipasang di _privateRequest/createTrade/cancelOrder,
// karena mengulang order/cancel yang responsnya hilang (padahal
// sebenarnya sudah dieksekusi Indodax) berisiko duplikat. Untuk BUY
// live, pencegahan duplikat sudah ditangani liveOrderLock.ts +
// status UNCERTAIN (lihat services/trading/live.ts) -- retry generik
// di sini TIDAK BOLEH menggantikan mekanisme itu.
const retryExecutor = new RetryExecutor();

/**
 * Retryable HANYA untuk kegagalan transien: exception jaringan asli
 * (tidak punya .status sama sekali), HTTP 429 (rate limit), atau 5xx
 * (masalah sisi server Indodax). HTTP 4xx lain (mis. 404 pair tidak
 * ada) TIDAK di-retry -- mengulang tidak akan pernah mengubah hasil.
 */
function isRetryablePublicError(error) {
  if (error && typeof error.status === 'number') {
    return error.status === 429 || error.status >= 500;
  }
  return true;
}

/**
 * Bungkus fetch endpoint PUBLIK Indodax dengan rate limiter (sudah
 * ada) + retry exponential backoff (baru). Melempar Error yang sama
 * seperti sebelumnya kalau semua percobaan gagal -- method pemanggil
 * di bawah TIDAK berubah kontraknya sama sekali (masih try/catch +
 * fallback null/[]/{} seperti semula).
 */
async function fetchPublicWithRetry(url, options = {}) {
  // Variabel lokal per-panggilan (BUKAN module-level/static) --
  // wajib begini karena banyak pair diproses BERSAMAAN lewat
  // mapWithConcurrency di scanner; static/shared state di sini akan
  // saling menimpa antar panggilan konkuren (race condition).
  let capturedResponse;
  let capturedError;

  const measurement = await latencyMonitor.measure('indodax_public', async () => {
    const result = await retryExecutor.execute(
      async () => {
        const response = await indodaxLimiter.executePublic(() => fetch(url, options));

        if (!response.ok) {
          const httpError = new Error(`HTTP Error: ${response.status}`);
          httpError.status = response.status;
          throw httpError;
        }

        return response;
      },
      {
        policy: { maxAttempts: 3 },
        shouldRetry: isRetryablePublicError,
      }
    );

    if (!result.success) {
      capturedError = result.error;
      throw result.error; // supaya latencyMonitor mencatat success:false
    }

    capturedResponse = result.value;
  });

  if (!measurement.success) {
    throw capturedError ?? new Error(`Public request to Indodax failed: ${url}`);
  }

  return capturedResponse;
}

/**
 * Service Wrapper untuk Indodax Public & Private API (TAPI)
 */
class IndodaxService {
  constructor() {
    this.publicBaseUrl = 'https://indodax.com/api';
    this.privateBaseUrl = 'https://indodax.com/tapi';
    this.apiKey = process.env.INDODAX_API_KEY || '';
    this.secretKey = process.env.INDODAX_SECRET_KEY || '';
  }

  // ==========================================
  // PUBLIC API ENDPOINTS
  // ==========================================

  /**
   * Mengambil data Ticker publik untuk pair tertentu (misal: btc_idr)
   * @param {string} pair - Contoh: 'btc_idr', 'eth_idr'
   */
  async getTicker(pair = 'btc_idr') {
    try {
      const response = await fetchPublicWithRetry(`${this.publicBaseUrl}/${pair}/ticker`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      return data.ticker;
    } catch (error) {
      console.error(`[Indodax API Error] Failed to fetch ticker (${pair}):`, error.message);
      return null;
    }
  }

  /**
   * Mengambil ticker SEMUA pair sekaligus dalam satu request
   * (jauh lebih efisien daripada memanggil getTicker() per-pair
   * saat mau scan ratusan pair).
   * Response asli: { tickers: { btc_idr: {...}, eth_idr: {...}, ... } }
   */
  async getAllTickers() {
    try {
      const response = await fetchPublicWithRetry(`${this.publicBaseUrl}/ticker_all`);

      const data = await response.json();
      return data.tickers || {};
    } catch (error) {
      console.error('[Indodax API Error] Failed to fetch ticker_all:', error.message);
      return {};
    }
  }

  /**
   * Mengambil antrean order book (Bids & Asks)
   * @param {string} pair - Contoh: 'btc_idr'
   */
  async getDepth(pair = 'btc_idr') {
    try {
      const response = await fetchPublicWithRetry(`${this.publicBaseUrl}/${pair}/depth`);
      return await response.json();
    } catch (error) {
      console.error(`[Indodax API Error] Failed to fetch depth (${pair}):`, error.message);
      return null;
    }
  }

  /**
   * Mengambil riwayat transaksi pasar publik terkini
   * @param {string} pair 
   */
  async getTrades(pair = 'btc_idr') {
    try {
      const response = await fetchPublicWithRetry(`${this.publicBaseUrl}/${pair}/trades`);
      return await response.json();
    } catch (error) {
      console.error(`[Indodax API Error] Failed to fetch trades (${pair}):`, error.message);
      return [];
    }
  }

  /**
   * Mengambil metadata SEMUA pair yang terdaftar di Indodax
   * (bukan cuma harga - termasuk base_currency, min order, dst).
   * Di-cache 6 jam karena daftar pair jarang berubah.
   * @param {boolean} forceRefresh - lewati cache, ambil fresh dari Indodax
   */
  async getPairs(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = pairsCache.getValue(PAIRS_CACHE_KEY);
      if (cached) return cached;
    }

    try {
      const response = await fetchPublicWithRetry(`${this.publicBaseUrl}/pairs`);

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Format respons /api/pairs tidak dikenali');
      }

      pairsCache.set(PAIRS_CACHE_KEY, data);
      return data;
    } catch (error) {
      console.error('[Indodax API Error] Failed to fetch pairs list:', error.message);

      // Fallback ke cache basi (kalau ada) daripada kosong total,
      // supaya scanner tidak mendadak kehilangan seluruh daftar pair
      // hanya karena satu request /api/pairs gagal sesaat.
      const stale = pairsCache.getStale(PAIRS_CACHE_KEY);
      return stale ? stale.value : [];
    }
  }

  /**
   * Mengambil daftar ticker_id (mis. "btc_idr") untuk SEMUA pair
   * yang di-quote dalam Rupiah (base_currency === "idr").
   * Ini yang dipakai scanner/dashboard untuk menampilkan semua
   * pair IDR Indodax, bukan daftar hardcode.
   */
  async getIdrPairs(forceRefresh = false) {
    const pairs = await this.getPairs(forceRefresh);

    return pairs
      .filter((p) => p && p.base_currency === 'idr' && p.is_active !== false)
      .map((p) => ({
        pair: p.ticker_id,
        symbol: (p.traded_currency_unit || p.traded_currency || '').toUpperCase(),
        name: p.description || p.symbol || p.ticker_id,
        minOrderIdr: Number(p.trade_min_base_currency) || 0,
      }))
      .filter((p) => !!p.pair);
  }

  // ==========================================
  // PRIVATE API (TAPI) - HMAC-SHA512 AUTH
  //
  // TIDAK ADA RETRY DI BAWAH SINI (SENGAJA). Lihat catatan di
  // retryExecutor/fetchPublicWithRetry di atas file ini.
  // ==========================================

  /**
   * Helper internal untuk mengirim request terotentikasi ke Indodax TAPI
   * @param {string} method - Nama method Indodax API (e.g. 'getInfo', 'trade')
   * @param {Object} params - Parameter tambahan
   */
  async _privateRequest(method, params = {}) {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('[Indodax TAPI Error] API Key atau Secret Key belum diset di .env');
    }

    const payload = {
      method,
      timestamp: Date.now(),
      recvWindow: 5000,
      ...params,
    };

    const postData = querystring.stringify(payload);

    // Generate Signature HMAC-SHA512
    const signature = crypto
      .createHmac('sha512', this.secretKey)
      .update(postData)
      .digest('hex');

    try {
      const response = await fetch(this.privateBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Key: this.apiKey,
          Sign: signature,
        },
        body: postData,
      });

      if (!response.ok) {
        throw new Error(`Private API HTTP Error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success === 0) {
        throw new Error(`Indodax TAPI Error: ${result.error || 'Unknown Error'}`);
      }

      return result.return;
    } catch (error) {
      console.error(`[Indodax TAPI Exception] Method ${method}:`, error.message);
      return null;
    }
  }

  /**
   * Mendapatkan informasi saldo dan akun pasar pengguna
   */
  async getAccountInfo() {
    return await this._privateRequest('getInfo');
  }

  /**
   * Membuat Order Beli atau Jual (Instant / Limit)
   * @param {Object} tradeParams
   * @param {string} tradeParams.pair - e.g. 'btc_idr'
   * @param {'buy'|'sell'} tradeParams.type - Jenis order 'buy' atau 'sell'
   * @param {number} tradeParams.price - Harga per koin
   * @param {number} tradeParams.coinAmount - Jumlah koin yang dibeli/dijual
   */
  async createTrade({ pair, type, price, coinAmount }) {
    const coinSymbol = pair.split('_')[0]; // Ambil 'btc' dari 'btc_idr'

    const params = {
      pair,
      type,
      price: Math.round(price),
      [coinSymbol]: coinAmount,
    };

    return await this._privateRequest('trade', params);
  }

  /**
   * Membatalkan order terbuka yang belum terpenuhi (unfilled order)
   * @param {string} pair - e.g. 'btc_idr'
   * @param {number} orderId - ID Order Indodax
   * @param {'buy'|'sell'} type - Type order
   */
  async cancelOrder(pair, orderId, type) {
    return await this._privateRequest('cancelOrder', {
      pair,
      order_id: orderId,
      type,
    });
  }

  /**
   * Mendapatkan daftar order terbuka yang belum terkesekusi
   * @param {string} pair 
   */
  async getOpenOrders(pair = 'btc_idr') {
    return await this._privateRequest('openOrders', { pair });
  }
}

// Export sebagai Singleton Instance
const indodaxApi = new IndodaxService();
export default indodaxApi;
