/**
 * GET  /api/flags            -> status semua flag (wajib login)
 * POST /api/flags {name,value} -> ubah satu flag (HANYA pemilik, tercatat di audit_logs)
 * Flag tidak bisa melonggarkan gerbang live (mode live + BOT_LIVE_CONFIRM tetap berlaku).
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { isOwner } from "@/services/agents/decisions";
import { recordAudit } from "@/services/firebase/auditTrail";
import { getFeatureFlags, setFeatureFlag } from "@/services/firebase/featureFlags";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyApiAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized." });

  try {
    if (req.method === "GET") {
      return res.status(200).json({ flags: await getFeatureFlags(), isOwner: isOwner(user.uid) });
    }
    if (req.method === "POST") {
      if (!isOwner(user.uid)) return res.status(403).json({ error: "Hanya pemilik yang boleh mengubah flag." });
      const { name, value } = req.body ?? {};
      if (typeof name !== "string" || typeof value !== "boolean") {
        return res.status(400).json({ error: "name (string) dan value (boolean) wajib diisi." });
      }
      let before: boolean;
      try {
        ({ before } = await setFeatureFlag(name, value));
      } catch {
        return res.status(400).json({ error: "Nama flag tidak terdaftar." });
      }
      await recordAudit("settings.update", user.email ?? user.uid, [{ field: `flag:${name}`, before, after: value }], {
        via: "flags_panel",
      });
      return res.status(200).json({ ok: true, name, value });
    }
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error("[FLAGS API ERROR]", error);
    return res.status(500).json({ error: "Gagal memproses flag." });
  }
}
