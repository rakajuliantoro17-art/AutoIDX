/** GET /api/canary/readiness -- apakah BUY live pertama akan lolos semua gerbang (khusus pemilik, baca-saja). */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { isOwner } from "@/services/agents/decisions";
import { adminDb } from "@/services/firebase/admin";
import { getBotControl } from "@/services/firebase/botControl";
import { getOpenPositionsCount } from "@/services/firebase/botState";
import { getFeatureFlags } from "@/services/firebase/featureFlags";
import { getReconciliationStatus } from "@/services/firebase/reconciliationStatus";
import { getActiveIndodaxAccount } from "@/services/firebase/indodaxAccountsAdmin";
import { IndodaxClient } from "@/services/liveTrading/exchange/indodaxClient";
import { getLiveTradingConfig } from "@/services/liveTrading/risk/liveTradingConfig";
import { getEffectiveTradingConfig } from "@/services/trading/effectiveConfig";
import { RISK_CONFIG } from "@/config/risk";
import { MAX_EXPOSURE_PERCENT, MIN_ORDER_VALUE } from "@/config/limits";
import { evaluateCanaryReadiness } from "@/services/canary/readiness";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const user = await verifyApiAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized." });
  if (!isOwner(user.uid)) return res.status(403).json({ error: "Hanya pemilik." });

  try {
    const [control, effective, flags, reconcile, openPositions, uncertain, account] = await Promise.all([
      getBotControl(),
      getEffectiveTradingConfig(),
      getFeatureFlags(),
      getReconciliationStatus(),
      getOpenPositionsCount(),
      adminDb.collection("live_order_locks").where("status", "==", "UNCERTAIN").limit(5).get(),
      getActiveIndodaxAccount(),
    ]);

    let idrBalance: number | null = null;
    let balanceError: string | undefined;
    if (account) {
      const info = await new IndodaxClient({ apiKey: account.apiKey, secretKey: account.secretKey }).getInfo();
      if (info.success) {
        const v = Number(info.data.balance?.idr ?? 0);
        idrBalance = Number.isFinite(v) ? v : 0;
      } else {
        balanceError = info.message;
      }
    } else {
      balanceError = "Tidak ada akun aktif.";
    }

    const canary = getLiveTradingConfig();
    const result = evaluateCanaryReadiness({
      mode: control.mode,
      liveConfirm: process.env.BOT_LIVE_CONFIRM === "true",
      emergencyStop: control.emergencyStop,
      canaryEnabled: canary.enabled,
      canaryOnly: canary.canaryOnly,
      canaryMaxTradeAmount: canary.maxTradeAmount,
      canaryMaxOpenOrders: canary.maxOpenOrders,
      tradeAmountIdr: effective.tradeAmountIdr,
      maxOpenPositions: effective.maxOpenPositions,
      maxExposurePercent: RISK_CONFIG.maxExposurePercent,
      absoluteMaxExposurePercent: MAX_EXPOSURE_PERCENT,
      portfolioExposureLimitOn: flags.portfolioExposureLimit,
      minOrderValue: MIN_ORDER_VALUE,
      idrBalance,
      balanceError,
      hasActiveAccount: !!account,
      reconcile: reconcile ? { consistent: reconcile.consistent, checkedAt: reconcile.checkedAt, mismatchCount: reconcile.mismatchCount } : null,
      reconcileMaxAgeMs: (Number(process.env.BOT_CANARY_RECONCILIATION_MAX_AGE_MINUTES) || 15) * 60_000,
      uncertainLocks: uncertain.size,
      openPositions,
      now: Date.now(),
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error("[CANARY READINESS ERROR]", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Gagal memeriksa kesiapan." });
  }
}
