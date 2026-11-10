/**
==========================================================
AURA Trade OS
Cron: Pengamat Exit (SL/TP) untuk posisi terbuka
==========================================================
Ringan dan murah: tanpa scan market/BUY. Dijadwalkan cron-job.org
(mis. menit ganjil, tiap 2 menit) dengan header Authorization yang
sama seperti /api/cron/scan.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { verifyCronSecret } from "@/lib/auth/cronAuth";
import { withQuotaGuard, isQuotaError } from "@/lib/quota/quotaBreaker";
import { acquireCronLock, EXIT_LOCK_DOC_ID } from "@/services/scheduler/cronLock";
import { runExitCycle } from "@/services/scheduler/exitCycle";
import { getOpenPositionPairs } from "@/services/firebase/botState";
import { TradingEngine } from "@/services/trading/engine";
import indodaxMarketService from "@/services/indodax/market";
import { adminDb } from "@/services/firebase/admin";
import { installReadCounter, resetReadCounts, totalReads } from "@/services/firebase/readCounter";

export const config = { maxDuration: 30 };

async function exitHandler(req: NextApiRequest, res: NextApiResponse) {
  const auth = verifyCronSecret(req.headers.authorization, "CRON EXIT");
  if (!auth.ok) {
    console.error(auth.logMessage);
    return res.status(auth.status).json({ error: auth.error });
  }
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    try {
      installReadCounter();
      resetReadCounts();
    } catch {
      /* diagnostik saja */
    }

    const outcome = await runExitCycle({
      acquireLock: (ms) => acquireCronLock(ms, EXIT_LOCK_DOC_ID),
      getOpenPairs: getOpenPositionPairs,
      getPrice: async (pair) => {
        const s = await indodaxMarketService.getMarketSummary(pair);
        return s ? Number(s.lastPrice) : null;
      },
      checkExit: (input) => TradingEngine.runExitCheck(input),
      recordHeartbeat: async (info) => {
        await adminDb.collection("system_status").doc("exitHeartbeat").set({
          lastRunAt: Date.now(),
          ...info,
        });
      },
    });

    if (outcome.status === "skipped") {
      return res.status(200).json({ success: true, skipped: true, throttled: outcome.throttled, reason: outcome.reason });
    }
    const reads = totalReads();
    console.log(
      `[CRON EXIT] checked=${outcome.checked} exited=${outcome.exited.length} errors=${outcome.errors.length} reads=${reads} durationMs=${outcome.durationMs}`
    );
    return res.status(200).json({ success: true, ...outcome, reads });
  } catch (error) {
    if (isQuotaError(error)) throw error;
    console.error("[CRON EXIT ERROR]", error);
    return res.status(500).json({ error: "Exit check failed" });
  }
}

export default withQuotaGuard("CRON EXIT", exitHandler);
