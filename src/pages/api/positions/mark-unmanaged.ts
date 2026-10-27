/** POST /api/positions/mark-unmanaged {asset, confirm:true} -- tandai selisih koin sebagai "di luar kelolaan" (pemilik, ter-audit). Tidak mengirim order. */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { isOwner } from "@/services/agents/decisions";
import { recordAudit } from "@/services/firebase/auditTrail";
import { recordLog } from "@/services/firebase/logService";
import { addUnmanagedHolding } from "@/services/positions/unmanaged";
import { loadWallet } from "@/services/positions/walletLoad";

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
    const wallet = await loadWallet();
    const row = wallet.rows.find((r) => r.asset === asset);
    if (!row || row.status !== "TAK_TERLACAK") {
      return res.status(409).json({ ok: false, message: "Koin itu tidak bertanda TAK TERLACAK (sudah dikelola/di luar kelolaan atau saldo nol)." });
    }
    await addUnmanagedHolding(asset, row.extraQty);
    const actor = user.email ?? user.uid;
    await recordAudit(
      "settings.update",
      actor,
      [{ field: `unmanaged:${asset}`, before: row.unmanagedQty, after: row.unmanagedQty + row.extraQty }],
      { via: "mark_unmanaged" }
    );
    await recordLog("RISK", "warning", `[Posisi] ${asset.toUpperCase()} (${row.extraQty}) ditandai "di luar kelolaan" oleh ${actor}. Jumlah ini dikurangkan dari saldo bursa saat rekonsiliasi.`);
    return res.status(200).json({ ok: true, message: `${asset.toUpperCase()} ${row.extraQty} ditandai di luar kelolaan.` });
  } catch (error) {
    console.error("[MARK UNMANAGED ERROR]", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Gagal menandai." });
  }
}
