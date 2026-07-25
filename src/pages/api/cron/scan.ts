/**
==========================================================
AURA Trade OS
Cron: Market Scanner Trigger
Version : 0.0.2 Alpha
Dipanggil setiap 5 menit oleh GitHub Actions scheduler.
==========================================================
*/
import type { NextApiRequest, NextApiResponse } from "next";

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

  try {
    // TODO: panggil logic scanner kamu di sini
    // contoh: const result = await runMarketScanner();

    console.log("[CRON] Market scan executed at", new Date().toISOString());

    return res.status(200).json({
      success: true,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON ERROR]", error);
    return res.status(500).json({ error: "Scan failed" });
  }
}
import { runPaperTradingCycle } from "@/services/paperTrading/engine";

// ...di dalam handler, setelah summary didapat dan disimpan ke Firestore:

const paperResult = await runPaperTradingCycle(summary.topOpportunities);
console.log("[CRON] Paper trading:", paperResult);

return res.status(200).json({
  success: true,
  executedAt: new Date().toISOString(),
  summary,
  paperTrading: paperResult,
});
