/**
==========================================================
AURA Trade OS
Cron: Market Scanner + Trading Engine Trigger
Version : 0.1.1

Dilengkapi distributed lock (Firestore) supaya kalau
trigger eksternal (cron-job.org, interval 30 detik)
menembak request baru sebelum siklus sebelumnya selesai,
request baru itu di-skip dengan aman (bukan dijalankan
dobel).

FIX v0.1.1 (regresi dari commit 8b6c9de1 "Refactor cron scan
handler by removing unused code"): commit itu MENGHAPUS
`export const config = { maxDuration: 60 }` karena dikira kode
tidak terpakai - PADAHAL ini bukan dead code, ini konfigurasi
Vercel yang menaikkan batas waktu function dari default (10
detik di paket Hobby). Akibatnya nyata di production (dilaporkan
lewat cron-job.org log): sebelum ~12:25 request timeout 30 detik
(batas cron-job.org sendiri, function masih jalan di background
sampai default limit Vercel), sesudah ~12:25 berubah jadi 500
cepat (2-12 detik) karena Vercel langsung membunuh function di
batas default yang jauh lebih pendek dari 60 detik.

Cap candidatePairs (dihapus di commit yang sama, sempat ada di
versi sebelumnya) DIKEMBALIKAN juga - ini akar masalah SEBENARNYA
(bukan cuma maxDuration): executeCron() memproses candidate
SEKUENSIAL (1 network call asli per pair), jadi durasi total
sebanding lurus dengan qualifiedCount. Tanpa cap, siklus scan
yang qualifiedCount-nya besar (market ramai) akan SELALU berisiko
timeout terlepas dari berapapun maxDuration di-set - menaikkan
maxDuration cuma menggeser titik gagalnya, bukan menghilangkan
akar masalahnya.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import marketScanner from "@/services/scanner";
import { adminDb } from "@/services/firebase/admin";
import { executeCron } from "@/services/scheduler/cron";
import { acquireCronLock } from "@/services/scheduler/cronLock";

export const config = {
  maxDuration: 60,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const cronSecret = process.env.CRON_SECRET?.trim();

  // Kalau CRON_SECRET belum di-set di Vercel, ini KESALAHAN KONFIGURASI
  // server -- balas 500, JANGAN 401. Sebelumnya `Bearer ${undefined}`
  // dibandingkan sebagai string literal "Bearer undefined", yang
  // membuat kegagalan config tidak terbedakan dari token yang salah
  // di GitHub Actions -- keduanya sama-sama 401 tanpa penjelasan.
  if (!cronSecret) {
    console.error("[CRON SCAN] CRON_SECRET belum di-set di environment Vercel.");
    return res.status(500).json({ error: "Server misconfigured: CRON_SECRET not set" });
  }

  const rawAuthHeader = req.headers.authorization;
  const authHeader = rawAuthHeader?.trim();
  const expectedToken = `Bearer ${cronSecret}`;

  if (authHeader !== expectedToken) {
    console.error(
      "[CRON SCAN] Unauthorized. " +
      `Panjang header diterima: ${rawAuthHeader?.length ?? 0} (setelah trim: ${authHeader?.length ?? 0}). ` +
      `Panjang token diharapkan: ${expectedToken.length}. ` +
      "Cek apakah GitHub Actions secret CRON_SECRET persis sama dengan env var CRON_SECRET di Vercel " +
      "(case-sensitive, tanpa spasi/newline ekstra), dan environment scope-nya mencakup Production."
    );
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const lock = await acquireCronLock();

  if (!lock.acquired) {
    return res.status(200).json({
      success: true,
      skipped: true,
      reason: "Previous cron cycle still running",
      executedAt: new Date().toISOString(),
    });
  }

  const startedAt = Date.now();

  try {

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
      `[CRON] Scan selesai: ${summary.qualifiedCount}/${summary.scannedCount} pair qualified ` +
      `(skor dianalisa: ${summary.scoreStats.analyzedCount}, ` +
      `min ${summary.scoreStats.minScore}, max ${summary.scoreStats.maxScore}, ` +
      `avg ${summary.scoreStats.avgScore}, threshold ${summary.scoreStats.thresholdUsed})`
    );

    // SEMUA pair yang lolos filter opportunityScore, DIBATASI ke
    // top-N (array sudah terurut skor tertinggi dulu di
    // scanner/index.ts) -- executeCron() memproses candidate SATU
    // PER SATU dengan network call asli per pair, jadi durasi
    // total sebanding lurus dengan jumlah candidate. Tanpa cap ini,
    // siklus scan yang qualifiedCount-nya besar (market ramai)
    // SELALU berisiko timeout, terlepas dari maxDuration di atas.
    // executeCron() sendiri menggabungkan cap ini dengan pair yang
    // SEDANG open position + watchlist manual (TIDAK ikut dibatasi
    // cap ini), jadi tidak ada posisi terbuka yang "ditinggalkan"
    // walau tidak lagi masuk top candidate.
    const MAX_CANDIDATE_PAIRS_PER_CYCLE = 15;

    const candidatePairs = summary.qualifiedPairs.slice(0, MAX_CANDIDATE_PAIRS_PER_CYCLE);

    if (summary.qualifiedPairs.length > MAX_CANDIDATE_PAIRS_PER_CYCLE) {
      console.log(
        `[CRON] ${summary.qualifiedPairs.length} pair qualified, dibatasi ke ${MAX_CANDIDATE_PAIRS_PER_CYCLE} teratas siklus ini (cegah timeout).`
      );
    }

    const tradingResult = await executeCron(candidatePairs);

    console.log("[CRON] Trading engine:", tradingResult);

    return res.status(200).json({
      success: true,
      executedAt: new Date().toISOString(),
      summary,
      trading: tradingResult,
    });

  } catch (error) {
    console.error("[CRON SCAN ERROR]", error);
    return res.status(500).json({ error: "Scan failed" });
  } finally {
    await lock.release();
  }

}
