/**
 * Uji izin trade API key TANPA memindahkan uang: pasang satu limit BUY jauh di
 * bawah harga pasar (tidak akan terisi), pastikan Indodax menerimanya, lalu
 * batalkan dan verifikasi tidak ada order tersisa.
 *
 * Murni terhadap antarmuka `TradeTestClient` supaya bisa diuji dengan klien palsu.
 */
export interface TradeTestClient {
  getLastPrice(pair: string): Promise<number | null>;
  placeLimitBuy(p: { pair: string; price: number; idr: number }): Promise<
    { success: true; orderId: string } | { success: false; message: string }
  >;
  cancel(p: { pair: string; orderId: string }): Promise<{ success: true } | { success: false; message: string }>;
  openOrderIds(pair: string): Promise<string[] | null>;
}

export interface TradeTestOptions {
  pair?: string;
  idr?: number;
  /** Diskon dari harga terakhir; 0.4 = 40% di bawah pasar. */
  discount?: number;
  /** Pembulatan harga ke bawah (kelipatan ini selalu valid sebagai tick). */
  roundTo?: number;
  cancelAttempts?: number;
  sleep?: (ms: number) => Promise<void>;
}

export type TradeTestVerdict =
  | "PERMISSION_OK"
  | "PLACE_REJECTED"
  | "NO_PRICE"
  | "CANCEL_FAILED_ORDER_OPEN";

export interface TradeTestReport {
  ok: boolean;
  verdict: TradeTestVerdict;
  pair: string;
  price?: number;
  orderId?: string;
  cancelled?: boolean;
  verifiedGone?: boolean | null;
  message: string;
}

export function farLimitPrice(last: number, discount: number, roundTo: number): number {
  return Math.floor((last * (1 - discount)) / roundTo) * roundTo;
}

export async function runTradePermissionTest(
  client: TradeTestClient,
  opts: TradeTestOptions = {}
): Promise<TradeTestReport> {
  const pair = opts.pair ?? "btc_idr";
  const idr = opts.idr ?? 10_000;
  const discount = opts.discount ?? 0.4;
  const roundTo = opts.roundTo ?? 1_000_000;
  const attempts = opts.cancelAttempts ?? 3;
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));

  const last = await client.getLastPrice(pair);
  if (!last || !Number.isFinite(last) || last <= 0) {
    return { ok: false, verdict: "NO_PRICE", pair, message: "Harga pasar tidak terbaca; uji dibatalkan, tidak ada order dikirim." };
  }
  const price = farLimitPrice(last, discount, roundTo);
  if (price <= 0 || price >= last * 0.7) {
    return { ok: false, verdict: "NO_PRICE", pair, message: "Harga uji tidak aman (terlalu dekat pasar); uji dibatalkan." };
  }

  const placed = await client.placeLimitBuy({ pair, price, idr });
  if (!placed.success) {
    return { ok: false, verdict: "PLACE_REJECTED", pair, price, message: `Indodax menolak order uji: ${placed.message}` };
  }

  let cancelled = false;
  let lastErr = "";
  for (let i = 0; i < attempts && !cancelled; i++) {
    const c = await client.cancel({ pair, orderId: placed.orderId });
    if (c.success) cancelled = true;
    else {
      lastErr = c.message;
      if (i < attempts - 1) await sleep(700);
    }
  }

  const open = await client.openOrderIds(pair);
  const verifiedGone = open === null ? null : !open.includes(placed.orderId);

  if (!cancelled && verifiedGone !== true) {
    return {
      ok: false, verdict: "CANCEL_FAILED_ORDER_OPEN", pair, price, orderId: placed.orderId, cancelled: false, verifiedGone,
      message: `Izin trade DITERIMA, tetapi pembatalan gagal (${lastErr}). Batalkan manual order ${placed.orderId} (${pair.toUpperCase()}, harga ${price}) di Indodax SEKARANG.`,
    };
  }

  return {
    ok: true, verdict: "PERMISSION_OK", pair, price, orderId: placed.orderId, cancelled: true, verifiedGone,
    message: verifiedGone === null
      ? "Izin trade diterima dan order dibatalkan; daftar order terbuka tidak bisa diverifikasi."
      : "Izin trade diterima, order uji dibatalkan, dan tidak ada order tersisa.",
  };
}
