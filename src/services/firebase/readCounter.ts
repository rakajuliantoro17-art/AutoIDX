/**
 * Penghitung PEMBACAAN Firestore per siklus (pasangan writeCounter).
 * Kuota Spark: 50K baca/hari; tanpa angka ini tidak terlihat siapa pemakainya.
 * Menghitung dokumen yang dikembalikan (query kosong = 1, sesuai penagihan).
 * Murni observasi: kegagalan penghitung tidak pernah mengganggu bacaan asli.
 */
import { DocumentReference, Query, Transaction } from "firebase-admin/firestore";

const counts: Record<string, number> = {};
let installed = false;

function bump(path: string, n: number): void {
  try {
    const key = `read:${path}`;
    counts[key] = (counts[key] ?? 0) + Math.max(1, n);
  } catch {
    // diam
  }
}

function pathOf(target: unknown): string {
  const t = target as { parent?: { path?: string }; path?: string; _queryOptions?: { collectionId?: string } } | null;
  return t?.parent?.path ?? t?._queryOptions?.collectionId ?? t?.path ?? "?";
}

function sizeOf(result: unknown): number {
  const r = result as { size?: number; docs?: unknown[] } | null;
  if (typeof r?.size === "number") return r.size;
  return 1;
}

export function installReadCounter(): void {
  if (installed) return;
  installed = true;

  const wrap = (proto: Record<string, unknown>, label: string) => {
    const original = proto.get as ((...a: unknown[]) => Promise<unknown>) | undefined;
    if (typeof original !== "function") return;
    proto.get = async function (this: unknown, ...args: unknown[]) {
      const result = await original.apply(this, args);
      bump(label === "tx" ? pathOf(args[0]) : pathOf(this), sizeOf(result));
      return result;
    };
  };

  wrap(DocumentReference.prototype as unknown as Record<string, unknown>, "doc");
  wrap(Query.prototype as unknown as Record<string, unknown>, "query");
  wrap(Transaction.prototype as unknown as Record<string, unknown>, "tx");
}

export function resetReadCounts(): void {
  for (const k of Object.keys(counts)) delete counts[k];
}

export function getReadCounts(): Record<string, number> {
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]));
}

export function totalReads(): number {
  return Object.values(counts).reduce((a, b) => a + b, 0);
}
