/**
 * Batas nilai order minimum Indodax (berlaku untuk BUY dan SELL) dan
 * helper murni untuk menghindari posisi yang tidak bisa dijual.
 *
 * Latar belakang: BUY Rp10.000 menghasilkan koin senilai ~Rp9.979 setelah
 * fee, sehingga SELL ditolak "Minimum order ..." sampai harga naik. Stop-loss
 * tidak bisa dieksekusi pada ukuran seperti itu.
 */
export const MIN_ORDER_IDR = 10_000;
/** Perkiraan fee beli (taker) -- konservatif. */
export const ESTIMATED_BUY_FEE_RATE = 0.005;
/** Margin pengaman di atas minimum agar tidak mepet. */
export const MIN_ORDER_SAFETY = 1.05;

export class BelowMinimumOrderError extends Error {
  readonly pair: string;
  readonly valueIdr: number;
  constructor(pair: string, valueIdr: number, message?: string) {
    super(
      message ??
        `Nilai posisi ${pair.toUpperCase()} Rp${Math.round(valueIdr)} di bawah minimum order Indodax Rp${MIN_ORDER_IDR}.`
    );
    this.name = "BelowMinimumOrderError";
    this.pair = pair;
    this.valueIdr = valueIdr;
  }
}

/** Pesan error Indodax untuk order di bawah minimum. */
export function isMinOrderError(message: string | undefined | null): boolean {
  return /minimum order/i.test(message ?? "");
}

export function isBelowMinOrderValue(coinAmount: number, price: number): boolean {
  if (!(coinAmount > 0) || !(price > 0)) return false;
  return coinAmount * price < MIN_ORDER_IDR;
}

/** Nilai posisi (IDR) pada level stop-loss, setelah fee beli. */
export function valueAtStopIdr(tradeAmountIdr: number, stopLossPercent: number): number {
  return tradeAmountIdr * (1 - ESTIMATED_BUY_FEE_RATE) * (1 - stopLossPercent / 100);
}

export interface SellabilityResult {
  ok: boolean;
  valueAtStopIdr: number;
  requiredIdr: number;
  minTradeAmountIdr: number;
}

/** BUY hanya layak jika posisi masih bisa dijual pada level stop-loss. */
export function checkSellableAtStop(tradeAmountIdr: number, stopLossPercent: number): SellabilityResult {
  const required = MIN_ORDER_IDR * MIN_ORDER_SAFETY;
  const value = valueAtStopIdr(tradeAmountIdr, stopLossPercent);
  const denom = (1 - ESTIMATED_BUY_FEE_RATE) * (1 - stopLossPercent / 100);
  return {
    ok: value >= required,
    valueAtStopIdr: value,
    requiredIdr: required,
    minTradeAmountIdr: denom > 0 ? Math.ceil(required / denom / 100) * 100 : Infinity,
  };
}
