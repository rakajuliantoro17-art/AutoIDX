/** GET /api/positions/wallet -- isi dompet Indodax vs catatan bot (khusus pemilik, BACA-SAJA, tanpa order). */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { isOwner } from "@/services/agents/decisions";
import { getActiveIndodaxAccount } from "@/services/firebase/indodaxAccountsAdmin";
import { getBotState, getOpenPositionPairs } from "@/services/firebase/botState";
import { IndodaxClient } from "@/services/liveTrading/exchange/indodaxClient";
import { getUnmanagedHoldings } from "@/services/positions/unmanaged";
import { classifyHoldings } from "@/services/positions/walletReport";

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
    const account = await getActiveIndodaxAccount();
    if (!account) return res.status(409).json({ error: "Tidak ada akun Indodax aktif." });
    const client = new IndodaxClient({ apiKey: account.apiKey, secretKey: account.secretKey });
    const info = await client.getInfo();
    if (!info.success) return res.status(502).json({ error: `Gagal ambil saldo Indodax: ${info.message}` });

    const balance = (info.data.balance ?? {}) as Record<string, unknown>;
    const hold = (info.data.balance_hold ?? {}) as Record<string, unknown>;
    const totals: Record<string, number> = {};
    for (const k of new Set([...Object.keys(balance), ...Object.keys(hold)])) {
      totals[k] = num(balance[k]) + num(hold[k]);
    }

    const open: Record<string, number> = {};
    for (const pair of await getOpenPositionPairs()) {
      const st = await getBotState(pair);
      const asset = pair.split("_")[0];
      open[asset] = (open[asset] ?? 0) + st.coinAmount;
    }
    const unmanaged = await getUnmanagedHoldings();
    const rows = classifyHoldings({ balances: totals, open, unmanaged });

    const hours = Math.min(Math.max(num(req.query.hours) || 72, 1), 240);
    const since = Math.floor(Date.now() / 1000) - hours * 3600;
    const withHistory = [];
    let historyError: string | null = null;
    for (const row of rows.slice(0, 8)) {
      let history: { time: string; type: string; price: number; amount: number }[] | null = null;
      let orderHistoryRaw: unknown = null;
      if (row.status === "TAK_TERLACAK") {
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

    return res.status(200).json({
      idr: { available: num(balance.idr), hold: num(hold.idr) },
      holdings: withHistory,
      transfers,
      historyError,
      hours,
    });
  } catch (error) {
    console.error("[WALLET REPORT ERROR]", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Gagal membaca dompet." });
  }
}
