export interface RiskConfig {
  maxAllocationPercent: number; // Maksimal % saldo IDR yang digunakan per trade (misal: 20%)
  stopLossPercent: number;      // Persentase Stop Loss dasar (misal: 2.0%)
  takeProfitPercent: number;    // Persentase Take Profit dasar (misal: 4.0%)
  maxDailyLossPercent: number;  // Batas maksimal rugi harian sebelum bot pause (misal: 5.0%)
  minOrderAmountIdr: number;    // Minimal nominal transaksi Indodax (Rp 10.000)
}

export interface RiskEvaluation {
  isAllowed: boolean;
  reason: string;
  calculatedAmountIdr: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  riskRewardRatio: number;
}
