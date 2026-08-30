/**
==========================================================
AURA Trade OS
AI Score Calibration Tracker
Version : 0.3.0

Menjawab "apakah AI Score (services/ai/prediction) siap
dipromosikan jadi filter BUY/SELL otomatis?" dengan DATA,
bukan tebakan.

Cara kerja:
1. recordCalibrationSnapshots() dipanggil tiap siklus scan,
   menyimpan snapshot aiScore/aiDirection/aiConfidence +
   harga saat itu untuk tiap pair di topOpportunities yang
   punya data AI (aiDirection terisi).
2. Snapshot itu "jatuh tempo" untuk dievaluasi setelah
   EVALUATION_DELAY_MS (default 30 menit) -- cukup waktu untuk
   melihat apakah harga benar-benar bergerak sesuai arah yang
   diprediksi.
3. evaluateDueCalibrations() dipanggil tiap siklus scan,
   mengambil snapshot yang sudah jatuh tempo & belum dievaluasi,
   membandingkan harga sekarang vs harga saat snapshot, lalu
   menandai prediksinya benar/salah.

FIX v0.3.0 (2 root cause timeout 30 detik konsisten di cron
scan.ts, ditemukan lewat audit cron-job.org log):

1. Query evaluateDueCalibrations() SEBELUMNYA memakai
   `.where("evaluated","==",false).where("dueAt","<=",now)` --
   kombinasi equality + range filter di field BERBEDA ini
   MEWAJIBKAN composite index Firestore. Tidak ada
   firestore.indexes.json di repo dan tidak ada pipeline yang
   men-deploy index. Tanpa index itu, query melempar
   FAILED_PRECONDITION di production -- ketangkap try/catch di
   bawah, cuma di-console.error, JADI FITUR INI TIDAK PERNAH
   MENGEVALUASI APA PUN secara silent. Sekarang field due dipakai
   sebagai angka epoch ms (`dueAtMs`), query cuma equality filter
   tunggal (evaluated == false, TIDAK butuh index apa pun), lalu
   `dueAtMs <= now` difilter di memory (JS) setelah data diambil.

2. evaluateDueCalibrations() SEBELUMNYA memanggil
   getFormattedTicker() SATU PER SATU secara SEKUENSIAL di dalam
   loop -- sampai MAX_EVALUATIONS_PER_CYCLE (25) network call
   berurutan ke Indodax, masing-masing (dan rate limiter
   fetch-level) bisa nambah ratusan ms-detik. Ini akar penyebab
   PALING MUNGKIN dari pola gagal "Duration: 30s" yang KONSISTEN
   di setiap invocation cron/scan (bukan variatif) -- begitu ada
   backlog snapshot jatuh tempo (pasti terjadi setelah app jalan
   >30 menit tanpa henti), 25 network call sekuensial + langkah
   lain di siklus yang sama gampang menembus batas waktu function.
   Sekarang 1x getSummaryTickers() (SEMUA pair sekaligus, sudah
   dipakai scanner untuk hal yang sama) di awal, look-up dari Map
   -- 0 network call tambahan per pair yang dievaluasi, bukan cuma
   diparalelkan (yang tetap N network call, cuma bersamaan).

Fail-safe sepenuhnya: kalau ada error di sini (Firestore/
network), fungsi mengembalikan hasil kosong dan TIDAK PERNAH
melempar exception ke scan.ts -- scan/trading di atasnya sudah
selesai lebih dulu dan tidak boleh terganggu oleh fitur
observasional ini.
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import indodaxMarketService from "@/services/indodax/market";
import type { ScannedPairResult } from "@/services/scanner/types";

const COLLECTION = "aiCalibrationSnapshots";

/**
 * Berapa lama menunggu sebelum sebuah snapshot dievaluasi.
 * 30 menit dipilih supaya pergerakan harga cukup berarti untuk
 * dibandingkan dengan arah yang diprediksi (bukan cuma noise).
 */
const EVALUATION_DELAY_MS = 30 * 60 * 1000;

/**
 * Perubahan harga di bawah ini (%) dianggap "tidak bergerak
 * berarti" -- dipakai untuk menentukan arah aktual (BULLISH/
 * BEARISH/NEUTRAL) supaya konsisten dengan cara aiDirection
 * diberi label.
 */
const NEUTRAL_THRESHOLD_PERCENT = 0.15;

/**
 * Batas jumlah dokumen "pending" (belum dievaluasi) yang dibaca
 * per siklus -- query-nya cuma equality filter tunggal (lihat
 * catatan FIX v0.3.0 di atas), jadi batas ini murni untuk menjaga
 * ukuran query tetap wajar, bukan syarat index.
 */
const MAX_PENDING_READ = 300;

interface CalibrationSnapshotDoc {
  pair: string;
  symbol: string;
  aiScore: number;
  aiDirection: "BULLISH" | "BEARISH" | "NEUTRAL";
  aiConfidence: number;
  opportunityScore: number;
  signalRecommendation: ScannedPairResult["signalRecommendation"];
  priceAtSnapshot: number;
  snapshotAt: FieldValue;
  dueAtMs: number;
  evaluated: boolean;
  correct: boolean | null;
  priceAtEvaluation: number | null;
  priceChangePercent: number | null;
  actualDirection: "BULLISH" | "BEARISH" | "NEUTRAL" | null;
  evaluatedAt: FieldValue | null;
}

export interface RecordCalibrationResult {
  written: number;
}

export interface EvaluateCalibrationResult {
  evaluated: number;
  correct: number;
}

/**
 * Menyimpan snapshot aiScore/aiDirection tiap pair di
 * topOpportunities yang punya data AI. Pair tanpa aiDirection
 * (mis. gagal dianalisa PredictionEngine siklus ini) dilewati.
 */
