/**
 * POST /api/agent/decide  body: { id, decision: "approve" | "reject" }
 * HANYA pemilik (BOT_OWNER_UID). Setiap persetujuan tercatat di audit_logs.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { decideRecommendation, isOwner } from "@/services/agents/decisions";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const user = await verifyApiAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized." });
  if (!isOwner(user.uid)) return res.status(403).json({ error: "Hanya pemilik yang boleh memutuskan usulan agen." });

  const { id, decision } = req.body ?? {};
  if (typeof id !== "string" || !/^[A-Za-z0-9_-]{3,120}$/.test(id) || (decision !== "approve" && decision !== "reject")) {
    return res.status(400).json({ error: "id dan decision (approve/reject) wajib diisi." });
  }
  try {
    const result = await decideRecommendation(id, decision, user.email ?? user.uid);
    if (!result.ok) return res.status(result.code).json({ error: result.error });
    return res.status(200).json(result);
  } catch (error) {
    console.error("[AGENT DECIDE API ERROR]", error);
    return res.status(500).json({ error: "Gagal memproses keputusan." });
  }
}
