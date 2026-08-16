import indodaxApi from './api.js';

/**
 * Service khusus untuk mengolah dan memformat Data Pasar (Market Data) Indodax
 */
class IndodaxMarketService {
  /**
   * Mengambil ringkasan data ticker pasar (Harga Terakhir, High, Low, Volume)
   * @param {string} pair - Contoh: 'btc_idr'
   */
  async getMarketSummary(pair = 'btc_idr') {
    try {
      const ticker = await indodaxApi.getTicker(pair);

      if (!ticker) {
        throw new Error(`Gagal mendapatkan data ticker untuk pair ${pair}`);
      }

      return {
        pair: pair.toUpperCase(),
        lastPrice: parseFloat(ticker.last),
        high24h: parseFloat(ticker.high),
        low24h: parseFloat(ticker.low),
        buyPrice: parseFloat(ticker.buy),
        sellPrice: parseFloat(ticker.sell),
        volCoin: parseFloat(ticker[`vol_${pair.split('_')[0]}`] || 0),
        volIdr: parseFloat(ticker.vol_idr || 0),
        serverTime: new Date(parseInt(ticker.server_time) * 1000).toISOString(),
      };
    } catch (error) {
      console.error(`[Market Service Error] ${error.message}`);
      return null;
    }
  }

  /**
   * Mengambil Order Book Depth (Bids & Asks) yang telah dirapikan
   * @param {string} pair - Contoh: 'btc_idr'
   * @param {number} depthLimit - Jumlah kedalaman antrean (default: 10)
   */
  async getOrderBookDepth(pair = 'btc_idr', depthLimit = 10) {
    try {
      const depth = await indodaxApi.getDepth(pair);

      if (!depth) {
        return { bids: [], asks: [] };
      }

      const bids = (depth.buy || []).slice(0, depthLimit).map((item) => ({
        price: parseFloat(item[0]),
        amount: parseFloat(item[1]),
        totalIdr: parseFloat(item[0]) * parseFloat(item[1]),
      }));

      const asks = (depth.sell || []).slice(0, depthLimit).map((item) => ({
        price: parseFloat(item[0]),
        amount: parseFloat(item[1]),
        totalIdr: parseFloat(item[0]) * parseFloat(item[1]),
      }));

      return { bids, asks };
    } catch (error) {
      console.error(`[Market Service Error] Failed to fetch depth: ${error.message}`);
      return { bids: [], asks: [] };
    }
  }

  /**
   * Mengambil deret harga eksekusi pasar terkini untuk rekonstruksi candle/harga teknikal
   * @param {string} pair - Contoh: 'btc_idr'
   * @param {number} limit - Jumlah riwayat transaksi pasar yang diambil (default: 50)
   * @returns {Promise<number[]>} Array harga penutupan/eksekusi terkini (dari terlama ke terbaru)
   */
  async getPriceSeries(pair = 'btc_idr', limit = 50) {
    try {
      const rawTrades = await indodaxApi.getTrades(pair);

      if (!Array.isArray(rawTrades) || rawTrades.length === 0) {
        return [];
      }

      // Potong sesuai limit, lalu urutkan dari transaksi terlama ke terbaru
      const priceSeries = rawTrades
        .slice(0, limit)
        .reverse()
        .map((trade) => parseFloat(trade.price));

      return priceSeries;
    } catch (error) {
      console.error(`[Market Service Error] Failed to build price series: ${error.message}`);
      return [];
    }
  }

  /**
   * Mengambil seluruh pair yang di-quote dalam Rupiah (IDR) di Indodax
   * (bukan daftar hardcode - ditarik langsung dari /api/pairs, di-cache
   * 6 jam). Dipakai scanner supaya bisa memindai semua pair IDR, bukan
   * cuma beberapa pair populer.
   * @returns {Promise<{pair:string, symbol:string, name:string, minOrderIdr:number}[]>}
   */
  async getAllIdrPairs() {
    try {
      return await indodaxApi.getIdrPairs();
    } catch (error) {
      console.error('[Market Service Error] Failed to fetch IDR pairs list:', error.message);
      return [];
    }
  }

