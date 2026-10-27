/**
 * Koin di dompet Indodax yang DILEPAS dari kelolaan bot (mis. posisi di bawah
 * minimum order Rp10.000 yang tidak bisa dijual). Jumlahnya dikurangkan dari
 * saldo bursa saat rekonsiliasi/cek posisi, supaya pembelian pair yang sama
 * berikutnya tidak terbaca sebagai selisih (dan memicu emergency stop).
 * Penyimpanan: Firestore `bot_control/unmanaged_holdings` { <aset>: jumlah }.
 */
import { adminDb } from "@/services/firebase/admin";
import { MIN_ORDER_IDR } from "@/services/trading/minOrder";

const COLLECTION = "bot_control";
const DOC_ID = "unmanaged_holdings";

/** Saldo bursa dikurangi koin yang tidak dikelola bot (tidak pernah negatif). */
export function subtractUnmanaged(exchangeQty: number, unmanagedQty: number): number {
  const v = exchangeQty - (unmanagedQty > 0 ? unmanagedQty : 0);
  return v > 0 ? v : 0;
}

export interface ReleaseCheck {
  ok: boolean;
  reason?: string;
  valueIdr: number;
}

/** Posisi boleh dilepas HANYA bila koinnya ada di bursa dan nilainya < minimum order. */
export function canReleaseStuck(p: { localQty: number; exchangeQty: number; price: number }): ReleaseCheck {
  const valueIdr = p.localQty * p.price;
  if (!(p.localQty > 0)) return { ok: false, reason: "Catatan posisi bot kosong.", valueIdr };
  if (!(p.price > 0)) return { ok: false, reason: "Harga pasar tidak tersedia.", valueIdr };
  if (p.exchangeQty < p.localQty * 0.98) {
    return { ok: false, reason: "Saldo koin di Indodax lebih kecil dari catatan bot -- periksa dulu (mungkin posisi hantu).", valueIdr };
  }
  if (valueIdr >= MIN_ORDER_IDR) {
    return { ok: false, reason: `Nilai posisi Rp${Math.round(valueIdr)} sudah >= Rp${MIN_ORDER_IDR}; bot bisa menjualnya sendiri.`, valueIdr };
  }
  return { ok: true, valueIdr };
}

export async function getUnmanagedHoldings(): Promise<Record<string, number>> {
  try {
    const snap = await adminDb.collection(COLLECTION).doc(DOC_ID).get();
    const raw = snap.exists ? (snap.data() as Record<string, unknown>) : {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw)) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) out[k] = n;
    }
    return out;
  } catch (error) {
    console.error("[UNMANAGED HOLDINGS GET ERROR]", error);
    return {};
  }
}

export async function addUnmanagedHolding(asset: string, qty: number): Promise<void> {
  const current = await getUnmanagedHoldings();
  await adminDb
    .collection(COLLECTION)
    .doc(DOC_ID)
    .set({ ...current, [asset]: (current[asset] ?? 0) + qty, updatedAt: Date.now() });
}

/** Hapus penandaan "di luar kelolaan" satu aset (mis. setelah koinnya dijual manual). */
export async function removeUnmanagedHolding(asset: string): Promise<number> {
  const current = await getUnmanagedHoldings();
  const prev = current[asset] ?? 0;
  delete current[asset];
  await adminDb.collection(COLLECTION).doc(DOC_ID).set({ ...current, updatedAt: Date.now() });
  return prev;
}
