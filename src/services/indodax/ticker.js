// src/services/indodax/ticker.js
import indodaxApi from './api.js';

/**
 * Service khusus untuk pengelolaan dan transformasi Ticker Indodax
 */
class IndodaxTickerService {
  constructor() {
    this._prices24hCache = null;
    this._prices24hCacheAt = 0;
    this._prices24hPromise = null;
    this._CACHE_TTL_MS = 60_000; // 1 menit
  }

  async _getPrices24h() {
    const now = Date.now();

    if (this._prices24hCache && now - this._prices24hCacheAt < this._CACHE_TTL_MS) {
      return this._prices24hCache;
    }

    if (this._prices24hPromise) {
      return this._prices24hPromise;
    }

    this._prices24hPromise = (async () => {
      try {
        const response = await fetch('https://indodax.com/api/ticker_all');
        if (!response.ok) throw new Error(`ticker_all failed: ${response.status}`);
        const data = await response.json();

        this._prices24hCache = data.prices_24h || {};
        this._prices24hCacheAt = Date.now();
        return this._prices24hCache;
      } catch (error) {
        console.error('[Ticker Service Error] Gagal mengambil ticker_all:', error.message);
        return this._prices24hCache || {};
      } finally {
        this._prices24hPromise = null;
      }
    })();

    return this._prices24hPromise;
  }

  async _calculateChange24h(pair, lastPrice) {
    const prices24h = await this._getPrices24h();
    const key = pair.replace('_', '').toLowerCase();
    const priceBefore = parseFloat(prices24h[key]);

    if (!priceBefore || priceBefore === 0 || isNaN(priceBefore)) {
      return 0;
    }

    return Math.round(((lastPrice - priceBefore) / priceBefore) * 100 * 100) / 100;
  }

  async getFormattedTicker(pair = 'btc_idr') {
    try {
      const rawTicker = await indodaxApi.getTicker(pair);
      if (!rawTicker) {
        throw new Error(`Data ticker tidak ditemukan untuk ${pair}`);
      }

      const baseCoin = pair.split('_')[0];
      const lastPrice = parseFloat(rawTicker.last);
      const change24h = await this._calculateChange24h(pair, lastPrice);

      return {
        pair: pair.toLowerCase(),
        symbol: baseCoin.toUpperCase(),
        lastPrice,
        high24h: parseFloat(rawTicker.high),
        low24h: parseFloat(rawTicker.low),
        change24h,
        buyPrice: parseFloat(rawTicker.buy),
        sellPrice: parseFloat(rawTicker.sell),
        volCoin: parseFloat(rawTicker[`vol_${baseCoin}`] || 0),
        volIdr: parseFloat(rawTicker.vol_idr || 0),
        serverTime: parseInt(rawTicker.server_time, 10),
        timestamp: new Date(parseInt(rawTicker.server_time, 10) * 1000).toISOString(),
      };
    } catch (error) {
      console.error(`[Ticker Service Error] ${error.message}`);
      return null;
    }
  }

  async getMultipleTickers(pairs = ['btc_idr', 'eth_idr', 'sol_idr']) {
    try {
      const tickerPromises = pairs.map((pair) => this.getFormattedTicker(pair));
      const results = await Promise.all(tickerPromises);
      return results.filter((ticker) => ticker !== null);
    } catch (error) {
      console.error('[Ticker Service Error] Gagal mengambil multiple tickers:', error.message);
      return [];
    }
  }

  calculateVolatilityRange(lastPrice, low24h, high24h) {
    if (high24h === low24h) return 0;
    const range = high24h - low24h;
    const positionPercentage = ((lastPrice - low24h) / range) * 100;
    return Math.round(positionPercentage * 100) / 100;
  }
}

const indodaxTickerService = new IndodaxTickerService();
export default indodaxTickerService;
