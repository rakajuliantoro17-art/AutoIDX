/**
 * Cron harian: Ops Agent (laporan + usulan). Auth: Bearer CRON_SECRET.
 * Aktif hanya bila flag Firestore `opsAgent` = true. Tidak mengubah
 * setting/order; hanya menulis agent_reports & agent_recommendations.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyCronSecret } from "@/lib/auth/cronAuth";
import { isFeatureEnabled } from "@/services/firebase/featureFlags";
import { runOpsAgent } from "@/services/agents/opsAgent";

export const config = { maxDuration: 60 };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = verifyCronSecret(req.headers.authorization, "CRON AGENT");
  if (!auth.ok) {
    console.error(auth.logMessage);
    return res.status(auth.status).json({ error: auth.error });
  }
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    if (!(await isFeatureEnabled("opsAgent"))) {
      return res.status(200).json({ skipped: true, reason: "flag opsAgent mati" });
    }
    return res.status(200).json({ ok: true, ...(await runOpsAgent()) });
  } catch (error) {
    console.error("[CRON AGENT ERROR]", error);
    return res.status(500).json({ error: "Agent gagal dijalankan." });
  }
}
