/** POST /api/positions/unmark-unmanaged {asset, confirm:true} -- batalkan penandaan "di luar kelolaan" (pemilik, ter-audit). Tidak mengirim order. */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { isOwner } from "@/services/agents/decisions";
import { recordAudit } from "@/services/firebase/auditTrail";
import { recordLog } from "@/services/firebase/logService";
import { getUnmanagedHoldings, removeUnmanagedHolding } from "@/services/positions/unmanaged";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const user = await verifyApiAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized." });
  if (!isOwner(user.uid)) return res.status(403).json({ error: "Hanya pemilik." });

  const asset = typeof req.body?.asset === "string" ? req.body.asset.trim().toLowerCase() : "";
  if (!/^[a-z0-9]{2,10}$/.test(asset) || asset === "idr") return res.status(400).json({ error: "asset tidak valid." });
  if (req.body?.confirm !== true) return res.status(400).json({ error: "confirm:true wajib." });

  try {
    const current = await getUnmanagedHoldings();
    if (!(current[asset] > 0)) return res.status(409).json({ ok: false, message: "Aset itu tidak sedang ditandai." });
    const prev = await removeUnmanagedHolding(asset);
    const actor = user.email ?? user.uid;
    await recordAudit("settings.update", actor, [{ field: `unmanaged:${asset}`, before: prev, after: 0 }], { via: "unmark_unmanaged" });
    await recordLog("RISK", "warning", `[Posisi] Penandaan "di luar kelolaan" ${asset.toUpperCase()} (${prev}) dibatalkan oleh ${actor}.`);
    return res.status(200).json({ ok: true, message: `Penandaan ${asset.toUpperCase()} dibatalkan.` });
  } catch (error) {
    console.error("[UNMARK UNMANAGED ERROR]", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Gagal membatalkan." });
  }
}
