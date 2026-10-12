/**
 * GET /api/agent/summary -- ringkas untuk widget sidebar: akurasi tiap
 * AI/ML (rapor shadow), jumlah usulan agen yang menunggu, waktu laporan
 * terakhir. Read-only, wajib login.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { cached } from "@/lib/cache/ttlCache";
import { adminDb } from "@/services/firebase/admin";
import { getShadowSummaries } from "@/services/ml/shadow/shadowStore";
import { isFeatureEnabled } from "@/services/firebase/featureFlags";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!(await verifyApiAuth(req))) return res.status(401).json({ error: "Unauthorized." });

  try {
    const [shadow, pending, latest, agentOn, shadowOn] = await cached("agent:summary:raw", 5 * 60_000, () => Promise.all([
      getShadowSummaries().catch(() => ({ ml: null, bySource: {}, updatedAtMs: null })),
      adminDb.collection("agent_recommendations").where("status", "==", "pending").limit(50).get(),
      adminDb.collection("agent_reports").doc("latest").get(),
      isFeatureEnabled("opsAgent"),
      isFeatureEnabled("aiShadowPrediction"),
    ]));

    const sources: Record<string, { scored: number; accuracy: number; baseline: number; verdict: string }> = {};
    const all = { ...shadow.bySource };
    if (shadow.ml && !all.ml) all.ml = shadow.ml;
    for (const [k, s] of Object.entries(all)) {
      sources[k] = {
        scored: s.scored,
        accuracy: s.accuracy,
        baseline: s.majorityBaselineAccuracy,
        verdict: s.verdict,
      };
    }

    res.setHeader("Cache-Control", "private, max-age=30");
    return res.status(200).json({
      sources,
      pendingCount: pending.size,
      lastReportMs: latest.exists ? Number(latest.data()?.createdAtMs) || null : null,
      agentEnabled: agentOn,
      shadowEnabled: shadowOn,
    });
  } catch (error) {
    console.error("[AGENT SUMMARY API ERROR]", error);
    return res.status(500).json({ error: "Gagal memuat ringkasan agen." });
  }
}
