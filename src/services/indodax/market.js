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
