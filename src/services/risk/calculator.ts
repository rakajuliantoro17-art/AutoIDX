/**
 * Menghitung level harga Stop-Loss dan Take-Profit berdasarkan persentase
 */
export function calculateTargetPrices(
  entryPrice: number,
  stopLossPercent: number,
  takeProfitPercent: number
) {
  const stopLossPrice = Math.floor(entryPrice * (1 - stopLossPercent / 100));
  const takeProfitPrice = Math.ceil(entryPrice * (1 + takeProfitPercent / 100));
  const riskRewardRatio = Math.round((takeProfitPercent / stopLossPercent) * 100) / 100;

  return {
    stopLossPrice,
    takeProfitPrice,
    riskRewardRatio,
  };
}

/**
 * Menghitung ukuran posisi (position size) IDR berdasarkan persentase alokasi modal
 */
export function calculatePositionSize(
  availableBalanceIdr: number,
  maxAllocationPercent: number,
  minAmountIdr: number = 10000
): number {
  const maxBuyAmount = (availableBalanceIdr * maxAllocationPercent) / 100;
  
  if (maxBuyAmount < minAmountIdr) {
    return 0; // Saldo tidak mencukupi batas minimum order
  }

  return Math.floor(maxBuyAmount);
}
