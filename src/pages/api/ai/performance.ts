/**
 * GET /api/ai/performance -- rapor shadow: seberapa akurat tiap AI
 * (ML, OpenAI, Gemini, Claude, DeepSeek, konsensus) terhadap harga nyata
 * 10 candle (1 jam) setelah prediksi. Read-only, wajib login.
 * Data terisi bila flag Firestore `aiShadowPrediction` menyala.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { getShadowSummaries } from "@/services/ml/shadow/shadowStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!(await verifyApiAuth(req))) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  try {
    return res.status(200).json(await getShadowSummaries());
  } catch (error) {
    console.error("[AI PERFORMANCE API ERROR]", error);
    return res.status(500).json({ error: "Gagal membaca rapor AI." });
  }
}
