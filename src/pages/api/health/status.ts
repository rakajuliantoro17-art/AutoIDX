/**
==========================================================
AURA Trade OS
System Health Endpoint (public, read-only)
Version : 0.1.0

Menutup celah: sebelum ini TIDAK ADA cara dari LUAR Vercel
untuk tahu apakah "auto live trading" masih benar-benar hidup
(scan.ts masih dipicu cron-job.org) atau posisi masih terjaga
konsisten (reconcile.ts). Endpoint ini sengaja PUBLIK & READ-
ONLY (tidak butuh CRON_SECRET/Firebase Auth) supaya bisa
ditembak layanan uptime monitor eksternal (UptimeRobot,
Better Stack, dll) yang akan mengirim alert sendiri (SMS/
email/push) kalau statusnya tidak "ok" -- lapisan pengawasan
TERPISAH dari sistem itu sendiri, supaya kalau Vercel/Firestore
project ini bermasalah total, operator tetap diberi tahu dari
luar.

Tidak ada data sensitif yang di-expose (bukan saldo, bukan
posisi per pair, bukan API key) -- cuma status liveness/
konsistensi agregat.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { getCronHeartbeatStatus } from "@/services/scheduler/cronHeartbeat";
import { getReconciliationStatus } from "@/services/firebase/reconciliationStatus";
import { checkRateLimit } from "@/services/security/rateLimitStore";

const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 1000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Dibatasi per-IP supaya endpoint publik ini tidak jadi celah
  // beban berlebih ke Firestore -- 60 request/menit lebih dari
  // cukup untuk kebutuhan uptime monitor (biasanya cek tiap 1-5
  // menit).
  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim() ??
    req.socket.remoteAddress ??
    "unknown";

  const rateLimit = await checkRateLimit(`health:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);

  if (!rateLimit.allowed) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  try {

    const [heartbeat, reconciliation] = await Promise.all([
      getCronHeartbeatStatus(),
      getReconciliationStatus(),
    ]);

    const reconciliationOk =
      reconciliation !== null && reconciliation.consistent;

    const overallOk = heartbeat.status === "ALIVE" && reconciliationOk;

    return res.status(overallOk ? 200 : 503).json({
      ok: overallOk,
      cronScan: {
        status: heartbeat.status,
        lastRunAgoMs: heartbeat.ageMs,
      },
      reconciliation: {
        consistent: reconciliation?.consistent ?? null,
        lastCheckedAgoMs:
          reconciliation !== null ? Date.now() - reconciliation.checkedAt : null,
      },
      checkedAt: new Date().toISOString(),
    });

  } catch (error) {

    console.error("[HEALTH] Gagal cek status:", error);

    return res.status(503).json({
      ok: false,
      error: "Gagal membaca status sistem",
    });

  }

}
