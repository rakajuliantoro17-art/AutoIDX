/**
==========================================================
AURA Trade OS
Bot State API (Server-side)
Version : 0.1.0 Alpha

Expose getBotState() (bot_state/{pair} di Firestore) untuk
dashboard Overview - sebelumnya dashboard salah pakai
/api/market (MarketScanner, tujuannya beda: cari peluang
lintas-pair, bukan status pair yang sedang ditradingkan bot,
dan field-nya tidak match sama sekali dengan yang diharapkan
dashboard).

bot_state adalah SUMBER KEBENARAN status bot yang sebenarnya
(currentPrice/lastSignal di-update tiap siklus oleh
services/trading/engine.ts, termasuk saat HOLD).
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/services/firebase/admin";
import { getBotState } from "@/services/firebase/botState";

async function getUidFromRequest(
  req: NextApiRequest
): Promise<string | null> {

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.replace("Bearer ", "");

  try {

    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;

  } catch (error) {

    console.error("[Bot State API] Token invalid:", error);
    return null;

  }

}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uid = await getUidFromRequest(req);

  if (!uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {

    const pair =
      typeof req.query.pair === "string" ? req.query.pair : "btc_idr";

    const state = await getBotState(pair);

    return res.status(200).json({
      pair: state.pair,
      currentPrice: state.currentPrice,
      lastSignal: state.lastSignal,
      inPosition: state.inPosition,
      entryPrice: state.entryPrice,
      coinAmount: state.coinAmount,
      stopLoss: state.stopLoss,
      takeProfit: state.takeProfit,
    });

  } catch (error) {

    console.error("[Bot State API]", error);

    return res.status(500).json({
      error: "Gagal mengambil status bot.",
    });

  }

}
