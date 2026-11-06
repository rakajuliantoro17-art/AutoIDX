/**
 * Perkiraan PnL realisasi satu siklus BUY->SELL (IDR), setelah fee.
 *
 * Fee beli (~0,22%) dipotong dari koin: jumlah koin yang dipegang (amount)
 * sudah bersih, jadi biaya IDR sebenarnya = entryPrice * amount / (1 - feeBeli).
 * Fee jual (~0,41%, terlihat di riwayat trade Indodax) dipotong dari hasil jual.
 * Ini PERKIRAAN: harga isi riil dan fee bisa sedikit berbeda.
 */
export const BUY_FEE_RATE = 0.0022;
export const SELL_FEE_RATE = 0.0041;

export function estimateRealizedPnlIdr(input: {
  entryPrice: number;
  exitPrice: number;
  amount: number;
  buyFeeRate?: number;
  sellFeeRate?: number;
}): number | undefined {
  const { entryPrice, exitPrice, amount } = input;
  if (![entryPrice, exitPrice, amount].every((n) => Number.isFinite(n) && n > 0)) return undefined;
  const buyFee = input.buyFeeRate ?? BUY_FEE_RATE;
  const sellFee = input.sellFeeRate ?? SELL_FEE_RATE;
  if (buyFee < 0 || buyFee >= 1 || sellFee < 0 || sellFee >= 1) return undefined;
  const cost = (entryPrice * amount) / (1 - buyFee);
  const proceeds = exitPrice * amount * (1 - sellFee);
  return Math.round(proceeds - cost);
}
