/**
==========================================================
AURA Trade OS
Portfolio Summary API (Server-side)
Version : 0.1.1 Alpha

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

CATATAN v0.1.1: sebelumnya pakai `new Map<string, {...}>()` yang
dipecah jadi beberapa baris -- karakter `<` yang berdiri sendiri
di akhir baris hilang saat paste ke editor browser GitHub (bug
yang sama seperti operator perbandingan yang suka hilang). Diganti
ke object biasa dengan index signature supaya tidak butuh syntax
generic sama sekali.
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
import { getBotState, getOpenPositionPairs } from "@/services/firebase/botState";
import { getActiveIndodaxAccount } from "@/services/firebase/indodaxAccountsAdmin";
import { IndodaxClient } from "@/services/liveTrading/exchange/indodaxClient";

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

interface PendingBuy {
  price: number;
  timestamp: number;
}

interface PendingBuyLookup {
  [pair: string]: PendingBuy;
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

interface PortfolioSummaryResponse {
  mode: "paper" | "live";
  balance: number;
  available: number;
  invested: number;
  openPositionsCount: number;
  realizedPnl: number;
  unrealizedPnl: number;
  winRate: number;
  totalClosedTrades: number;
  recentTrades: TradeRow[];
  fetchedAt: string;
  liveBalanceError?: string;
}

/**
 * Ringkasan mode PAPER -- LOGIKA ASLI, tidak diubah sama sekali
 * dari versi sebelumnya. Sumber: paper_portfolio, paper_positions,
 * paper_trade_logs (semua ditulis oleh services/trading/paper.ts).
 */
