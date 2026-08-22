/**
==========================================================
AURA Trade OS
Live Order Lock (Idempotency Guard)
Version : 0.1.0 Alpha
==========================================================
Terinspirasi dari services/liveTrading/execution/orderManager.ts
(OrderManager.hasDuplicate()) -- TAPI diimplementasi ulang di
sini karena versi aslinya pakai array in-memory
(`private orders: LiveOrder[]`) yang TIDAK bisa diandalkan di
Vercel serverless (tiap invocation cron/API bisa jalan di
instance proses yang berbeda-beda, state in-memory tidak
persisten lintas panggilan).

Modul ini pakai Firestore + transaction (atomik) supaya lock
persisten dan aman dari race condition antar invocation yang
hampir bersamaan (mis. cron overlap, retry, atau trigger manual
lewat /api/bot bersamaan dengan cron terjadwal).

Alur pakai (lihat trading/live.ts):
1. acquireLiveOrderLock(pair, side) SEBELUM panggilan API Indodax
   apa pun -- throw kalau ada lock PENDING yang masih dalam
   window waktu (order lain untuk pair+side yang sama sedang
   diproses).
2. releaseLiveOrderLock(pair, side, success) di finally block --
   SELALU dipanggil baik order sukses maupun gagal, supaya lock
   tidak macet menahan order berikutnya yang sah.

Fail-safe: kalau Firestore sendiri error saat acquire (bukan
karena ada lock, tapi karena network/config error), acquire
GAGAL (throw) -- BUY diblokir, bukan diam-diam diloloskan. Ini
konsisten dengan prinsip fail-safe yang dipakai di seluruh
trading/engine.ts sesi ini.
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";

const COLLECTION = "live_order_locks";

/**
 * Lock dianggap kedaluwarsa setelah 60 detik -- cukup untuk
 * mencegah duplikat dari overlap/retry yang hampir bersamaan,
 * tapi tidak akan macet permanen kalau releaseLiveOrderLock()
 * gagal terpanggil (mis. proses serverless mati mendadak/timeout
 * sebelum sempat release).
 */
const LOCK_WINDOW_MS = 60_000;

type OrderSide = "BUY" | "SELL";

interface LiveOrderLockDoc {
  pair: string;
  side: OrderSide;
  status: "PENDING" | "COMPLETED" | "FAILED" | "UNCERTAIN";
  lockedAt: number;
}

function lockDocId(pair: string, side: OrderSide): string {
  return `${pair.trim().toLowerCase()}_${side}`;
}

/**
 * Ambil lock untuk pair+side tertentu. Throw kalau:
 * - Ada lock PENDING lain untuk pair+side yang sama, umurnya
 *   masih di bawah LOCK_WINDOW_MS (order duplikat terdeteksi).
 * - Firestore sendiri error (fail-safe: blokir, bukan loloskan).
 */
export async function acquireLiveOrderLock(
  pair: string,
  side: OrderSide
): Promise<void> {

  const docRef = adminDb
    .collection(COLLECTION)
    .doc(lockDocId(pair, side));

  await adminDb.runTransaction(async (tx) => {

    const snap = await tx.get(docRef);

    if (snap.exists) {

      const data = snap.data() as LiveOrderLockDoc;
      const ageMs = Date.now() - data.lockedAt;

      if (data.status === "UNCERTAIN") {

        throw new Error(
          `Order ${side} ${pair.toUpperCase()} sebelumnya berstatus TIDAK PASTI ` +
          `(kemungkinan tereksekusi di Indodax tapi respons gagal diterima) -- ` +
          `diblokir sampai diverifikasi manual & di-resolve lewat resolveLiveOrderLock(). ` +
          `Cek riwayat order asli di Indodax sebelum resolve.`
        );

      }

      if (data.status === "PENDING" && ageMs < LOCK_WINDOW_MS) {

        throw new Error(
          `Order ${side} ${pair.toUpperCase()} lain sedang diproses ` +
          `(lock berumur ${Math.round(ageMs / 1000)}s, window ${LOCK_WINDOW_MS / 1000}s) ` +
          `-- diblokir untuk mencegah duplikat.`
        );

      }

    }

    const doc: LiveOrderLockDoc = {
      pair: pair.trim().toLowerCase(),
      side,
      status: "PENDING",
      lockedAt: Date.now(),
    };

    tx.set(docRef, doc);

  });

}

