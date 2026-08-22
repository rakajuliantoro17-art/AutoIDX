/**
==========================================================
AURA Trade OS
Uncertain Order Reconciler
Version : 0.1.0

Menutup celah yang sebelumnya CATATAN di trading/live.ts:
"requireReconciliation belum ditegakkan" -- dan celah lebih
serius: resolveLiveOrderLock() (firebase/liveOrderLock.ts)
SUDAH ADA tapi TIDAK PERNAH dipanggil dari mana pun, jadi lock
berstatus UNCERTAIN (order gagal lewat exception network,
status di Indodax tidak diketahui) menahan pair+side itu
SELAMANYA sampai ada yang edit manual di Firestore console.

Cara kerja tiap siklus cron:
1. Ambil semua lock berstatus UNCERTAIN dari live_order_locks.
2. Untuk tiap lock, tanya riwayat trade akun ke Indodax (method
   private "trades") -- cari trade pair+side yang sama dengan
   timestamp SETELAH lock itu ditandai UNCERTAIN.
3a. TIDAK ketemu trade yang cocok -> order TERBUKTI GAGAL
    (tidak pernah tereksekusi). Aman di-resolve OTOMATIS lewat
    resolveLiveOrderLock() -- pair itu boleh ditrade lagi.
3b. KETEMU trade yang cocok -> order TERBUKTI TEREKSEKUSI tapi
    TIDAK PERNAH tercatat di Firestore (trades/botState) karena
    respons awal gagal sebelum sempat mencatat. INI TIDAK di-
    resolve otomatis -- posisi/portfolio bisa jadi salah kalau
    ditutup begitu saja tanpa rekonsiliasi manual. Sebagai
    gantinya: ditandai `needsManualReview` + bukti trade lengkap
    disimpan di dokumen lock, dan activity log level DANGER
    ditulis supaya langsung terlihat di dashboard.
3c. Gagal cek (Indodax error/network) -> dilewati, dicoba lagi
    siklus berikutnya. TIDAK PERNAH auto-resolve tanpa bukti
    jelas order gagal.

Fail-safe sepenuhnya: error di sini TIDAK PERNAH dilempar ke
pemanggil (cron/scan.ts) -- fitur observasional/perbaikan,
bukan bagian kritikal dari scan/trading yang harus selalu
berhasil duluan.
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";
import { recordLog } from "@/services/firebase/logService";
import { getActiveIndodaxAccount } from "@/services/firebase/indodaxAccountsAdmin";
import { resolveLiveOrderLock } from "@/services/firebase/liveOrderLock";
import { IndodaxClient } from "@/services/liveTrading/exchange/indodaxClient";

const COLLECTION = "live_order_locks";

/**
 * Buffer mundur (detik) sebelum markedUncertainAt saat query
 * riwayat trade -- toleransi jam server Indodax vs server kita
 * sedikit meleset, supaya trade yang sebenarnya cocok tidak
 * terlewat gara-gara perbedaan waktu beberapa detik.
 */
const CLOCK_SKEW_BUFFER_SECONDS = 30;

/**
 * Batas jumlah lock UNCERTAIN yang diproses per siklus cron,
 * supaya satu invocation tidak meledak melakukan banyak network
 * call kalau ada backlog besar (seharusnya jarang terjadi --
 * UNCERTAIN adalah kasus tepi, bukan kondisi normal).
 */
const MAX_LOCKS_PER_CYCLE = 10;

interface LiveOrderLockDoc {
  pair: string;
  side: "BUY" | "SELL";
  status: "PENDING" | "COMPLETED" | "FAILED" | "UNCERTAIN";
  markedUncertainAt?: number;
  uncertainReason?: string;
  needsManualReview?: boolean;
}

export interface ReconciliationResult {
  checked: number;
  autoResolved: number;
  escalatedForReview: number;
  skipped: number;
}

/**
 * Bentuk longgar dari satu entri riwayat trade Indodax --
 * dibiarkan longgar (bukan interface ketat) karena field selain
 * `type`/`date` (yang dipakai untuk logika pencocokan) bisa
 * berbeda-beda tergantung versi API/pair, dan tetap disimpan
 * apa adanya sebagai bukti untuk manual review.
 */
function extractTradeMeta(
  raw: unknown
): { type: string; dateMs: number } | null {

  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Record<string, unknown>;

  const type = String(obj.type ?? "").toLowerCase();

  const dateRaw = obj.date;
  const dateSeconds =
    typeof dateRaw === "string" || typeof dateRaw === "number"
      ? Number(dateRaw)
      : NaN;

  if (!type || Number.isNaN(dateSeconds)) return null;

  return { type, dateMs: dateSeconds * 1000 };

}

