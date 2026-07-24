import { RiskConfig, RiskEvaluation } from './types';
import { calculateTargetPrices, calculatePositionSize } from './calculator';

export class RiskManager {
  private config: RiskConfig;

  constructor(config?: Partial<RiskConfig>) {
    this.config = {
      maxAllocationPercent: config?.maxAllocationPercent ?? 20,
      stopLossPercent: config?.stopLossPercent ?? 2.0,
      takeProfitPercent: config?.takeProfitPercent ?? 4.0,
      maxDailyLossPercent: config?.maxDailyLossPercent ?? 5.0,
      minOrderAmountIdr: config?.minOrderAmountIdr ?? 10000,
    };
  }

  /**
   * Evaluasi keamanan sebelum melakukan eksekusi order BUY
   */
  evaluateBuySignal(
    currentPrice: number,
    availableBalanceIdr: number
  ): RiskEvaluation {
    // 1. Hitung alokasi pembelian aman
    const buyAmountIdr = calculatePositionSize(
      availableBalanceIdr,
      this.config.maxAllocationPercent,
      this.config.minOrderAmountIdr
    );

    if (buyAmountIdr < this.config.minOrderAmountIdr) {
      return {
        isAllowed: false,
        reason: `Saldo IDR tidak cukup untuk memenuhi batas minimum order (Rp ${this.config.minOrderAmountIdr.toLocaleString('id-ID')}).`,
        calculatedAmountIdr: 0,
        stopLossPrice: 0,
        takeProfitPrice: 0,
        riskRewardRatio: 0,
      };
    }

    // 2. Hitung Stop Loss & Take Profit Targets
    const { stopLossPrice, takeProfitPrice, riskRewardRatio } = calculateTargetPrices(
      currentPrice,
      this.config.stopLossPercent,
      this.config.takeProfitPercent
    );

    // 3. Validasi Risk to Reward Ratio minimum (Min 1:1.5)
    if (riskRewardRatio < 1.5) {
      return {
        isAllowed: false,
        reason: `Risk-to-Reward Ratio (${riskRewardRatio}) di bawah batas minimum aman (1.5).`,
        calculatedAmountIdr: buyAmountIdr,
        stopLossPrice,
        takeProfitPrice,
        riskRewardRatio,
      };
    }

    return {
      isAllowed: true,
      reason: 'Sinyal memenuhi kriteria Risk Management & Capital Allocation.',
      calculatedAmountIdr: buyAmountIdr,
      stopLossPrice,
      takeProfitPrice,
      riskRewardRatio,
    };
  }

  /**
   * Pengecekan apakah posisi saat ini sudah menyentuh kondisi Stop Loss atau Take Profit
   */
  checkExitCondition(
    entryPrice: number,
    currentPrice: number
  ): 'STOP_LOSS' | 'TAKE_PROFIT' | 'HOLD' {
    const { stopLossPrice, takeProfitPrice } = calculateTargetPrices(
      entryPrice,
      this.config.stopLossPercent,
      this.config.takeProfitPercent
    );

    if (currentPrice <= stopLossPrice) {
      return 'STOP_LOSS';
    }

    if (currentPrice >= takeProfitPrice) {
      return 'TAKE_PROFIT';
    }

    return 'HOLD';
  }
}

const riskManager = new RiskManager();
export default riskManager;
export * from './types';
export * from './calculator';
