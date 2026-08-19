/**
==========================================================
AURA Trade OS
Portfolio Summary API (Server-side)
Version : 0.1.0 Alpha

Mengagregasi data portfolio ASLI dari Firestore -- sebelumnya
src/app/portfolio/page.tsx pakai object dummy hardcode (balance
500000, invested 25000, dst, tidak pernah berubah). Sumber data
di sini (paper_portfolio, paper_positions, paper_trade_logs,
bot_state) SEMUANYA sudah ditulis dengan benar oleh
services/trading/paper.ts setiap kali trade terjadi -- cuma
belum pernah dibaca dari mana pun sampai file ini dibuat.

Dilindungi Firebase ID Token, sama seperti /api/logs/recent
dan /api/settings/indodax-accounts -- konsisten dengan pola
keamanan Admin-SDK-only yang sudah dipakai project.

CATATAN LIVE MODE: metrik di sini fokus ke PAPER trading dulu
(saldo/posisi/PnL dari paper_portfolio & paper_trade_logs),
karena itu mode yang aktif sekarang. Untuk LIVE, saldo asli ada
di akun Indodax (lewat IndodaxClient.getEquityIdr()) -- BELUM
diintegrasikan ke endpoint ini, openPositionsCount & recentTrades
tetap akurat untuk live (dari bot_state & koleksi trades), tapi
balance/available untuk live sengaja TIDAK ditampilkan seolah-
olah akurat kalau belum benar-benar diambil dari saldo asli.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, adminDb } from "@/services/firebase/admin";
import { BOT_CONFIG } from "@/config/bot";
import {
  getPaperPortfolio,
  getOpenPaperPositions,
} from "@/services/firebase/paperTradingStore";
import { getBotControl } from "@/services/firebase/botControl";
import { getBotState } from "@/services/firebase/botState";

async function getUidFromRequest(
  req: NextApiRequest
): Promise<string | null> {

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.replace("Bearer ", "");

  try {

    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;

  } catch (error) {

    console.error("[Portfolio Summary API] Token invalid:", error);
    return null;

  }

}

interface ClosedTradeRow {
  pair: string;
  status: "CLOSED";
  buyPrice: number;
  sellPrice: number;
  pnlIdr: number;
  pnlPercent: number;
  closedAt: string | null;
}

interface OpenTradeRow {
  pair: string;
  status: "OPEN";
  buyPrice: number;
  sellPrice: null;
  pnlIdr: number;
  pnlPercent: number;
  closedAt: null;
}

type TradeRow = ClosedTradeRow | OpenTradeRow;

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

    const [portfolio, openPositions, tradeLogsSnapshot] = await Promise.all([

      getPaperPortfolio(BOT_CONFIG.startingBalance),

      getOpenPaperPositions(),

      adminDb
        .collection("paper_trade_logs")
        .orderBy("timestamp", "desc")
        .limit(100)
        .get(),

    ]);

    // --- Unrealized PnL posisi terbuka ---
    // paper_positions tidak menyimpan harga terkini -- diambil dari
    // bot_state (yang di-update TradingEngine SETIAP siklus, walau
    // hasilnya HOLD) untuk pair yang sama.
    let unrealizedPnl = 0;
    let investedIdr = 0;

    for (const position of openPositions) {

      investedIdr += position.entryValue;

      const state = await getBotState(position.pair);

      const currentPrice =
        state.currentPrice > 0
          ? state.currentPrice
          : position.entryPrice;

      unrealizedPnl +=
        (currentPrice - position.entryPrice) * position.coinAmount;

    }

    // --- Pairing BUY -> SELL per pair dari paper_trade_logs ---
    // (dokumen BUY & SELL tersimpan terpisah -- dipasangkan di sini
    // supaya "Recent Trades" bisa tampil satu baris per posisi,
    // bukan satu baris per event BUY/SELL mentah.)
    const logsAscending = tradeLogsSnapshot.docs
      .map((doc) => doc.data())
      .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

    const pendingBuyByPair = new Map
      string,
      { price: number; timestamp: number }
    >();

    const closedTrades: ClosedTradeRow[] = [];

    let winCount = 0;
    let closedCount = 0;

    for (const log of logsAscending) {

      if (log.side === "BUY") {

        pendingBuyByPair.set(log.pair, {
          price: log.price,
          timestamp: log.timestamp ?? 0,
        });

        continue;

      }

      if (log.side === "SELL") {

        const pendingBuy = pendingBuyByPair.get(log.pair);

        pendingBuyByPair.delete(log.pair);

        const buyPrice = pendingBuy?.price ?? 0;

        const pnlIdr =
          typeof log.pnlIdr === "number" ? log.pnlIdr : 0;

        const pnlPercent =
          typeof log.pnlPercent === "number" ? log.pnlPercent : 0;

        closedTrades.push({
          pair: log.pair,
          status: "CLOSED",
          buyPrice,
          sellPrice: log.price,
          pnlIdr,
          pnlPercent,
          closedAt:
            log.timestamp
              ? new Date(log.timestamp).toISOString()
              : null,
        });

        closedCount += 1;

        if (pnlIdr > 0) {
          winCount += 1;
        }

      }

    }

    // Baris terbaru dulu untuk ditampilkan.
    closedTrades.reverse();

    const openTradeRows: OpenTradeRow[] = openPositions.map((position) => {

      const pendingBuy =
        pendingBuyByPair.get(position.pair);

      return {
        pair: position.pair,
        status: "OPEN",
        buyPrice: pendingBuy?.price ?? position.entryPrice,
        sellPrice: null,
        pnlIdr: 0,
        pnlPercent: 0,
        closedAt: null,
      };

    });

    const recentTrades: TradeRow[] = [
      ...openTradeRows,
      ...closedTrades,
    ].slice(0, 20);

    const realizedPnl = closedTrades.reduce(
      (sum, t) => sum + t.pnlIdr,
      0
    );

    const winRate =
      closedCount > 0
        ? Number(((winCount / closedCount) * 100).toFixed(1))
        : 0;

    return res.status(200).json({

      mode: control.mode,

      balance:
        portfolio.availableBalance + investedIdr + unrealizedPnl,

      available: portfolio.availableBalance,

      invested: investedIdr,

      openPositionsCount: openPositions.length,

      realizedPnl,

      unrealizedPnl: Number(unrealizedPnl.toFixed(2)),

      winRate,

      totalClosedTrades: closedCount,

      recentTrades,

      fetchedAt: new Date().toISOString(),

    });

  } catch (error) {

    console.error("[Portfolio Summary API]", error);

    return res.status(500).json({
      error: "Gagal mengambil ringkasan portfolio.",
    });

  }

}
