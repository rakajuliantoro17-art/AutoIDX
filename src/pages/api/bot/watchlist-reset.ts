/** POST /api/bot/watchlist-reset {confirm:true} -- reset watchlist ke 10 pair rekomendasi seimbang (3 rendah, 4 sedang, 3 tinggi) dari scan terakhir. Pemilik, ter-audit. Tidak mengirim order. Pair berposisi terbuka tetap diproses bot (pairSelection selalu menyertakan posisi terbuka). */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { isOwner } from "@/services/agents/decisions";
import { recordAudit } from "@/services/firebase/auditTrail";
import { recordLog } from "@/services/firebase/logService";
import { getBotControl, updateBotControl } from "@/services/firebase/botControl";
import { adminDb } from "@/services/firebase/admin";
import { pickBalancedWatchlist } from "@/services/scanner/watchlistPick";

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
    // Pool dari scan terakhir (1 pembacaan dokumen).
    const snap = await adminDb.collection("scannerResults").doc("latest").get();
    const data = snap.exists ? snap.data() ?? {} : {};
    const pool = Array.isArray(data.qualifiedPool) ? data.qualifiedPool : [];
    const picked = pickBalancedWatchlist(pool);

    if (picked.length < 10) {
      return res.status(409).json({
        ok: false,
        message: `Data scanner belum cukup untuk memilih 10 pair seimbang (tersedia ${picked.length}). Tunggu 1-2 siklus scan lalu coba lagi.`,
      });
    }

    const control = await getBotControl();
    const before = (control.watchlist ?? []).map((p) => p.trim().toLowerCase());
    const next = picked.map((p) => p.pair);
    const actor = user.email ?? user.uid;
    await updateBotControl({ watchlist: next }, actor);
    const summary = picked.map((p) => `${p.pair.replace("_idr", "").toUpperCase()}(${p.tier[0]})`).join(", ");
    await recordAudit("bot_control.update", actor, [{ field: "watchlist", before, after: next }], { via: "watchlist_reset" });
    await recordLog("BOT", "warning", `[Watchlist] Direset oleh ${actor} ke 10 pair seimbang rendah/sedang/tinggi: ${summary}. Sebelumnya ${before.length || "default"} pair. Pair berposisi terbuka tetap diproses.`);
    return res.status(200).json({ ok: true, message: `Watchlist direset ke 10 pair: ${summary} (L/M/H = risiko rendah/sedang/tinggi).`, picked });
  } catch (error) {
    console.error("[WATCHLIST RESET ERROR]", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Gagal mereset watchlist." });
  }
}
