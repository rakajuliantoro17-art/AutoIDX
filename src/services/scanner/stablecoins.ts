/** Stablecoin tidak bergerak cukup untuk target profit dan hanya menanggung biaya; dikeluarkan dari kandidat. */
const STABLE_BASES = new Set(["usdt", "usdc", "dai", "busd", "tusd", "fdusd", "usdd", "usdp", "idrt", "bidr"]);

export function isStablecoinPair(pair: string): boolean {
  const base = pair.trim().toLowerCase().split("_")[0];
  return STABLE_BASES.has(base);
}