/**
 * Lepas lock setelah order selesai (sukses ATAU gagal). WAJIB
 * dipanggil di finally block oleh caller -- kalau tidak, lock
 * akan tetap memblokir order berikutnya sampai LOCK_WINDOW_MS
 * habis dengan sendirinya (bukan macet permanen, tapi tetap
 * menunda order sah berikutnya sampai 60 detik).
 */
export async function releaseLiveOrderLock(
  pair: string,
  side: OrderSide,
  success: boolean
): Promise<void> {

  const docRef = adminDb
    .collection(COLLECTION)
    .doc(lockDocId(pair, side));

  try {

    await docRef.set(
      {
        status: success ? "COMPLETED" : "FAILED",
        releasedAt: Date.now(),
      },
      { merge: true }
    );

  } catch (error) {

    // Non-fatal dengan sengaja: release gagal cuma berarti lock
    // akan expire sendiri lewat LOCK_WINDOW_MS, TIDAK melempar
    // error ke pemanggil (order itu sendiri sudah selesai --
    // sukses/gagalnya sudah ditentukan, tidak boleh dibatalkan
    // gara-gara housekeeping lock gagal).
    console.error("[LiveOrderLock] Gagal release lock:", error);

  }

}

/**
 * Tandai lock sebagai TIDAK PASTI -- dipanggil sebagai ganti
 * releaseLiveOrderLock() ketika client.trade() gagal lewat
 * exception (certainty==="UNCERTAIN", lihat
 * liveTrading/exchange/indodaxClient.ts & types.ts
 * ExchangeResponse.certainty), BUKAN penolakan bersih dari
 * Indodax. Lock TETAP memblokir order pair+side yang sama
 * (terlepas dari LOCK_WINDOW_MS) sampai di-resolve manual lewat
 * resolveLiveOrderLock() -- operator WAJIB cek riwayat order
 * asli di Indodax dulu sebelum resolve, untuk pastikan order itu
 * benar-benar tidak tereksekusi (kalau ternyata tereksekusi,
 * JANGAN resolve -- rekonsiliasi posisi manual dulu).
 */
export async function markLiveOrderUncertain(
  pair: string,
  side: OrderSide,
  reason: string
): Promise<void> {

  const docRef = adminDb
    .collection(COLLECTION)
    .doc(lockDocId(pair, side));

  try {

    await docRef.set(
      {
        pair: pair.trim().toLowerCase(),
        side,
        status: "UNCERTAIN",
        uncertainReason: reason,
        markedUncertainAt: Date.now(),
      },
      { merge: true }
    );

  } catch (error) {

    // Kalau bahkan penandaan UNCERTAIN gagal tersimpan, ini
    // serius -- log sekeras mungkin, tapi tetap tidak melempar
    // supaya tidak menutupi error asli (kegagalan trade() itu
    // sendiri) yang memicu pemanggilan fungsi ini.
    console.error(
      "[LiveOrderLock] GAGAL menandai lock sebagai UNCERTAIN -- " +
      "order mungkin dalam status tidak diketahui tanpa jejak di Firestore:",
      error
    );

  }

}

/**
 * Resolusi manual untuk lock berstatus UNCERTAIN -- panggil
 * HANYA setelah operator memverifikasi langsung ke Indodax
 * (riwayat order/getInfo) bahwa order tersebut TIDAK tereksekusi.
 * Melepas lock supaya order pair+side yang sama bisa dicoba lagi.
 */
export async function resolveLiveOrderLock(
  pair: string,
  side: OrderSide
): Promise<void> {

  const docRef = adminDb
    .collection(COLLECTION)
    .doc(lockDocId(pair, side));

  await docRef.set(
    {
      status: "COMPLETED",
      resolvedAt: Date.now(),
      resolvedManually: true,
    },
    { merge: true }
  );

}
