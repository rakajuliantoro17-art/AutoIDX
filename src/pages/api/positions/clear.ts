/** POST /api/positions/clear {pair} -- bersihkan posisi hantu (khusus pemilik, ter-audit). */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { isOwner } from "@/services/agents/decisions";
import { recordAudit } from "@/services/firebase/auditTrail";
import { recordLog } from "@/services/firebase/logService";
import { clearGhostPosition } from "@/services/positions/positionCheck";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const user = await verifyApiAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized." });
  if (!isOwner(user.uid)) return res.status(403).json({ error: "Hanya pemilik." });

  const pair = typeof req.body?.pair === "string" ? req.body.pair.trim().toLowerCase() : "";
  if (!pair) return res.status(400).json({ error: "pair wajib diisi." });

  try {
    const result = await clearGhostPosition(pair);
    if (result.ok) {
      const actor = user.email ?? user.uid;
      await recordAudit(
        "settings.update",
        actor,
        [
          { field: `position:${pair}:coinAmount`, before: result.before?.localQty ?? null, after: 0 },
          { field: `position:${pair}:inPosition`, before: true, after: false },
        ],
        { via: "position_check", exchangeQty: result.before?.exchangeQty ?? null }
      );
      await recordLog("RISK", "warning", `[Posisi] Posisi hantu ${pair.toUpperCase()} dibersihkan oleh ${actor} (catatan bot ${result.before?.localQty}, saldo Indodax ${result.before?.exchangeQty}).`);
    }
    return res.status(result.ok ? 200 : 409).json(result);
  } catch (error) {
    console.error("[POSITIONS CLEAR ERROR]", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Gagal membersihkan posisi." });
  }
}
