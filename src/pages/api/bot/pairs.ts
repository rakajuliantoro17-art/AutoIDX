/**
==========================================================
AURA Trade OS
Bot Tracked Pairs API (Server-side)
Version : 0.1.0 Alpha

Dipakai dashboard Overview untuk mengisi pilihan pair yang
bisa ditampilkan -- sebelumnya cuma "btc_idr" hardcode,
padahal bot scan & bisa BUY pair manapun (services/scanner/).
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/services/firebase/admin";
import { getOpenPositionPairs } from "@/services/firebase/botState";
import { getBotControl } from "@/services/firebase/botControl";
import { selectDisplayPairs } from "@/services/scheduler/displayPairs";
import { TRADING_CONFIG } from "@/config/trading";

// Sinkron dengan default watchlist di config/trading.ts -- dipakai
// kalau bot_state masih kosong total (instalasi baru, belum pernah
// ada siklus scan/cron sama sekali).
const FALLBACK_PAIRS = TRADING_CONFIG.pairs;

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

    console.error("[Bot Pairs API] Token invalid:", error);
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

  // Watchlist (Trading Pair Universe) + posisi terbuka -- pair yang memang dikelola bot.
  const [control, openPairs] = await Promise.all([getBotControl(), getOpenPositionPairs()]);
  const pairs = selectDisplayPairs(control.watchlist, openPairs, FALLBACK_PAIRS);

  return res.status(200).json({ pairs });

}
