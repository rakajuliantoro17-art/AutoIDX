/**
 * Laporan isi dompet Indodax (BACA-SAJA) dibandingkan dengan catatan bot:
 * posisi terbuka bot_state dan koin "di luar kelolaan". Koin yang tidak
 * dijelaskan keduanya ditandai TAK_TERLACAK (mis. BUY yang timeout tetapi
 * tereksekusi). Fungsi klasifikasi murni agar mudah diuji.
 */
export type HoldingStatus = "DIKELOLA" | "DI_LUAR_KELOLAAN" | "TAK_TERLACAK";

export interface HoldingRow {
  asset: string;
  total: number;
  managedQty: number;
  unmanagedQty: number;
  extraQty: number;
  status: HoldingStatus;
}

const TOLERANCE_RATIO = 0.02;

export function classifyHoldings(input: {
  balances: Record<string, number>;
  open: Record<string, number>;
  unmanaged: Record<string, number>;
}): HoldingRow[] {
  const rows: HoldingRow[] = [];
  for (const [asset, totalRaw] of Object.entries(input.balances)) {
    if (asset === "idr") continue;
    const total = Number(totalRaw);
    if (!Number.isFinite(total) || total <= 1e-8) continue;
    const managedQty = input.open[asset] ?? 0;
    const unmanagedQty = input.unmanaged[asset] ?? 0;
    const extraQty = total - managedQty - unmanagedQty;
    let status: HoldingStatus;
    if (extraQty > Math.max(total * TOLERANCE_RATIO, 1e-8)) status = "TAK_TERLACAK";
    else if (managedQty > 0) status = "DIKELOLA";
    else status = "DI_LUAR_KELOLAAN";
    rows.push({ asset, total, managedQty, unmanagedQty, extraQty: Math.max(extraQty, 0), status });
  }
  return rows.sort((a, b) => a.asset.localeCompare(b.asset));
}
