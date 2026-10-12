/** GET /api/positions/check -- bandingkan posisi bot_state dengan saldo Indodax (khusus pemilik). */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { isOwner } from "@/services/agents/decisions";
import { checkOpenPositions } from "@/services/positions/positionCheck";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const user = await verifyApiAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized." });
  if (!isOwner(user.uid)) return res.status(403).json({ error: "Hanya pemilik." });

  try {
    return res.status(200).json({ positions: await checkOpenPositions() });
  } catch (error) {
    console.error("[POSITIONS CHECK ERROR]", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Gagal memeriksa posisi." });
  }
}
