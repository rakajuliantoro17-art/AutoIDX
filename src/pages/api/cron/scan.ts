/**
==========================================================
AURA Trade OS
Cron: Market Scanner + Trading Engine Trigger
Version : 0.0.6 Alpha

Perubahan dari 0.0.5: TradingEngine sekarang SELALU jalan
untuk TRADING_CONFIG.pair lewat executeCron() - tidak lagi
bergantung pada topOpportunities hasil scanner. Sebelumnya,
kalau tidak ada pair yang lolos filter opportunityScore
scanner, TradingEngine tidak pernah tereksekusi sama sekali
(bot_state/bot_settings/paper trading collection kosong).
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import marketScanner from "@/services/scanner";
import { adminDb } from "@/services/firebase/admin";
import { executeCron } from "@/services/scheduler/cron";

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

    // 1. Jalankan market scanner (untuk data dashboard)
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

    // 3. Jalankan Trading Engine untuk pair yang di-trading
    // (TRADING_CONFIG.pair) - SELALU jalan, TIDAK bergantung
    // pada hasil filter scanner (topOpportunities). Scanner
    // dan trading engine adalah 2 sistem sinyal terpisah;
    // scanner untuk informasi dashboard, trading engine untuk
    // keputusan BUY/SELL/HOLD yang sesungguhnya.
    const tradingResult = await executeCron();

    console.log("[CRON] Trading engine:", tradingResult);

    // 4. Response akhir
    return res.status(200).json({
      success: true,
      executedAt: new Date().toISOString(),
      summary,
      trading: tradingResult,
    });

  } catch (error) {
    console.error("[CRON SCAN ERROR]", error);
    return res.status(500).json({ error: "Scan failed" });
  }

}