  /**
   * Mengambil daftar ticker_id SEMUA pair IDR dalam bentuk array string
   * (mis. ["btc_idr", "eth_idr", ...]) -- dipakai scanner untuk membangun
   * "universe" pair yang dipindai kalau tidak diberi daftar spesifik.
   * @returns {Promise<string[]>}
   */
  async getAllTradingPairs() {
    try {
      const idrPairs = await this.getAllIdrPairs();
      return idrPairs.map((p) => p.pair);
    } catch (error) {
      console.error('[Market Service Error] Failed to build trading pairs list:', error.message);
      return [];
    }
  }

  /**
   * Mengambil snapshot ticker SEMUA pair sekaligus dalam satu request
   * (GET /api/ticker_all), termasuk change24h yang dihitung dari
   * prices_24h bawaan endpoint yang sama. Dipakai scanner supaya bisa
   * prefilter volume/perubahan harga TANPA request ticker per-pair.
   * @returns {Promise<{pair:string, symbol:string, lastPrice:number, high24h:number, low24h:number, change24h:number, buyPrice:number, sellPrice:number, volCoin:number, volIdr:number, serverTime?:number}[]>}
   */
  async getSummaryTickers() {
    try {
      const response = await fetch('https://indodax.com/api/ticker_all');

      if (!response.ok) {
        throw new Error(`ticker_all failed: ${response.status}`);
      }

      const data = await response.json();
      const tickers = data.tickers || {};
      const prices24h = data.prices_24h || {};

      const snapshot = Object.keys(tickers)
        .map((pair) => {
          const ticker = tickers[pair];

          if (!ticker) {
            return null;
          }

          const baseCoin = pair.split('_')[0];
          const lastPrice = parseFloat(ticker.last);
          const change24hKey = pair.replace('_', '').toLowerCase();
          const priceBefore = parseFloat(prices24h[change24hKey]);

          let change24h = 0;
          const hasValidPriceBefore = priceBefore && priceBefore !== 0 && !isNaN(priceBefore);
          if (hasValidPriceBefore) {
            change24h = Math.round(((lastPrice - priceBefore) / priceBefore) * 100 * 100) / 100;
          }

          return {
            pair,
            symbol: baseCoin.toUpperCase(),
            lastPrice,
            high24h: parseFloat(ticker.high),
            low24h: parseFloat(ticker.low),
            change24h,
            buyPrice: parseFloat(ticker.buy),
            sellPrice: parseFloat(ticker.sell),
            volCoin: parseFloat(ticker[`vol_${baseCoin}`] || 0),
            volIdr: parseFloat(ticker.vol_idr || 0),
            serverTime: parseInt(ticker.server_time, 10),
          };
        })
        .filter((item) => item !== null);

      return snapshot;
    } catch (error) {
      console.error('[Market Service Error] Failed to fetch summary tickers:', error.message);
      return [];
    }
  }

  /**
   * Memeriksa spread persentase antara harga Beli terbaik (Best Bid) dan Jual terbaik (Best Ask)
   * @param {string} pair 
   */
  async getMarketSpread(pair = 'btc_idr') {
    const summary = await this.getMarketSummary(pair);
    if (!summary) return null;

    const spreadIdr = summary.sellPrice - summary.buyPrice;
    const spreadPercentage = (spreadIdr / summary.buyPrice) * 100;

    return {
      pair,
      bestBid: summary.buyPrice,
      bestAsk: summary.sellPrice,
      spreadIdr,
      spreadPercentage: Math.round(spreadPercentage * 100) / 100,
    };
  }
}

const indodaxMarketService = new IndodaxMarketService();
export default indodaxMarketService;
