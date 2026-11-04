/** POST /api/bot/watchlist-reset {confirm:true} -- kembalikan watchlist ke daftar awal (BOT_PAIRS/10 pair bawaan). Pemilik, ter-audit. Tidak mengirim order. Pair berposisi terbuka tetap diproses bot (pairSelection selalu menyertakan posisi terbuka). */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { isOwner } from "@/services/agents/decisions";
import { recordAudit } from "@/services/firebase/auditTrail";
import { recordLog } from "@/services/firebase/logService";
import { getBotControl, updateBotControl } from "@/services/firebase/botControl";
import { TRADING_CONFIG } from "@/config/trading";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const user = await verifyApiAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized." });
  if (!isOwner(user.uid)) return res.status(403).json({ error: "Hanya pemilik." });
  if (req.body?.confirm !== true) return res.status(400).json({ error: "confirm:true wajib." });

  try {
    const control = await getBotControl();
    const before = (control.watchlist ?? []).map((p) => p.trim().toLowerCase());
    if (before.length === 0) {
      return res.status(409).json({ ok: false, message: "Watchlist sudah memakai daftar awal." });
    }
    const actor = user.email ?? user.uid;
    // Daftar kosong = bot kembali ke TRADING_CONFIG.pairs (BOT_PAIRS / 10 pair bawaan).
    await updateBotControl({ watchlist: [] }, actor);
    await recordAudit("bot_control.update", actor, [{ field: "watchlist", before, after: [] }], { via: "watchlist_reset" });
    await recordLog("BOT", "warning", `[Watchlist] Direset ke daftar awal (${TRADING_CONFIG.pairs.length} pair) oleh ${actor}; sebelumnya ${before.length} pair. Pair berposisi terbuka tetap diproses.`);
    return res.status(200).json({ ok: true, message: `Watchlist kembali ke ${TRADING_CONFIG.pairs.length} pair awal.`, before: before.length, after: TRADING_CONFIG.pairs.length });
  } catch (error) {
    console.error("[WATCHLIST RESET ERROR]", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Gagal mereset watchlist." });
  }
}
