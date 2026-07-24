import crypto from 'crypto';
import querystring from 'querystring';

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
      const response = await fetch(`${this.publicBaseUrl}/${pair}/ticker`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Public API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.ticker;
    } catch (error) {
      console.error(`[Indodax API Error] Failed to fetch ticker (${pair}):`, error.message);
      return null;
    }
  }

  /**
   * Mengambil antrean order book (Bids & Asks)
   * @param {string} pair - Contoh: 'btc_idr'
   */
  async getDepth(pair = 'btc_idr') {
    try {
      const response = await fetch(`${this.publicBaseUrl}/${pair}/depth`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
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
      const response = await fetch(`${this.publicBaseUrl}/${pair}/trades`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`[Indodax API Error] Failed to fetch trades (${pair}):`, error.message);
      return [];
    }
  }

  // ==========================================
  // PRIVATE API (TAPI) - HMAC-SHA512 AUTH
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
