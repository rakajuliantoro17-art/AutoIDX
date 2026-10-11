/**
 * GET /api/market/[pair]/candles?resolution=60&limit=100
 * Data candle untuk grafik dashboard (read-only, sama seperti depth).
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getCandles } from "@/services/indodax/candles";

const RESOLUTIONS = ["1", "5", "15", "30", "60", "240", "1D", "1W"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const pair = String(req.query.pair ?? "").toLowerCase();
  if (!/^[a-z0-9]{2,12}_[a-z]{2,6}$/.test(pair)) {
    return res.status(400).json({ error: "Invalid pair" });
  }
  const resolution = String(req.query.resolution ?? "60");
  if (!RESOLUTIONS.includes(resolution)) {
    return res.status(400).json({ error: "Invalid resolution" });
  }
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 10), 300);
  try {
    const candles = await getCandles({ pair, resolution, limit });
    res.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=40");
    return res.status(200).json({ pair, resolution, candles });
  } catch (error) {
    console.error("[CANDLES API ERROR]", error);
    return res.status(500).json({ error: "Candle unavailable" });
  }
}
