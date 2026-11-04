/**
 * Memilih watchlist awal yang SEIMBANG antara risiko RENDAH / SEDANG / TINGGI.
 *
 * Scanner tidak mengisi riskLevel, jadi tingkat risiko diturunkan dari
 * volatilitas relatif (priceRangePercent = (high-low)/close pada jendela
 * candle scanner): sepertiga terendah = LOW, tengah = MEDIUM, tertinggi = HIGH
 * (relatif terhadap pool yang lolos scanner saat itu). Dalam tiap tingkat,
 * pair dengan opportunityScore tertinggi dipilih. Murni, tanpa I/O.
 */
export type RiskTier = "LOW" | "MEDIUM" | "HIGH";

export interface PoolItem {
  pair: string;
  opportunityScore: number;
  priceRangePercent?: number;
  volIdr?: number;
}

export interface PickedPair {
  pair: string;
  tier: RiskTier;
  score: number;
  rangePercent: number;
}

export const DEFAULT_QUOTAS: Record<RiskTier, number> = { LOW: 3, MEDIUM: 4, HIGH: 3 };
const PAIR_RE = /^[a-z0-9]{2,12}_idr$/;
const TIERS: RiskTier[] = ["LOW", "MEDIUM", "HIGH"];

export function pickBalancedWatchlist(
  pool: PoolItem[],
  quotas: Record<RiskTier, number> = DEFAULT_QUOTAS
): PickedPair[] {
  const seen = new Set<string>();
  const items = pool
    .map((p) => ({
      pair: String(p.pair ?? "").trim().toLowerCase(),
      score: Number(p.opportunityScore) || 0,
      range: Number(p.priceRangePercent),
    }))
    .filter((p) => PAIR_RE.test(p.pair) && Number.isFinite(p.range) && p.range >= 0)
    .filter((p) => (seen.has(p.pair) ? false : (seen.add(p.pair), true)));

  const target = TIERS.reduce((n, t) => n + quotas[t], 0);
  if (items.length === 0) return [];

  const byRange = [...items].sort((a, b) => a.range - b.range);
  const n = byRange.length;
  const tierOf = (idx: number): RiskTier => (idx < n / 3 ? "LOW" : idx < (2 * n) / 3 ? "MEDIUM" : "HIGH");

  const buckets: Record<RiskTier, typeof items> = { LOW: [], MEDIUM: [], HIGH: [] };
  byRange.forEach((it, idx) => buckets[tierOf(idx)].push(it));
  for (const t of TIERS) buckets[t].sort((a, b) => b.score - a.score);

  const picked: PickedPair[] = [];
  const take = (t: RiskTier, count: number) => {
    for (let i = 0; i < count && buckets[t].length > 0; i++) {
      const it = buckets[t].shift()!;
      picked.push({ pair: it.pair, tier: t, score: it.score, rangePercent: it.range });
    }
  };

  for (const t of TIERS) take(t, quotas[t]);

  // Tingkat kekurangan: isi dari tingkat lain (MEDIUM dulu agar tetap moderat).
  const fillOrder: RiskTier[] = ["MEDIUM", "LOW", "HIGH"];
  while (picked.length < target) {
    const t = fillOrder.find((x) => buckets[x].length > 0);
    if (!t) break;
    take(t, 1);
  }

  return picked;
}
