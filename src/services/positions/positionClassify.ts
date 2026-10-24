/** Klasifikasi posisi lokal vs saldo Indodax (fungsi murni, tanpa Firebase, mudah diuji). */
export type PositionStatus = "COCOK" | "HANTU" | "SELISIH";

export interface PositionRow {
  pair: string;
  localQty: number;
  entryPrice: number;
  exchangeQty: number;
  status: PositionStatus;
  /** Nilai posisi (IDR) pada harga pasar terakhir; undefined bila harga tak tersedia. */
  valueIdr?: number;
  /** true bila posisi di bawah minimum order dan boleh dilepas dari bot. */
  releasable?: boolean;
}

/** Saldo di bawah ambang ini (relatif terhadap catatan bot) dianggap kosong. */
const GHOST_RATIO = 0.01;
const TOLERANCE_RATIO = 0.02;

export function classify(localQty: number, exchangeQty: number): PositionStatus {
  if (exchangeQty <= Math.max(localQty * GHOST_RATIO, 1e-8)) return "HANTU";
  const dev = Math.abs(localQty - exchangeQty) / Math.max(exchangeQty, 1e-8);
  return dev <= TOLERANCE_RATIO ? "COCOK" : "SELISIH";
}
