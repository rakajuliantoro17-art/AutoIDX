/**
 * POST /api/settings/indodax-trade-test  { "confirm": true }
 * Uji izin TRADE API key (khusus pemilik): limit BUY jauh di bawah pasar lalu
 * langsung dibatalkan. Tidak memindahkan uang. Lihat services/accounts/tradePermissionTest.ts.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { isOwner } from "@/services/agents/decisions";
import { adminDb } from "@/services/firebase/admin";
import { getOpenPositionsCount } from "@/services/firebase/botState";
import { recordAudit } from "@/services/firebase/auditTrail";
import { getActiveIndodaxAccount } from "@/services/firebase/indodaxAccountsAdmin";
import { IndodaxClient } from "@/services/liveTrading/exchange/indodaxClient";
import { checkRateLimit } from "@/services/security/rateLimitStore";
import { runTradePermissionTest, type TradeTestClient } from "@/services/accounts/tradePermissionTest";

export const config = { maxDuration: 30 };

const PAIR = "btc_idr";

function toTradeTestClient(client: IndodaxClient): TradeTestClient {
  return {
    async getLastPrice(pair) {
      const r = await client.publicRequest(`ticker/${pair.replace("_", "")}`);
      const last = Number((r.data as { ticker?: { last?: string } } | null)?.ticker?.last);
      return r.success && Number.isFinite(last) ? last : null;
    },
    async placeLimitBuy({ pair, price, idr }) {
      const r = await client.trade({ pair, type: "buy", orderType: "limit", price, idr });
      if (!r.success) return { success: false, message: r.message };
      return { success: true, orderId: String(r.data.order_id) };
    },
    async cancel({ pair, orderId }) {
      const r = await client.cancelOrder({ pair, orderId, type: "buy" });
      return r.success ? { success: true } : { success: false, message: r.message };
    },
    async openOrderIds(pair) {
      const r = await client.openOrders(pair);
      return r.success ? r.data.map((o) => String(o.order_id)) : null;
    },
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const user = await verifyApiAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized." });
  if (!isOwner(user.uid)) return res.status(403).json({ error: "Hanya pemilik." });
  if (req.body?.confirm !== true) return res.status(400).json({ error: "Butuh { confirm: true }." });

  try {
    const limit = await checkRateLimit(`indodax_trade_test:${user.uid}`, 3, 60 * 60 * 1000);
    if (!limit.allowed) return res.status(429).json({ error: "Terlalu sering (maks 3x per jam)." });

    const [openPositions, uncertain] = await Promise.all([
      getOpenPositionsCount(),
      adminDb.collection("live_order_locks").where("status", "==", "UNCERTAIN").limit(1).get(),
    ]);
    if (openPositions > 0 || uncertain.size > 0) {
      return res.status(409).json({ error: "Ada posisi terbuka atau order UNCERTAIN; selesaikan dulu sebelum uji." });
    }

    const account = await getActiveIndodaxAccount();
    if (!account) return res.status(409).json({ error: "Tidak ada akun Indodax aktif." });

    const client = new IndodaxClient({ apiKey: account.apiKey, secretKey: account.secretKey });
    const report = await runTradePermissionTest(toTradeTestClient(client), { pair: PAIR });

    await recordAudit("indodax_trade_test.run", user.uid, [], {
      verdict: report.verdict,
      pair: report.pair,
      orderId: report.orderId ?? null,
    });

    return res.status(200).json(report);
  } catch (error) {
    console.error("[INDODAX TRADE TEST ERROR]", error);
    return res.status(500).json({ ok: false, message: error instanceof Error ? error.message : "Uji gagal." });
  }
}
