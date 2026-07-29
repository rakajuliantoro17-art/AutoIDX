/**
==========================================================
AURA Trade OS
Cron: Market Scanner + Trading Engine Trigger
Version : 0.0.5 Alpha
Dipanggil setiap 5 menit oleh GitHub Actions scheduler.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import marketScanner from "@/services/scanner";
import { adminDb } from "@/services/firebase/admin";
import TradingEngine from "@/services/trading/engine";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // Proteksi: cuma request dengan secret yang benar yang diproses
  const authHeader = req.headers.authorization;
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const startedAt = Date.now();

  try {

    // 1. Jalankan market scanner
    const summary = await marketScanner.scanMarket();

    // 2. Simpan hasil scan ke Firestore
    await adminDb.collection("scannerResults").doc("latest").set({
      ...summary,
      durationMs: Date.now() - startedAt,
    });

    await adminDb.collection("scannerHistory").add({
      ...summary,
      durationMs: Date.now() - startedAt,
    });

    console.log(
      `[CRON] Scan selesai: ${summary.qualifiedCount}/${summary.scannedCount} pair qualified`
    );

    // 3. Jalankan Trading Engine untuk tiap pair hasil scan
    // (menulis bot state & log ke Firestore, dibaca dashboard)
    const tradingResults = [];

    for (const opportunity of summary.topOpportunities) {
      const result = await TradingEngine.run({
        pair: opportunity.pair,
        price: opportunity.lastPrice,
        rsi: opportunity.rsi14,
        emaFast: opportunity.emaFast,
        emaSlow: opportunity.emaSlow,
      });
      tradingResults.push(result);
    }

    console.log("[CRON] Trading engine:", tradingResults);

    // 4. Response akhir
    return res.status(200).json({
      success: true,
      executedAt: new Date().toISOString(),
      summary,
      trading: tradingResults,
    });

  } catch (error) {
    console.error("[CRON SCAN ERROR]", error);
    return res.status(500).json({ error: "Scan failed" });
  }

}
