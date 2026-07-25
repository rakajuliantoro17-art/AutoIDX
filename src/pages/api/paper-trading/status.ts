/**
==========================================================
AURA Trade OS
Paper Trading Status Endpoint
Version : 0.0.3 Alpha
==========================================================
*/
import type { NextApiRequest, NextApiResponse } from "next";
import { adminDb } from "@/services/firebase/admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const portfolioSnap = await adminDb.doc("paper_portfolio/default").get();
    const portfolio = portfolioSnap.exists ? portfolioSnap.data() : null;

    const positionsSnap = await adminDb
      .collection("paper_positions")
      .where("inPosition", "==", true)
      .get();
    const openPositions = positionsSnap.docs.map((d) => d.data());

    const logsSnap = await adminDb
      .collection("paper_trade_logs")
      .orderBy("executedAt", "desc")
      .limit(20)
      .get();
    const trades = logsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const realizedPnl = trades.reduce((sum: number, t: any) => sum + (t.pnlIdr ?? 0), 0);

    return res.status(200).json({ portfolio, openPositions, trades, realizedPnl });
  } catch (error) {
    console.error("[PAPER TRADING STATUS ERROR]", error);
    return res.status(500).json({ error: "Failed to load paper trading status" });
  }
}