async function buildPaperSummary(): Promise<PortfolioSummaryResponse> {

  const [portfolio, openPositions, tradeLogsSnapshot] = await Promise.all([

    getPaperPortfolio(BOT_CONFIG.startingBalance),

    getOpenPaperPositions(),

    adminDb
      .collection("paper_trade_logs")
      .orderBy("timestamp", "desc")
      .limit(100)
      .get(),

  ]);

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

  const logsAscending = tradeLogsSnapshot.docs
    .map((doc) => doc.data())
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

  const pendingBuyByPair: PendingBuyLookup = {};

  const closedTrades: ClosedTradeRow[] = [];

  let winCount = 0;
  let closedCount = 0;

  for (const log of logsAscending) {

    if (log.side === "BUY") {

      pendingBuyByPair[log.pair] = {
        price: log.price,
        timestamp: log.timestamp ?? 0,
      };

      continue;

    }

    if (log.side === "SELL") {

      const pendingBuy = pendingBuyByPair[log.pair];

      delete pendingBuyByPair[log.pair];

      const buyPrice = pendingBuy ? pendingBuy.price : 0;

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

  closedTrades.reverse();

  const openTradeRows: OpenTradeRow[] = openPositions.map((position) => {

    const pendingBuy =
      pendingBuyByPair[position.pair];

    return {
      pair: position.pair,
      status: "OPEN",
      buyPrice: pendingBuy ? pendingBuy.price : position.entryPrice,
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

  return {

    mode: "paper",

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

  };

}

/**
 * Ringkasan mode LIVE -- BARU. Sebelumnya endpoint ini SELALU
 * membaca koleksi paper_*, walau bot sedang live -- artinya
 * halaman Portfolio menampilkan data basi begitu live aktif,
 * karena trading/live.ts menulis ke koleksi "trades" & "bot_state",
 * BUKAN paper_trade_logs/paper_positions.
 *
 * Sumber data live:
 * - Posisi terbuka & harga terkini: bot_state (field inPosition,
 *   entryPrice, coinAmount, currentPrice -- sudah di-update
 *   TradingEngine tiap siklus).
 * - Riwayat trade: koleksi "trades" (ditulis recordTrade() di
 *   services/firebase/logService.ts, field `type` BUY/SELL --
 *   BUKAN `side` seperti di paper_trade_logs).
 * - Saldo asli: IndodaxClient.getInfo() dengan kredensial akun
 *   aktif (sama seperti yang dipakai trading/live.ts sendiri).
 *
 * PnL untuk live TIDAK disimpan pre-computed di koleksi trades
 * (beda dengan paper_trade_logs yang punya field pnlIdr siap
 * pakai) -- jadi dihitung di sini dari pasangan BUY/SELL harga.
 */
async function buildLiveSummary(): Promise<PortfolioSummaryResponse> {

  const openPairs = await getOpenPositionPairs();

  let unrealizedPnl = 0;
  let investedIdr = 0;

  const openTradeRows: OpenTradeRow[] = [];

  for (const pair of openPairs) {

    const state = await getBotState(pair);

    const entryValue = state.entryPrice * state.coinAmount;

    investedIdr += entryValue;

    const currentPrice =
      state.currentPrice > 0 ? state.currentPrice : state.entryPrice;

    unrealizedPnl += (currentPrice - state.entryPrice) * state.coinAmount;

    openTradeRows.push({
      pair,
      status: "OPEN",
      buyPrice: state.entryPrice,
      sellPrice: null,
      pnlIdr: 0,
      pnlPercent: 0,
      closedAt: null,
    });

  }

  // --- Pairing BUY -> SELL dari koleksi "trades" (live) ---
  const tradeLogsSnapshot = await adminDb
    .collection("trades")
    .orderBy("timestamp", "desc")
    .limit(100)
    .get();

  const logsAscending = tradeLogsSnapshot.docs
    .map((doc) => doc.data())
    .sort((a, b) => (a.timestamp?.toMillis?.() ?? 0) - (b.timestamp?.toMillis?.() ?? 0));

  const pendingBuyByPair: PendingBuyLookup = {};

  const closedTrades: ClosedTradeRow[] = [];

  let winCount = 0;
  let closedCount = 0;

  for (const log of logsAscending) {

    const timestampMs: number = log.timestamp?.toMillis?.() ?? 0;

    if (log.type === "BUY") {

      pendingBuyByPair[log.pair] = {
        price: log.price,
        timestamp: timestampMs,
      };

      continue;

    }

    if (log.type === "SELL") {

      const pendingBuy = pendingBuyByPair[log.pair];

      delete pendingBuyByPair[log.pair];

      const buyPrice = pendingBuy ? pendingBuy.price : 0;

      // Live tidak punya pnlIdr pre-computed seperti paper -- hitung
      // manual dari selisih harga * jumlah koin yang dijual.
      const pnlIdr =
        buyPrice > 0 ? (log.price - buyPrice) * log.amount : 0;

      const pnlPercent =
        buyPrice > 0 ? ((log.price - buyPrice) / buyPrice) * 100 : 0;

      closedTrades.push({
        pair: log.pair,
        status: "CLOSED",
        buyPrice,
        sellPrice: log.price,
        pnlIdr,
        pnlPercent: Number(pnlPercent.toFixed(2)),
        closedAt: timestampMs ? new Date(timestampMs).toISOString() : null,
      });

      closedCount += 1;

      if (pnlIdr > 0) {
        winCount += 1;
      }

    }

  }

  closedTrades.reverse();

  const recentTrades: TradeRow[] = [
    ...openTradeRows,
    ...closedTrades,
  ].slice(0, 20);

  const realizedPnl = closedTrades.reduce((sum, t) => sum + t.pnlIdr, 0);

  const winRate =
    closedCount > 0
      ? Number(((winCount / closedCount) * 100).toFixed(1))
      : 0;

  // --- Saldo asli dari Indodax (bukan simulasi) ---
  let available = 0;
  let liveBalanceError: string | undefined;

  try {

    const account = await getActiveIndodaxAccount();

    if (!account) {
      throw new Error("Tidak ada akun Indodax aktif yang dikonfigurasi.");
    }

    const client = new IndodaxClient({
      apiKey: account.apiKey,
      secretKey: account.secretKey,
    });

    const info = await client.getInfo();

    if (!info.success) {
      throw new Error(info.message ?? "Gagal mengambil saldo Indodax.");
    }

    available = parseFloat(info.data.balance.idr ?? "0");

    if (!Number.isFinite(available)) {
      available = 0;
    }

  } catch (error) {

    // Fail-safe: kalau saldo asli gagal diambil (mis. kredensial
    // salah, Indodax down), JANGAN tampilkan angka seolah-olah 0
    // adalah saldo sungguhan -- available tetap 0 tapi liveBalanceError
    // diisi supaya UI bisa memberi tahu penggunanya, bukan diam-diam
    // menampilkan Rp 0 yang menyesatkan.
    console.error("[Portfolio Summary API] Live balance fetch failed", error);
    liveBalanceError =
      error instanceof Error ? error.message : "Gagal mengambil saldo live.";

  }

  return {

    mode: "live",

    balance: available + investedIdr + unrealizedPnl,

    available,

    invested: investedIdr,

    openPositionsCount: openPairs.length,

    realizedPnl,

    unrealizedPnl: Number(unrealizedPnl.toFixed(2)),

    winRate,

    totalClosedTrades: closedCount,

    recentTrades,

    fetchedAt: new Date().toISOString(),

    liveBalanceError,

  };

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

    // Sama persis logika isLiveModeActive() di services/trading/engine.ts
    // -- control.mode="live" saja TIDAK CUKUP, BOT_LIVE_CONFIRM di
    // Vercel juga harus true. Tanpa ini, halaman Portfolio bisa
    // mengklaim "(Live Trading)" padahal sistem sebenarnya masih
    // mengeksekusi paper trade.
    const liveConfirmed = process.env.BOT_LIVE_CONFIRM === "true";

    const effectiveMode: "paper" | "live" =
      control.mode === "live" && liveConfirmed ? "live" : "paper";

    const summary =
      effectiveMode === "live"
        ? await buildLiveSummary()
        : await buildPaperSummary();

    return res.status(200).json(summary);

  } catch (error) {

    console.error("[Portfolio Summary API]", error);

    return res.status(500).json({
      error: "Gagal mengambil ringkasan portfolio.",
    });

  }

}
