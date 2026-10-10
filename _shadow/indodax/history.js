import indodaxApi from './api.js';

/**
 * Service khusus untuk mengelola dan memproses Riwayat Transaksi (History) Indodax
 */
class IndodaxHistoryService {
  /**
   * Mengambil riwayat eksekusi perdagangan (Trade History) pengguna
   * @param {string} pair - Contoh: 'btc_idr'
   * @param {number} count - Jumlah transaksi terakhir yang ingin diambil (default: 20)
   * @param {number} [fromTimestamp] - Timestamp awal dalam milidetik (opsional)
   * @param {number} [toTimestamp] - Timestamp akhir dalam milidetik (opsional)
   */
  async getTradeHistory(pair = 'btc_idr', count = 20, fromTimestamp = null, toTimestamp = null) {
    try {
      const params = {
        pair,
        count,
      };

      if (fromTimestamp) params.from = Math.floor(fromTimestamp / 1000);
      if (toTimestamp) params.to = Math.floor(toTimestamp / 1000);

      const result = await indodaxApi._privateRequest('tradeHistory', params);

      if (!result || !result.trades) {
        return [];
      }

      // Format ulang data agar seragam dan mudah dikonsumsi UI / Firestore
      return result.trades.map((trade) => ({
        tradeId: trade.trade_id,
        orderId: trade.order_id,
        type: trade.type.toUpperCase(), // 'BUY' atau 'SELL'
        price: parseFloat(trade.price),
        amount: parseFloat(trade[pair.split('_')[0]]), // Jumlah koin (misal: btc)
        totalIdr: parseFloat(trade.price) * parseFloat(trade[pair.split('_')[0]]),
        fee: parseFloat(trade.fee || 0),
        timestamp: new Date(parseInt(trade.trade_time) * 1000).toISOString(),
      }));
    } catch (error) {
      console.error(`[History Service Error] Failed to get trade history (${pair}):`, error.message);
      return [];
    }
  }

  /**
   * Mengambil riwayat semua order (termasuk yang sudah dibatalkan/canceled)
   * @param {string} pair - Contoh: 'btc_idr'
   */
  async getOrderHistory(pair = 'btc_idr') {
    try {
      const result = await indodaxApi._privateRequest('orderHistory', { pair });

      if (!result || !result.orders) {
        return [];
      }

      return result.orders.map((order) => ({
        orderId: order.order_id,
        type: order.type.toUpperCase(),
        price: parseFloat(order.price),
        status: order.status, // 'filled', 'cancelled', dll
        submitTime: new Date(parseInt(order.submit_time) * 1000).toISOString(),
        finishTime: order.finish_time ? new Date(parseInt(order.finish_time) * 1000).toISOString() : null,
      }));
    } catch (error) {
      console.error(`[History Service Error] Failed to get order history (${pair}):`, error.message);
      return [];
    }
  }

  /**
   * Menghitung total Profit/Loss (PnL) terealisasi dari riwayat trade
   * @param {string} pair - Contoh: 'btc_idr'
   */
  async calculateRealizedPnL(pair = 'btc_idr') {
    const trades = await this.getTradeHistory(pair, 100);

    let totalBuyVolume = 0;
    let totalBuyCost = 0;
    let totalSellVolume = 0;
    let totalSellRevenue = 0;

    trades.forEach((t) => {
      if (t.type === 'BUY') {
        totalBuyVolume += t.amount;
        totalBuyCost += t.totalIdr;
      } else if (t.type === 'SELL') {
        totalSellVolume += t.amount;
        totalSellRevenue += t.totalIdr;
      }
    });

    const netPnL = totalSellRevenue - totalBuyCost;

    return {
      pair,
      totalBuyCost,
      totalSellRevenue,
      netPnL,
      isProfit: netPnL >= 0,
      tradesCount: trades.length,
    };
  }
}

const indodaxHistoryService = new IndodaxHistoryService();
export default indodaxHistoryService;
