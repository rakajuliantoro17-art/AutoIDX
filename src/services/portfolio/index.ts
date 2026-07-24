import indodaxApi from '../indodax/api.js';
import indodaxTickerService from '../indodax/ticker.js';
import { PortfolioSummary, AssetBalance } from './types';
import { calculateAssetRatios } from './calculator';

class PortfolioService {
  /**
   * Mengambil dan mengkalkulasi seluruh nilai portofolio akun Indodax
   */
  async getPortfolioSummary(): Promise<PortfolioSummary | null> {
    try {
      // 1. Ambil info akun & saldo dari Private API
      const accountInfo = await indodaxApi.getAccountInfo();
      if (!accountInfo || !accountInfo.balance) {
        throw new Error('Gagal mengambil data saldo akun Indodax');
      }

      const rawBalances = accountInfo.balance; // e.g. { btc: "0.05", idr: "1000000" }
      const rawFrozen = accountInfo.balance_hold || {};

      const assets: AssetBalance[] = [];
      let totalBalanceIdr = 0;
      let cryptoBalanceIdr = 0;

      // 2. Olah saldo IDR murni
      const freeIdr = parseFloat(rawBalances.idr || '0');
      const frozenIdr = parseFloat(rawFrozen.idr || '0');
      const totalIdr = freeIdr + frozenIdr;

      assets.push({
        symbol: 'IDR',
        free: freeIdr,
        frozen: frozenIdr,
        total: totalIdr,
        estimatedIdr: totalIdr,
      });

      totalBalanceIdr += totalIdr;

      // 3. Olah saldo Kripto & konversi nilainya ke IDR via Ticker
      const cryptoKeys = Object.keys(rawBalances).filter((k) => k !== 'idr');

      for (const coin of cryptoKeys) {
        const freeCoin = parseFloat(rawBalances[coin] || '0');
        const frozenCoin = parseFloat(rawFrozen[coin] || '0');
        const totalCoin = freeCoin + frozenCoin;

        if (totalCoin > 0) {
          const pair = `${coin}_idr`;
          const ticker = await indodaxTickerService.getFormattedTicker(pair);
          const price = ticker ? ticker.lastPrice : 0;
          const estimatedIdr = Math.round(totalCoin * price);

          assets.push({
            symbol: coin.toUpperCase(),
            free: freeCoin,
            frozen: frozenCoin,
            total: totalCoin,
            estimatedIdr,
          });

          cryptoBalanceIdr += estimatedIdr;
          totalBalanceIdr += estimatedIdr;
        }
      }

      // 4. Hitung Rasio Alokasi
      const { idrRatioPercentage, cryptoRatioPercentage } = calculateAssetRatios(
        assets,
        totalBalanceIdr
      );

      return {
        totalBalanceIdr: Math.round(totalBalanceIdr),
        idrBalance: Math.round(totalIdr),
        cryptoBalanceIdr: Math.round(cryptoBalanceIdr),
        idrRatioPercentage,
        cryptoRatioPercentage,
        assets,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('[Portfolio Service Error]:', error?.message || error);
      return null;
    }
  }
}

const portfolioService = new PortfolioService();
export default portfolioService;
export * from './types';
export * from './calculator';
