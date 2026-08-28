/**
==========================================================
AURA Trade OS
Risk Analytics API (Server-side)
Version : 0.1.0 Alpha

Mengaktifkan services/analytics/riskAnalytics.ts (sebelumnya
orphan total, 0 importer) sebagai KALKULATOR MURNI - instance
baru dibuat tiap request (bukan singleton module-level) supaya
tidak ada state bocor antar request di serverless warm instance.

TIDAK mengubah src/pages/api/portfolio/summary.ts (541 baris,
sudah matang & battle-tested) - endpoint ini BARU, fokus ke
metrik yang BELUM ditampilkan di manapun: risk score, max
drawdown, best/worst trade, total fee, total volume, breakdown
per strategi. Pola pembacaan riwayat trade (FIFO BUY->SELL
matching) SENGAJA diduplikasi kecil-kecilan dari summary.ts
daripada mengimpor/mengubah file itu - menghindari risiko
regresi di endpoint yang sudah dipakai halaman Portfolio.

Update: sekarang juga mengaktifkan services/analytics/
tradingAnalytics.ts (totalFees/totalVolume, dihitung ulang
langsung dari closedTrades daripada dipanggil sebagai kelas
in-memory terpisah) dan services/analytics/strategyAnalytics.ts
(breakdown per strategi - butuh TradeLog.strategy yang baru
ditambahkan, lihat trading/live.ts & paper.ts & botState.ts
BotState.strategyAtEntry).

Beda dari summary.ts: endpoint ini ambil riwayat LEBIH PANJANG
(sampai 300 trade closed terakhir, bukan cuma 20) supaya
drawdown/risk score dihitung dari sampel yang cukup, bukan
window terlalu pendek yang membuat metriknya tidak stabil.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, adminDb } from "@/services/firebase/admin";
import { getBotControl } from "@/services/firebase/botControl";
import { RiskAnalytics } from "@/services/analytics/riskAnalytics";

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
    console.error("[Risk Analytics API] Token invalid:", error);
    return null;
  }
}

interface ClosedTrade {
  pair: string;
  buyPrice: number;
  sellPrice: number;
  amount: number;
  totalIdr: number; // nilai posisi (exposure) saat entry
  pnlIdr: number;
  closedAt: number;
  fee: number; // total fee BUY+SELL (0 untuk paper trading - belum disimulasikan)
  strategy?: string; // "" / undefined untuk trade lama sebelum field ini ada
}

const MAX_CLOSED_TRADES = 300;

/**
 * Rekonstruksi trade tertutup mode PAPER dari paper_trade_logs
 * (pnlIdr sudah pre-computed di sana oleh trading/paper.ts).
 */
async function reconstructPaperClosedTrades(): Promise<ClosedTrade[]> {
  const snapshot = await adminDb
    .collection("paper_trade_logs")
    .orderBy("timestamp", "desc")
    .limit(MAX_CLOSED_TRADES * 2) // *2: separuhnya BUY, separuhnya SELL
    .get();

  const logsAscending = snapshot.docs
    .map((doc) => doc.data())
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

  const pendingBuy: Record<
    string,
    { price: number; amount: number; totalIdr: number; strategy?: string }
  > = {};
  const closed: ClosedTrade[] = [];

  for (const log of logsAscending) {
    if (log.side === "BUY") {
      pendingBuy[log.pair] = {
        price: log.price,
        amount: log.amount ?? 0,
        totalIdr: log.totalIdr ?? log.price * (log.amount ?? 0),
        strategy: log.strategy,
      };
      continue;
    }

    if (log.side === "SELL") {
      const buy = pendingBuy[log.pair];
      delete pendingBuy[log.pair];

      if (!buy) continue;

      closed.push({
        pair: log.pair,
        buyPrice: buy.price,
        sellPrice: log.price,
        amount: buy.amount,
        totalIdr: buy.totalIdr,
        pnlIdr: typeof log.pnlIdr === "number" ? log.pnlIdr : 0,
        closedAt: log.timestamp ?? 0,
        // Paper trading belum mensimulasikan fee - selalu 0, JUJUR
        // ditampilkan sebagai 0 (bukan diestimasi/dikarang).
        fee: 0,
        strategy: buy.strategy,
      });
    }
  }

  return closed.slice(-MAX_CLOSED_TRADES);
}

