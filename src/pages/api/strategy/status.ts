/**
==========================================================
AURA Trade OS
Strategy Status API (Server-side)
Version : 0.1.0 Alpha

GET: lihat status enable/disable semua strategi (dari Firestore,
sumber kebenaran - lihat strategy/registryStore.ts).
POST { name, status: "ACTIVE"|"DISABLED" }: toggle satu strategi.

Kalau strategi yang sedang aktif sesuai mode di-disable, bot
FALLBACK ke AURA_TREND (keputusan operator - lihat
strategy/manager.ts getStrategyName()). Kalau AURA_TREND sendiri
di-disable, bot HOLD total sampai diaktifkan lagi.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { checkRateLimit } from "@/services/security/rateLimitStore";
import { getStrategyStatusMap, setStrategyStatus, StrategyStatusValue } from "@/services/strategy/registryStore";

const KNOWN_STRATEGIES = ["AURA_TREND", "EMA_CROSSOVER", "MOMENTUM"];

const TOGGLE_RATE_LIMIT = 10;
const TOGGLE_RATE_WINDOW_MS = 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifyApiAuth(req);

  if (!user) {
    return res.status(401).json({ error: "Unauthorized - login diperlukan" });
  }

  if (req.method === "GET") {
    try {
      const statusMap = await getStrategyStatusMap();

      const strategies = KNOWN_STRATEGIES.map((name) => ({
        name,
        status: (statusMap[name] === "DISABLED" ? "DISABLED" : "ACTIVE") as StrategyStatusValue,
      }));

      return res.status(200).json({ strategies });
    } catch (error) {
      console.error("[Strategy Status API]", error);
      return res.status(500).json({ error: "Gagal ambil status strategi." });
    }
  }

  if (req.method === "POST") {
    const rateLimit = await checkRateLimit(`strategy_toggle:${user.uid}`, TOGGLE_RATE_LIMIT, TOGGLE_RATE_WINDOW_MS);

    if (!rateLimit.allowed) {
      res.setHeader("Retry-After", Math.ceil((rateLimit.resetAt - Date.now()) / 1000));
      return res.status(429).json({ error: "Terlalu sering toggle - coba lagi sebentar." });
    }

    const { name, status } = req.body ?? {};

    if (!KNOWN_STRATEGIES.includes(name)) {
      return res.status(400).json({ error: `Nama strategi tidak dikenal: ${name}` });
    }

    if (status !== "ACTIVE" && status !== "DISABLED") {
      return res.status(400).json({ error: 'status harus "ACTIVE" atau "DISABLED"' });
    }

    try {
      await setStrategyStatus(name, status);

      return res.status(200).json({
        success: true,
        message: `Strategi ${name} sekarang ${status}. Berlaku mulai siklus cron berikutnya (di-refresh sekali per siklus, bukan real-time).`,
      });
    } catch (error) {
      console.error("[Strategy Status API]", error);
      return res.status(500).json({ error: "Gagal menyimpan status strategi." });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
