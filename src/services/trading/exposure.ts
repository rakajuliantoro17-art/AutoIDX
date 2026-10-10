/**
==========================================================
AURA Trade OS
Portfolio Exposure Check (fungsi murni)
Version : 0.1.0

Pengecekan engine.ts yang ada membandingkan nilai SATU trade baru
dengan persentase ekuitas; total nilai posisi yang SUDAH terbuka
tidak ikut dihitung. Modul ini menambah batas TOTAL: (nilai posisi
terbuka + trade baru) <= maxPercent dari ekuitas total (kas +
nilai beli posisi terbuka). Diadaptasi dari ExposureManager.canOpen
(_shadow/execution), dipakai di balik flag `portfolioExposureLimit`.
==========================================================
*/

export interface PortfolioExposureResult {
  allowed: boolean;
  currentExposureIdr: number;
  totalEquityIdr: number;
  limitIdr: number;
  afterTradePercent: number;
}

export function checkPortfolioExposure(
  currentExposureIdr: number,
  tradeAmountIdr: number,
  cashIdr: number,
  maxPercent: number
): PortfolioExposureResult {
  const totalEquityIdr = Math.max(0, cashIdr) + Math.max(0, currentExposureIdr);
  const limitIdr = (maxPercent / 100) * totalEquityIdr;
  const after = currentExposureIdr + tradeAmountIdr;

  return {
    allowed: totalEquityIdr > 0 && after <= limitIdr,
    currentExposureIdr,
    totalEquityIdr,
    limitIdr,
    afterTradePercent: totalEquityIdr > 0 ? (after / totalEquityIdr) * 100 : 100,
  };
}