export async function recordCalibrationSnapshots(
  topOpportunities: ScannedPairResult[]
): Promise<RecordCalibrationResult> {
  try {
    const eligible = topOpportunities.filter(
      (result) => result.aiDirection !== undefined && result.aiScore !== undefined
    );

    if (eligible.length === 0) {
      return { written: 0 };
    }

    const dueAtMs = Date.now() + EVALUATION_DELAY_MS;

    const batch = adminDb.batch();
    const collectionRef = adminDb.collection(COLLECTION);

    for (const result of eligible) {
      const docRef = collectionRef.doc();

      const snapshot: CalibrationSnapshotDoc = {
        pair: result.pair,
        symbol: result.symbol,
        aiScore: result.aiScore as number,
        aiDirection: result.aiDirection as "BULLISH" | "BEARISH" | "NEUTRAL",
        aiConfidence: result.aiConfidence ?? 0,
        opportunityScore: result.opportunityScore,
        signalRecommendation: result.signalRecommendation,
        priceAtSnapshot: result.lastPrice,
        snapshotAt: FieldValue.serverTimestamp(),
        // Angka biasa (ms epoch), BUKAN Firestore Timestamp -- supaya
        // evaluateDueCalibrations() bisa membandingkannya di memory
        // tanpa perlu range-filter query (lihat catatan FIX v0.3.0).
        dueAtMs,
        evaluated: false,
        correct: null,
        priceAtEvaluation: null,
        priceChangePercent: null,
        actualDirection: null,
        evaluatedAt: null,
      };

      batch.set(docRef, snapshot);
    }

    await batch.commit();

    return { written: eligible.length };
  } catch (error) {
    console.error("[AI CALIBRATION] Gagal menyimpan snapshot:", error);
    return { written: 0 };
  }
}

/**
 * Mengubah persentase perubahan harga jadi label arah, dengan
 * band netral supaya konsisten dengan cara aiDirection diberi
 * label oleh PredictionEngine.
 */
function resolveActualDirection(
  changePercent: number
): "BULLISH" | "BEARISH" | "NEUTRAL" {
  if (changePercent >= NEUTRAL_THRESHOLD_PERCENT) return "BULLISH";
  if (changePercent <= -NEUTRAL_THRESHOLD_PERCENT) return "BEARISH";
  return "NEUTRAL";
}

/**
 * Mengambil snapshot yang belum dievaluasi, menyaring yang sudah
 * jatuh tempo (dueAtMs <= now) DI MEMORY (bukan lewat Firestore
 * range-filter -- lihat catatan FIX v0.3.0), membandingkan harga
 * sekarang (dari 1x getSummaryTickers(), BUKAN network call per
 * pair) terhadap harga saat snapshot diambil, lalu menandai
 * prediksinya benar/salah.
 *
 * Pair yang harga sekarangnya tidak ketemu di snapshot market
 * (mis. delisted/data hilang sementara) dilewati apa adanya --
 * akan dicoba lagi di siklus cron berikutnya, tidak ditandai
 * gagal permanen.
 */
export async function evaluateDueCalibrations(): Promise<EvaluateCalibrationResult> {
  try {
    const pendingSnapshot = await adminDb
      .collection(COLLECTION)
      .where("evaluated", "==", false)
      .limit(MAX_PENDING_READ)
      .get();

    if (pendingSnapshot.empty) {
      return { evaluated: 0, correct: 0 };
    }

    const now = Date.now();

    const dueDocs = pendingSnapshot.docs.filter(
      (doc) => (doc.get("dueAtMs") as number) <= now
    );

    if (dueDocs.length === 0) {
      return { evaluated: 0, correct: 0 };
    }

    // Satu request ke Indodax untuk harga SEMUA pair sekaligus --
    // bukan satu-satu per pair yang jatuh tempo (lihat catatan FIX
    // v0.3.0 poin 2 -- ini akar penyebab timeout 30 detik konsisten).
    const marketSnapshot = await indodaxMarketService.getSummaryTickers();
    const priceByPair = new Map<string, number>(
      marketSnapshot.map((t: { pair: string; lastPrice: number }) => [
        t.pair,
        t.lastPrice,
      ])
    );

    let evaluated = 0;
    let correct = 0;

    const batch = adminDb.batch();

    for (const doc of dueDocs) {
      const data = doc.data() as CalibrationSnapshotDoc;
      const currentPrice = priceByPair.get(data.pair);

      if (typeof currentPrice !== "number" || !currentPrice) {
        // Harga sekarang tidak ketemu -- coba lagi siklus
        // berikutnya, jangan ditandai evaluated supaya tidak hilang.
        continue;
      }

      const priceChangePercent =
        data.priceAtSnapshot > 0
          ? ((currentPrice - data.priceAtSnapshot) / data.priceAtSnapshot) * 100
          : 0;

      const actualDirection = resolveActualDirection(priceChangePercent);
      const isCorrect = actualDirection === data.aiDirection;

      batch.update(doc.ref, {
        evaluated: true,
        correct: isCorrect,
        priceAtEvaluation: currentPrice,
        priceChangePercent: Number(priceChangePercent.toFixed(4)),
        actualDirection,
        evaluatedAt: FieldValue.serverTimestamp(),
      });

      evaluated += 1;
      if (isCorrect) correct += 1;
    }

    if (evaluated > 0) {
      await batch.commit();
    }

    return { evaluated, correct };
  } catch (error) {
    console.error("[AI CALIBRATION] Gagal evaluasi snapshot:", error);
    return { evaluated: 0, correct: 0 };
  }
}
