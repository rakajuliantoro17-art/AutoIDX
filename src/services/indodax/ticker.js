import indodaxApi from './api.js';

/**
 * Service khusus untuk pengelolaan dan transformasi Ticker Indodax
 */
class IndodaxTickerService {
  /**
   * Mengambil dan memformat data ticker tunggal
   * @param {string} pair - Pasangan perdagangan (misal: 'btc_idr', 'eth_idr')
   */
  async getFormattedTicker(pair = 'btc_idr') {
    try {
      const rawTicker = await indodaxApi.getTicker(pair);

      if (!rawTicker) {
        throw new Error(`Data ticker tidak ditemukan untuk ${pair}`);
      }

      const baseCoin = pair.split('_')[0]; // Ambil 'btc' dari 'btc_idr'

      return {
        pair: pair.toLowerCase(),
        symbol: baseCoin.toUpperCase(),
        lastPrice: parseFloat(rawTicker.last),
        high24h: parseFloat(rawTicker.high),
        low24h: parseFloat(rawTicker.low),
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

  /**
   * Mengambil ticker untuk banyak pair sekaligus secara paralel
   * @param {string[]} pairs - Array list pair, contoh: ['btc_idr', 'eth_idr', 'sol_idr']
   */
  async getMultipleTickers(pairs = ['btc_idr', 'eth_idr', 'sol_idr']) {
    try {
      const tickerPromises = pairs.map((pair) => this.getFormattedTicker(pair));
      const results = await Promise.all(tickerPromises);

      // Filter out null result jika ada API yang gagal
      return results.filter((ticker) => ticker !== null);
    } catch (error) {
      console.error('[Ticker Service Error] Gagal mengambil multiple tickers:', error.message);
      return [];
    }
  }

  /**
   * Menghitung persentase estimasi pergerakan harga harian berdasarkan High & Low
   * @param {number} lastPrice 
   * @param {number} low24h 
   * @param {number} high24h 
   */
  calculateVolatilityRange(lastPrice, low24h, high24h) {
    if (high24h === low24h) return 0;
    const range = high24h - low24h;
    const positionPercentage = ((lastPrice - low24h) / range) * 100;
    return Math.round(positionPercentage * 100) / 100;
  }
}

const indodaxTickerService = new IndodaxTickerService();
export default indodaxTickerService;