/**
 * Cek satu lock UNCERTAIN terhadap riwayat trade Indodax.
 * Mengembalikan null kalau pengecekan gagal (network/API error)
 * -- caller akan melewati lock ini, coba lagi siklus berikutnya.
 */
async function checkAgainstExchange(
  client: IndodaxClient,
  lock: LiveOrderLockDoc
): Promise<{ executed: boolean; evidence: unknown[] } | null> {

  const markedAt = lock.markedUncertainAt ?? Date.now();
  const sinceSeconds =
    Math.floor(markedAt / 1000) - CLOCK_SKEW_BUFFER_SECONDS;

  const history = await client.tradeHistory({
    pair: lock.pair,
    since: sinceSeconds,
    count: 50,
  });

  if (!history.success) return null;

  const wantedType = lock.side === "BUY" ? "buy" : "sell";

  const matching = history.data.filter((raw) => {
    const meta = extractTradeMeta(raw);
    if (!meta) return false;
    return (
      meta.type === wantedType &&
      meta.dateMs >= markedAt - CLOCK_SKEW_BUFFER_SECONDS * 1000
    );
  });

  return {
    executed: matching.length > 0,
    evidence: matching,
  };

}

/**
 * Entry point -- dipanggil dari cron/scan.ts tiap siklus.
 */
export async function reconcileUncertainOrders(): Promise<ReconciliationResult> {

  const result: ReconciliationResult = {
    checked: 0,
    autoResolved: 0,
    escalatedForReview: 0,
    skipped: 0,
  };

  try {

    const snapshot = await adminDb
      .collection(COLLECTION)
      .where("status", "==", "UNCERTAIN")
      .limit(MAX_LOCKS_PER_CYCLE)
      .get();

    if (snapshot.empty) return result;

    // Lock yang sudah pernah di-escalate (needsManualReview) tidak
    // perlu dicek ulang tiap siklus -- sudah menunggu tindakan
    // manusia, bukan sesuatu yang bisa "berubah sendiri".
    const pending = snapshot.docs.filter(
      (doc) => !(doc.data() as LiveOrderLockDoc).needsManualReview
    );

    if (pending.length === 0) return result;

    const account = await getActiveIndodaxAccount();

    if (!account) {
      // Tidak ada akun aktif untuk cek riwayat -- tunggu siklus
      // berikutnya, bukan error yang perlu diributkan tiap 30
      // detik.
      result.skipped = pending.length;
      return result;
    }

    const client = new IndodaxClient({
      apiKey: account.apiKey,
      secretKey: account.secretKey,
    });

    for (const doc of pending) {

      const lock = doc.data() as LiveOrderLockDoc;
      result.checked += 1;

      const check = await checkAgainstExchange(client, lock);

      if (check === null) {
        result.skipped += 1;
        continue;
      }

      if (!check.executed) {

        // Terbukti TIDAK tereksekusi -- aman dilepas otomatis.
        await resolveLiveOrderLock(lock.pair, lock.side);

        await recordLog(
          "RISK",
          "success",
          `Lock UNCERTAIN ${lock.side} ${lock.pair.toUpperCase()} otomatis di-resolve -- ` +
          `riwayat trade Indodax mengonfirmasi order TIDAK pernah tereksekusi.`
        );

        result.autoResolved += 1;

      } else {

        // Terbukti TEREKSEKUSI tapi tidak tercatat -- JANGAN
        // sentuh lock/posisi otomatis, cukup tandai + catat bukti
        // untuk operator.
        await doc.ref.set(
          {
            needsManualReview: true,
            reviewEvidence: check.evidence.slice(0, 5),
            reviewFlaggedAt: Date.now(),
          },
          { merge: true }
        );

        await recordLog(
          "RISK",
          "danger",
          `PERLU REVIEW MANUAL: order ${lock.side} ${lock.pair.toUpperCase()} yang sebelumnya ` +
          `berstatus TIDAK PASTI TERNYATA TEREKSEKUSI di Indodax (ditemukan di riwayat trade) ` +
          `tapi tidak tercatat di sistem. Cek dashboard/riwayat Indodax langsung untuk ` +
          `rekonsiliasi posisi & saldo secara manual sebelum melanjutkan trading pair ini.`
        );

        result.escalatedForReview += 1;

      }

    }

    return result;

  } catch (error) {

    console.error("[UNCERTAIN ORDER RECONCILER] Gagal:", error);
    return result;

  }

}
