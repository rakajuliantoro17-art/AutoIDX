/**
==========================================================
AURA Trade OS
Scan + Trade Cycle (logic bersama cron & webhook)
Version : 0.1.0 Alpha
==========================================================
Diekstrak dari pages/api/cron/scan.ts supaya BISA dipanggil dari
lebih dari satu entry point -- sebelumnya logic ini "terkunci" di
dalam satu API route handler, jadi webhook (api/webhook/service.ts)
tidak bisa memicu siklus scan+trade yang SAMA PERSIS dengan yang
dipakai cron, tanpa duplikasi ~80 baris kode.

FIX REGRESI (ditemukan saat audit ini): commit "Refactor cron scan
handler by removing unused code" yang menghapus `maxDuration`
(dikira dead code, PADAHAL config Vercel -- lihat catatan di
scan.ts) TERNYATA JUGA menghapus pemanggilan
recordCalibrationSnapshots()/evaluateDueCalibrations() di siklus
yang sama. Akibatnya sejak commit itu, /api/analytics/ai-calibration
tidak pernah dapat data baru lagi -- silent regression, endpoint-nya
tetap merespons normal, cuma datanya beku. Dikembalikan di sini.
==========================================================
*/

import marketScanner from "@/services/scanner";
import { adminDb } from "@/services/firebase/admin";
import { executeCron } from "@/services/scheduler/cron";
import {
  recordCalibrationSnapshots,
  evaluateDueCalibrations,
} from "@/services/analytics/aiCalibration";
import type { MarketScanSummary } from "@/services/scanner/types";
import type { CronResult } from "@/services/scheduler/cron";

// executeCron() memproses candidate SATU PER SATU dengan network
// call asli per pair -- durasi total sebanding lurus dengan jumlah
// candidate. Tanpa cap ini, siklus scan yang qualifiedCount-nya
// besar (market ramai) SELALU berisiko timeout.
//
// PENTING: batas ini SEBELUMNYA 15, diturunkan ke 8 karena
// cron-job.org (trigger UTAMA sekarang, lihat catatan sesi
// terkait) punya batas keras request timeout 30 DETIK -- tidak
// bisa dinaikkan lewat pengaturan mereka ("The maximum timeout is
// 30 seconds", dikonfirmasi langsung dari UI cron-job.org). Ini
// jauh lebih ketat dari maxDuration:60 Vercel yang jadi acuan
// sebelumnya. Total waktu siklus = waktu scan market penuh (~12
// detik untuk ratusan pair) + waktu proses candidate (jumlah
// candidate / PAIR_CONCURRENCY gelombang, tiap gelombang bisa
// sampai AI_CALL_TIMEOUT_MS kalau ada BUY yang lolos ke AI
// advisory) -- dengan 15 candidate & concurrency 5 (3 gelombang),
// margin di bawah 30 detik nyaris nol. Dengan 8 candidate (2
// gelombang), ada ruang aman lebih besar.
const MAX_CANDIDATE_PAIRS_PER_CYCLE = 8;

export interface ScanCycleResult {
  summary: MarketScanSummary;
  trading: CronResult;
  aiCalibration: {
    evaluated: number;
    correctThisCycle: number;
    newSnapshots: number;
  };
}

/**
 * Satu siklus penuh: scan seluruh market -> simpan hasil -> evaluasi
 * & catat kalibrasi AI Score -> jalankan trading engine untuk
 * candidate teratas. Dipakai oleh:
 * - pages/api/cron/scan.ts (dipicu GitHub Actions tiap interval)
 * - api/webhook/service.ts (dipicu event "scan" dari luar)
 *
 * TIDAK menangani lock/auth -- itu tanggung jawab pemanggil (beda
 * kebutuhan: cron pakai distributed lock, webhook pakai signature
 * verification + rate limit).
 */
export async function runScanCycle(): Promise<ScanCycleResult> {
  const startedAt = Date.now();

  const summary = await marketScanner.scanMarket();

  await adminDb.collection("scannerResults").doc("latest").set({
    ...summary,
    durationMs: Date.now() - startedAt,
  });

  await adminDb.collection("scannerHistory").add({
    ...summary,
    durationMs: Date.now() - startedAt,
  });

  console.log(
    `[SCAN CYCLE] Scan selesai: ${summary.qualifiedCount}/${summary.scannedCount} pair qualified ` +
      `(skor dianalisa: ${summary.scoreStats.analyzedCount}, ` +
      `min ${summary.scoreStats.minScore}, max ${summary.scoreStats.maxScore}, ` +
      `avg ${summary.scoreStats.avgScore}, threshold ${summary.scoreStats.thresholdUsed})`
  );

  // --- AI Score Calibration Tracker (lihat catatan FIX REGRESI di
  // atas) -- fail-safe sepenuhnya di dalam aiCalibration.ts, tidak
  // pernah mengganggu siklus scan/trading di bawah kalau gagal.
  const calibrationEvaluation = await evaluateDueCalibrations();
  const calibrationRecording = await recordCalibrationSnapshots(
    summary.topOpportunities
  );

  if (calibrationEvaluation.evaluated > 0) {
    console.log(
      `[SCAN CYCLE] Kalibrasi AI Score: ${calibrationEvaluation.evaluated} snapshot dievaluasi, ${calibrationEvaluation.correct} benar.`
    );
  }

  const candidatePairs = summary.qualifiedPairs.slice(
    0,
    MAX_CANDIDATE_PAIRS_PER_CYCLE
  );

  if (summary.qualifiedPairs.length > MAX_CANDIDATE_PAIRS_PER_CYCLE) {
    console.log(
      `[SCAN CYCLE] ${summary.qualifiedPairs.length} pair qualified, dibatasi ke ${MAX_CANDIDATE_PAIRS_PER_CYCLE} teratas siklus ini (cegah timeout).`
    );
  }

  const trading = await executeCron(candidatePairs);

  console.log("[SCAN CYCLE] Trading engine:", trading);

  return {
    summary,
    trading,
    aiCalibration: {
      evaluated: calibrationEvaluation.evaluated,
      correctThisCycle: calibrationEvaluation.correct,
      newSnapshots: calibrationRecording.written,
    },
  };
}
