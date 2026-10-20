/**
 * Penghitung write Firestore per koleksi (diagnostik kuota Spark).
 *
 * Semua write firebase-admin (DocumentReference.set/update/create/delete,
 * CollectionReference.add, Transaction.*) pada akhirnya lewat
 * WriteBatch.{create,set,update,delete}, jadi cukup mem-patch keempat
 * method itu - tanpa risiko hitung ganda. Dihitung saat write
 * DIANTRIKAN (transaksi yang di-retry bisa terhitung lebih dari sekali).
 *
 * Aman: kegagalan penghitungan di-telan dan method asli SELALU
 * dipanggil dengan argumen yang sama. Tidak menambah write: hasilnya
 * dititipkan ke dokumen heartbeat yang memang ditulis tiap siklus.
 */
import { WriteBatch } from "firebase-admin/firestore";

const METHODS = ["create", "set", "update", "delete"] as const;

const counts: Record<string, number> = {};
let installed = false;

function bump(method: string, ref: unknown): void {
  try {
    const path =
      (ref as { parent?: { path?: string } } | null)?.parent?.path ?? "?";
    const key = `${method === "delete" ? "del" : "write"}:${path}`;
    counts[key] = (counts[key] ?? 0) + 1;
  } catch {
    // diagnostik saja - tidak boleh mengganggu apa pun
  }
}

export function installWriteCounter(): void {
  if (installed) return;
  installed = true;

  const proto = WriteBatch.prototype as unknown as Record<
    string,
    (...args: unknown[]) => unknown
  >;

  for (const method of METHODS) {
    const original = proto[method];
    if (typeof original !== "function") continue;

    proto[method] = function (this: unknown, ref: unknown, ...rest: unknown[]) {
      bump(method, ref);
      return original.call(this, ref, ...rest);
    };
  }
}

export function resetWriteCounts(): void {
  for (const k of Object.keys(counts)) delete counts[k];
}

/** Salinan hasil hitung, diurutkan dari terbesar. */
export function getWriteCounts(): Record<string, number> {
  return Object.fromEntries(
    Object.entries(counts).sort((a, b) => b[1] - a[1])
  );
}
