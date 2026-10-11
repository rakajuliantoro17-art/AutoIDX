/**
 * GET  /api/agent/report -> laporan terbaru + usulan (wajib login)
 * POST /api/agent/report -> jalankan agen sekarang (HANYA pemilik, flag opsAgent)
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { isFeatureEnabled } from "@/services/firebase/featureFlags";
import { getLatestAgentView, runOpsAgent } from "@/services/agents/opsAgent";
import { isOwner } from "@/services/agents/decisions";

export const config = { maxDuration: 60 };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyApiAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized." });
  const owner = isOwner(user.uid);

  try {
    if (req.method === "GET") {
      const [view, enabled] = await Promise.all([getLatestAgentView(), isFeatureEnabled("opsAgent")]);
      return res.status(200).json({ ...view, isOwner: owner, enabled });
    }
    if (req.method === "POST") {
      if (!owner) return res.status(403).json({ error: "Hanya pemilik yang boleh menjalankan agen." });
      if (!(await isFeatureEnabled("opsAgent"))) {
        return res.status(409).json({ error: "Flag opsAgent belum dinyalakan." });
      }
      return res.status(200).json({ ok: true, ...(await runOpsAgent()) });
    }
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error("[AGENT REPORT API ERROR]", error);
    return res.status(500).json({ error: "Gagal memproses permintaan agen." });
  }
}
