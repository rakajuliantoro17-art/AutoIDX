/** POST /api/positions/release {pair} -- lepas posisi di bawah minimum order dari bot (khusus pemilik, ter-audit). Tidak mengirim order. */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { isOwner } from "@/services/agents/decisions";
import { recordAudit } from "@/services/firebase/auditTrail";
import { recordLog } from "@/services/firebase/logService";
import { releaseStuckPosition } from "@/services/positions/positionCheck";

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
  if (req.body?.confirm !== true) return res.status(400).json({ error: "confirm:true wajib." });

  try {
    const result = await releaseStuckPosition(pair);
    if (result.ok) {
      const actor = user.email ?? user.uid;
      await recordAudit(
        "settings.update",
        actor,
        [
          { field: `position:${pair}:coinAmount`, before: result.qty ?? null, after: 0 },
          { field: `position:${pair}:inPosition`, before: true, after: false },
        ],
        { via: "position_release_below_min", valueIdr: result.valueIdr ?? null }
      );
      await recordLog("RISK", "warning", `[Posisi] ${pair.toUpperCase()} dilepas dari kelolaan bot oleh ${actor} (di bawah minimum order, nilai ~Rp${result.valueIdr}). Koin tetap di dompet; tidak ada order dikirim.`);
    }
    return res.status(result.ok ? 200 : 409).json(result);
  } catch (error) {
    console.error("[POSITIONS RELEASE ERROR]", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Gagal melepas posisi." });
  }
}
