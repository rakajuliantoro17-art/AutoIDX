/**
 * GET /api/audit?limit=50 -- riwayat perubahan settings/kontrol bot
 * (wajib login). Read-only.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { getRecentAudit } from "@/services/firebase/auditTrail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!(await verifyApiAuth(req))) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  try {
    const limit = Number(req.query.limit ?? 50);
    return res.status(200).json({ entries: await getRecentAudit(limit) });
  } catch (error) {
    console.error("[AUDIT API ERROR]", error);
    return res.status(500).json({ error: "Gagal membaca audit log." });
  }
}
