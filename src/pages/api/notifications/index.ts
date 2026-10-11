/**
 * GET /api/notifications -- umpan notifikasi dalam portal (wajib login, read-only):
 * profit/rugi trade, perubahan setting/flag/kontrol, emergency stop, usulan agen.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { adminDb } from "@/services/firebase/admin";
import { buildNotifications } from "@/services/notifications/feed";

function toMs(v: unknown): number {
  if (v && typeof v === "object" && "toMillis" in v && typeof (v as { toMillis: unknown }).toMillis === "function") {
    return (v as { toMillis: () => number }).toMillis();
  }
  return typeof v === "number" ? v : 0;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!(await verifyApiAuth(req))) return res.status(401).json({ error: "Unauthorized." });

  try {
    const [tradeSnap, auditSnap, logSnap, recSnap] = await Promise.all([
      adminDb.collection("trades").orderBy("timestamp", "desc").limit(100).get(),
      adminDb.collection("audit_logs").orderBy("at", "desc").limit(40).get(),
      adminDb.collection("activity_logs").orderBy("timestamp", "desc").limit(150).get(),
      adminDb.collection("agent_recommendations").where("status", "==", "pending").limit(20).get(),
    ]);

    const items = buildNotifications({
      trades: tradeSnap.docs.map((d) => {
        const x = d.data();
        return {
          id: d.id,
          pair: String(x.pair ?? ""),
          type: String(x.type ?? ""),
          mode: String(x.mode ?? ""),
          price: Number(x.price) || 0,
          totalIdr: Number(x.totalIdr) || 0,
          ts: toMs(x.timestamp),
        };
      }),
      audits: auditSnap.docs.map((d) => {
        const x = d.data();
        return {
          id: d.id,
          action: String(x.action ?? ""),
          actor: String(x.actor ?? ""),
          at: Number(x.at) || 0,
          changes: Array.isArray(x.changes) ? x.changes : [],
          meta: x.meta && typeof x.meta === "object" ? x.meta : undefined,
        };
      }),
      emergencyLogs: logSnap.docs
        .map((d) => ({ id: d.id, message: String(d.data().message ?? ""), ts: toMs(d.data().timestamp), type: String(d.data().type ?? "") }))
        .filter((l) => l.type === "danger" && /emergency|reconciliation/i.test(l.message)),
      pendingRecs: recSnap.docs.map((d) => {
        const x = d.data();
        return { id: d.id, title: String(x.title ?? ""), role: String(x.role ?? ""), createdAtMs: Number(x.createdAtMs) || 0 };
      }),
    });

    res.setHeader("Cache-Control", "private, max-age=15");
    return res.status(200).json({ items });
  } catch (error) {
    console.error("[NOTIFICATIONS API ERROR]", error);
    return res.status(500).json({ error: "Gagal memuat notifikasi." });
  }
}
