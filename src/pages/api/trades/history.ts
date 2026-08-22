/**
==========================================================
AURA Trade OS
Trade History API (Server-side)
Version : 0.1.0

Menutup celah: pages/dashboard/history.tsx sebelumnya SELALU
menampilkan 2 baris dummy hardcode (ORD-9821/ORD-9822) --
TIDAK PERNAH membaca data asli, baik live maupun paper. Sama
persis masalah yang dulu ada di portfolio/page.tsx sebelum
diperbaiki (lihat catatan versi di portfolio/summary.ts) --
cuma halaman History ini belum ikut diperbaiki saat itu.

Sumber data (mengikuti mode bot_control SEKARANG, bukan
parameter dari client -- konsisten dengan portfolio/summary.ts
& analytics/risk.ts):
- LIVE : koleksi "trades" (ditulis recordTrade() di
  services/firebase/logService.ts, field `type`/`amount`/
  `totalIdr`/`orderId`). Cuma order yang BENAR-BENAR sukses
  yang pernah ditulis ke sini -- status selalu FILLED.
- PAPER: koleksi "paper_trade_logs" (ditulis services/trading/
  paper.ts, field `side`/`quantity`, tanpa totalIdr/orderId
  eksplisit -- dihitung/diberi ID sintetis di sini).

Dilindungi Firebase ID Token, pola sama dengan
/api/portfolio/summary & /api/analytics/risk.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, adminDb } from "@/services/firebase/admin";
import { getBotControl } from "@/services/firebase/botControl";

const HISTORY_LIMIT = 100;

async function getUidFromRequest(req: NextApiRequest): Promise<string | null> {

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.replace("Bearer ", "");

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;
  } catch (error) {
    console.error("[Trade History API] Token invalid:", error);
    return null;
  }

}

export interface OrderHistoryRow {
  id: string;
  type: "BUY" | "SELL";
  pair: string;
  price: number;
  amount: number;
  totalIdr: number;
  profitIdr: number | null;
  timestampMs: number;
  status: "FILLED";
}

async function fetchLiveHistory(): Promise<OrderHistoryRow[]> {

  const snapshot = await adminDb
    .collection("trades")
    .orderBy("timestamp", "desc")
    .limit(HISTORY_LIMIT)
    .get();

  return snapshot.docs.map((doc) => {

    const data = doc.data();

    const price = Number(data.price ?? 0);
    const amount = Number(data.amount ?? 0);
    const totalIdr = Number(data.totalIdr ?? price * amount);

    return {
      id: data.orderId ? String(data.orderId) : doc.id,
      type: data.type === "SELL" ? "SELL" : "BUY",
      pair: String(data.pair ?? "-").toUpperCase(),
      price,
      amount,
      totalIdr,
      // Live tidak menyimpan profit per-baris (beda dengan
      // paper_trade_logs) -- dashboard Portfolio yang sudah
      // menghitung realizedPnl lewat pairing BUY->SELL terpisah,
      // di sini cukup tampilkan riwayat order apa adanya.
      profitIdr: null,
      timestampMs: data.timestamp?.toMillis?.() ?? 0,
      status: "FILLED" as const,
    };

  });

}

async function fetchPaperHistory(): Promise<OrderHistoryRow[]> {

  const snapshot = await adminDb
    .collection("paper_trade_logs")
    .orderBy("timestamp", "desc")
    .limit(HISTORY_LIMIT)
    .get();

  return snapshot.docs.map((doc) => {

    const data = doc.data();

    const price = Number(data.price ?? 0);
    const amount = Number(data.quantity ?? 0);
    const totalIdr = price * amount;

    const pnlIdr =
      typeof data.pnlIdr === "number" ? data.pnlIdr : null;

    return {
      id: doc.id,
      type: data.side === "SELL" ? "SELL" : "BUY",
      pair: String(data.pair ?? "-").toUpperCase(),
      price,
      amount,
      totalIdr,
      profitIdr: pnlIdr,
      timestampMs: Number(data.timestamp ?? 0),
      status: "FILLED" as const,
    };

  });

}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uid = await getUidFromRequest(req);

  if (!uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {

    const control = await getBotControl();

    // Sama persis logika isLiveModeActive() di engine.ts/summary.ts
    // -- mode="live" saja tidak cukup, BOT_LIVE_CONFIRM juga harus
    // true, supaya badge "Mode" di halaman ini tidak pernah
    // mengklaim LIVE padahal fail-safe engine.ts masih menjalankan
    // paper trade di baliknya.
    const liveActive =
      control.mode === "live" && process.env.BOT_LIVE_CONFIRM === "true";

    const orders = liveActive
      ? await fetchLiveHistory()
      : await fetchPaperHistory();

    return res.status(200).json({
      mode: liveActive ? "live" : "paper",
      orders,
      fetchedAt: new Date().toISOString(),
    });

  } catch (error) {

    console.error("[Trade History API] Gagal ambil riwayat:", error);

    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Gagal mengambil riwayat transaksi.",
    });

  }

}
