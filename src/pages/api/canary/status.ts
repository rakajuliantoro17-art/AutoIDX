/**
==========================================================
AURA Trade OS
Canary Status API (Server-side)
Version : 0.1.0 Alpha

Expose snapshot Canary Metrics (services/liveTrading/monitoring/
canaryMetrics.ts + canaryStore.ts) - dipakai memantau kesehatan
live trading skala kecil (win rate, error rate, drawdown,
latency) selama fase testing sebelum discale up.

POST dengan { "reset": true } untuk mulai ulang periode canary
dari nol (mis. setelah ganti strategi/parameter).
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/services/firebase/admin";
import { getCanarySnapshot, resetCanary } from "@/services/liveTrading/monitoring/canaryStore";

async function getUidFromRequest(req: NextApiRequest): Promise<string | null> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.replace("Bearer ", "");

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;
  } catch (error) {
    console.error("[Canary Status API] Token invalid:", error);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const uid = await getUidFromRequest(req);

  if (!uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const snapshot = await getCanarySnapshot();
      return res.status(200).json({ snapshot });
    } catch (error: any) {
      console.error("[Canary Status API]", error);
      return res.status(500).json({ error: error?.message ?? "Gagal ambil status canary" });
    }
  }

  if (req.method === "POST") {
    try {
      const body = req.body ?? {};

      if (body.reset === true) {
        await resetCanary();
        return res.status(200).json({ success: true, message: "Canary metrics direset." });
      }

      return res.status(400).json({ error: 'Body harus { "reset": true } untuk reset.' });
    } catch (error: any) {
      console.error("[Canary Status API]", error);
      return res.status(500).json({ error: error?.message ?? "Gagal reset canary" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
