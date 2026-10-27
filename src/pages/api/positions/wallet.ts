/** GET /api/positions/wallet -- isi dompet Indodax vs catatan bot (khusus pemilik, BACA-SAJA, tanpa order). */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { isOwner } from "@/services/agents/decisions";
import { loadWallet } from "@/services/positions/walletLoad";
import { TRADING_CONFIG } from "@/config/trading";

export const config = { maxDuration: 30 };

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const user = await verifyApiAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized." });
  if (!isOwner(user.uid)) return res.status(403).json({ error: "Hanya pemilik." });

  try {
    const { client, idr, rows } = await loadWallet();

    const hours = Math.min(Math.max(num(req.query.hours) || 72, 1), 240);
    const since = Math.floor(Date.now() / 1000) - hours * 3600;
    const withHistory = [];
    let historyError: string | null = null;
    for (const row of rows.slice(0, 14)) {
      let history: { time: string; type: string; price: number; amount: number }[] | null = null;
      let orderHistoryRaw: unknown = null;
      if (row.status !== "DIKELOLA" && row.total > 1e-8) {
        const r = await client.tradeHistory({ pair: `${row.asset}_idr`, since, count: 20 });
        if (!r.success) {
          historyError = r.message;
          // tradeHistory membalas "DEPRECATED" -- coba orderHistory (bentuk
          // respons belum diverifikasi, jadi ditampilkan apa adanya, dipangkas).
          try {
            const o = await client.orderHistory({ pair: `${row.asset}_idr`, count: 10 });
            orderHistoryRaw = o.success ? o.data : { error: o.message };
          } catch (e) {
            orderHistoryRaw = { error: e instanceof Error ? e.message : String(e) };
          }
        }
        if (r.success) {
          history = (r.data as Record<string, unknown>[]).map((t) => ({
            time: new Date(num(t.trade_time) * 1000).toISOString(),
            type: String(t.type ?? ""),
            price: num(t.price),
            amount: num(t[row.asset]),
          }));
        }
      }
      withHistory.push({ ...row, history, orderHistoryRaw });
    }

    // Deposit/penarikan IDR (BACA-SAJA). Struktur respons Indodax tidak
    // dijamin; kirim apa adanya (dipangkas) supaya bisa dibaca pemilik.
    let transfers: unknown = null;
    try {
      const t = await client.transHistory();
      if (t.success) {
        const d = t.data as { withdraw?: Record<string, unknown[]>; deposit?: Record<string, unknown[]> } | null;
        transfers = {
          withdrawIdr: (d?.withdraw?.idr ?? []).slice(0, 5),
          depositIdr: (d?.deposit?.idr ?? []).slice(0, 5),
        };
      }
    } catch {
      transfers = null;
    }

    // Trade terbaru lintas pair (mis. untuk melacak selisih saldo IDR): pair yang
    // pernah diperdagangkan bot + watchlist statis + ?pairs=a,b. Paralel, BACA-SAJA.
    const extra = String(req.query.pairs ?? "").split(",").map((p) => p.trim().toLowerCase()).filter(Boolean);
    const pairSet = new Set<string>([
      ...["zerebro", "bnb", "br", "ada", "birb", "doge", "avax"].map((a) => `${a}_idr`),
      ...TRADING_CONFIG.pairs,
      ...extra.map((p) => (p.includes("_") ? p : `${p}_idr`)),
    ]);
    const recentSince = Math.floor(Date.now() / 1000) - Math.min(hours, 168) * 3600;
    const recentErrors: string[] = [];
    const recentTrades = (
      await Promise.all(
        [...pairSet].slice(0, 30).map(async (pair) => {
          const r = await client.tradeHistory({ pair, since: recentSince, count: 20 });
          if (!r.success) {
            recentErrors.push(`${pair}: ${r.message}`);
            return [];
          }
          return (r.data as Record<string, unknown>[]).map((t) => ({
            pair,
            time: new Date(num(t.trade_time) * 1000).toISOString(),
            type: String(t.type ?? ""),
            price: num(t.price),
            idr: num(t.idr),
            fee: num(t.fee),
            orderId: String(t.order_id ?? ""),
          }));
        })
      )
    )
      .flat()
      .sort((a, b) => (a.time < b.time ? 1 : -1));

    return res.status(200).json({ idr, holdings: withHistory, transfers, historyError, hours, recentTrades, recentErrors: recentErrors.slice(0, 5) });
  } catch (error) {
    console.error("[WALLET REPORT ERROR]", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Gagal membaca dompet." });
  }
}