/**
 * Rekonstruksi trade tertutup mode LIVE dari koleksi "trades"
 * (TIDAK ada pnlIdr pre-computed di sini - dihitung dari selisih
 * harga BUY/SELL, sama seperti buildLiveSummary() di summary.ts).
 */
async function reconstructLiveClosedTrades(): Promise<ClosedTrade[]> {
  const snapshot = await adminDb
    .collection("trades")
    .orderBy("timestamp", "desc")
    .limit(MAX_CLOSED_TRADES * 2)
    .get();

  const logsAscending = snapshot.docs
    .map((doc) => doc.data())
    .sort((a, b) => (a.timestamp?.toMillis?.() ?? 0) - (b.timestamp?.toMillis?.() ?? 0));

  const pendingBuy: Record<
    string,
    { price: number; amount: number; totalIdr: number; fee: number; strategy?: string }
  > = {};
  const closed: ClosedTrade[] = [];

  for (const log of logsAscending) {
    if (log.type === "BUY") {
      pendingBuy[log.pair] = {
        price: log.price,
        amount: log.amount ?? 0,
        totalIdr: log.totalIdr ?? log.price * (log.amount ?? 0),
        fee: Number(log.fee ?? 0),
        strategy: log.strategy,
      };
      continue;
    }

    if (log.type === "SELL") {
      const buy = pendingBuy[log.pair];
      delete pendingBuy[log.pair];

      if (!buy) continue;

      const pnlIdr = (log.price - buy.price) * buy.amount;

      closed.push({
        pair: log.pair,
        buyPrice: buy.price,
        sellPrice: log.price,
        amount: buy.amount,
        totalIdr: buy.totalIdr,
        pnlIdr,
        closedAt: log.timestamp?.toMillis?.() ?? 0,
        fee: buy.fee + Number(log.fee ?? 0),
        strategy: buy.strategy,
      });
    }
  }

  return closed.slice(-MAX_CLOSED_TRADES);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uid = await getUidFromRequest(req);

  if (!uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const control = await getBotControl();
    const liveConfirmed = process.env.BOT_LIVE_CONFIRM === "true";
    const effectiveMode: "paper" | "live" =
      control.mode === "live" && liveConfirmed ? "live" : "paper";

    const closedTrades =
      effectiveMode === "live"
        ? await reconstructLiveClosedTrades()
        : await reconstructPaperClosedTrades();

    if (closedTrades.length === 0) {
      return res.status(200).json({
        mode: effectiveMode,
        totalClosedTrades: 0,
        message: "Belum ada trade tertutup untuk dianalisis.",
      });
    }

    // --- Feed ke RiskAnalytics (sebelumnya orphan) - instance BARU
    // per request, exposure & loss dinyatakan sebagai PERSENTASE
    // dari total nilai posisi rata-rata (basis skala 0-100 sesuai
    // formula riskScore = 100 - exposure*0.5 - loss*0.5 di kelasnya). ---
    const analytics = new RiskAnalytics();

    const averagePositionIdr =
      closedTrades.reduce((sum, t) => sum + t.totalIdr, 0) / closedTrades.length;

    for (const trade of closedTrades) {
      const exposurePercent =
        averagePositionIdr > 0 ? (trade.totalIdr / averagePositionIdr) * 100 : 0;

      const lossPercent =
        trade.pnlIdr < 0 && trade.totalIdr > 0
          ? (Math.abs(trade.pnlIdr) / trade.totalIdr) * 100
          : 0;

      analytics.record(exposurePercent, lossPercent);
    }

    const riskReport = analytics.report();

    // --- Max drawdown dari kurva ekuitas realized PnL kumulatif ---
    let cumulative = 0;
    let peak = 0;
    let maxDrawdownIdr = 0;

    for (const trade of closedTrades) {
      cumulative += trade.pnlIdr;
      peak = Math.max(peak, cumulative);
      maxDrawdownIdr = Math.max(maxDrawdownIdr, peak - cumulative);
    }

    const pnlList = closedTrades.map((t) => t.pnlIdr);
    const winners = pnlList.filter((p) => p > 0);
    const losers = pnlList.filter((p) => p <= 0);

    // --- Volume & Fee (dari services/analytics/tradingAnalytics.ts -
    // sebelumnya orphan, disederhanakan di sini karena kelasnya
    // sendiri butuh .record() satu-satu yang state-nya in-memory,
    // sama saja hasilnya kalau dihitung langsung dari closedTrades
    // yang sudah direkonstruksi). Volume = total nilai transaksi
    // (beli+jual), bukan cuma salah satu sisi. ---
    const totalVolumeIdr = closedTrades.reduce(
      (sum, t) => sum + t.totalIdr + t.sellPrice * t.amount,
      0
    );
    const totalFeesIdr = closedTrades.reduce((sum, t) => sum + t.fee, 0);

    // --- Breakdown per strategi (services/analytics/strategyAnalytics.ts,
    // sebelumnya terblokir - TradeLog.strategy baru ditambahkan sesi
    // ini). Trade lama sebelum field ini ada dikelompokkan ke
    // "(tidak diketahui)" - JUJUR ditampilkan, bukan ditebak. ---
    const byStrategy: Record<
      string,
      { trades: number; totalPnl: number; winningTrades: number }
    > = {};

    for (const t of closedTrades) {
      const key = t.strategy && t.strategy.length > 0 ? t.strategy : "(tidak diketahui)";

      if (!byStrategy[key]) {
        byStrategy[key] = { trades: 0, totalPnl: 0, winningTrades: 0 };
      }

      byStrategy[key].trades += 1;
      byStrategy[key].totalPnl += t.pnlIdr;
      if (t.pnlIdr > 0) byStrategy[key].winningTrades += 1;
    }

    const strategyBreakdown = Object.entries(byStrategy).map(([strategy, s]) => ({
      strategy,
      trades: s.trades,
      totalPnlIdr: Number(s.totalPnl.toFixed(0)),
      averagePnlIdr: Number((s.totalPnl / s.trades).toFixed(0)),
      winRate: Number(((s.winningTrades / s.trades) * 100).toFixed(1)),
    }));

    return res.status(200).json({
      mode: effectiveMode,
      totalClosedTrades: closedTrades.length,
      riskScore: riskReport.riskScore,
      averageExposure: Number(riskReport.averageExposure.toFixed(1)),
      averageLoss: Number(riskReport.averageLoss.toFixed(1)),
      maxDrawdownIdr: Number(maxDrawdownIdr.toFixed(0)),
      bestTradeIdr: Number(Math.max(...pnlList).toFixed(0)),
      worstTradeIdr: Number(Math.min(...pnlList).toFixed(0)),
      averageProfitIdr: Number(
        (pnlList.reduce((a, b) => a + b, 0) / pnlList.length).toFixed(0)
      ),
      winningTrades: winners.length,
      losingTrades: losers.length,
      winRate: Number(((winners.length / closedTrades.length) * 100).toFixed(1)),
      totalVolumeIdr: Number(totalVolumeIdr.toFixed(0)),
      totalFeesIdr: Number(totalFeesIdr.toFixed(0)),
      strategyBreakdown,
      strategyBreakdownNote:
        effectiveMode === "paper"
          ? "Fee = 0 untuk paper trading (belum disimulasikan). Trade sebelum fitur atribusi strategi ditambahkan akan muncul sebagai \"(tidak diketahui)\"."
          : "Trade sebelum fitur atribusi strategi ditambahkan akan muncul sebagai \"(tidak diketahui)\".",
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Risk Analytics API]", error);
    return res.status(500).json({ error: "Gagal menghitung risk analytics." });
  }
}
