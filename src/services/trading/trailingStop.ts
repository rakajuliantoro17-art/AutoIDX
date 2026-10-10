/**
==========================================================
AURA Trade OS
Trailing Stop (fungsi murni)
Version : 0.1.0

Stop-loss hanya BOLEH NAIK (tidak pernah turun). Aktif hanya saat
harga di atas harga beli. Kandidat stop = harga sekarang dikurangi
trailPercent. Dipakai engine.ts di balik flag `trailingStop` dan
env TRAILING_STOP_ENABLED=true (persen: TRAILING_STOP_PERCENT).
==========================================================
*/

export const MIN_TRAIL_PERCENT = 0.3;
export const MAX_TRAIL_PERCENT = 10;

export function clampTrailPercent(value: number): number {
  if (!Number.isFinite(value)) return 1.5;
  return Math.min(MAX_TRAIL_PERCENT, Math.max(MIN_TRAIL_PERCENT, value));
}

/**
 * @returns stop-loss baru (lebih tinggi) atau null bila tidak ada perubahan.
 */
export function calculateTrailingStop(
  entryPrice: number,
  currentPrice: number,
  currentStopLoss: number,
  trailPercent: number
): number | null {
  if (!(entryPrice > 0) || !(currentPrice > 0)) return null;
  if (currentPrice <= entryPrice) return null;

  const candidate = currentPrice * (1 - clampTrailPercent(trailPercent) / 100);

  if (!(candidate > currentStopLoss)) return null;
  if (candidate >= currentPrice) return null;

  return candidate;
}
