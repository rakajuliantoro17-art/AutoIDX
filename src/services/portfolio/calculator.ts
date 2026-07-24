import { AssetBalance, PositionPnL } from './types';

/**
 * Menghitung Unrealized Profit/Loss (PnL) untuk posisi yang sedang terbuka
 */
export function calculateUnrealizedPnL(
  pair: string,
  buyPrice: number,
  currentPrice: number,
  amount: number
): PositionPnL {
  const costBasisIdr = buyPrice * amount;
  const currentValueIdr = currentPrice * amount;
  const pnlIdr = currentValueIdr - costBasisIdr;
  const pnlPercentage = costBasisIdr > 0 ? (pnlIdr / costBasisIdr) * 100 : 0;

  return {
    pair,
    buyPrice,
    currentPrice,
    amount,
    costBasisIdr: Math.round(costBasisIdr),
    currentValueIdr: Math.round(currentValueIdr),
    pnlIdr: Math.round(pnlIdr),
    pnlPercentage: Math.round(pnlPercentage * 100) / 100,
    isProfit: pnlIdr >= 0,
  };
}

/**
 * Menghitung persentase alokasi koin terhadap total nilai portofolio
 */
export function calculateAssetRatios(assets: AssetBalance[], totalBalanceIdr: number) {
  if (totalBalanceIdr === 0) return { idrRatioPercentage: 100, cryptoRatioPercentage: 0 };

  const idrAsset = assets.find((a) => a.symbol === 'IDR');
  const idrValue = idrAsset ? idrAsset.estimatedIdr : 0;

  const idrRatioPercentage = (idrValue / totalBalanceIdr) * 100;
  const cryptoRatioPercentage = 100 - idrRatioPercentage;

  return {
    idrRatioPercentage: Math.round(idrRatioPercentage * 100) / 100,
    cryptoRatioPercentage: Math.round(cryptoRatioPercentage * 100) / 100,
  };
}
