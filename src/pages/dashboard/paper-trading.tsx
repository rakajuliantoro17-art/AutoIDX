/**
==========================================================
AURA Trade OS
Paper Trading Dashboard
Version : 0.0.3 Alpha
==========================================================
*/
"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import StatusCard from "@/components/StatusCard";

interface PaperPosition {
  pair: string;
  entryPrice: number;
  coinAmount: number;
  entryValue: number;
  stopLossPrice: number;
  takeProfitPrice: number;
}

interface PaperTrade {
  id: string;
  pair: string;
  type: "BUY" | "SELL";
  price: number;
  idrValue: number;
  pnlIdr?: number;
  pnlPercent?: number;
  reason?: string;
  executedAt: number;
}

interface PaperTradingStatus {
  portfolio: {
    startingBalance: number;
    availableBalance: number;
    equityIdr: number;
  } | null;
  openPositions: PaperPosition[];
  trades: PaperTrade[];
  realizedPnl: number;
}

export default function PaperTradingPage() {
  const [status, setStatus] = useState<PaperTradingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStatus() {
    try {
      const res = await fetch("/api/paper-trading/status");
      if (!res.ok) throw new Error(`Status API failed: ${res.status}`);
      const json = await res.json();
      setStatus(json);
      setError(null);
    } catch (err) {
      console.error("[PaperTradingPage] Failed to load status:", err);
      setError("Gagal memuat status paper trading");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30_000); // auto-refresh tiap 30 detik
    return () => clearInterval(interval);
  }, []);

  const portfolio = status?.portfolio;
  const pnlPercent = portfolio
    ? ((portfolio.equityIdr - portfolio.startingBalance) / portfolio.startingBalance) * 100
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Paper Trading</h1>
          <p className="text-xs text-slate-400 mt-1">Simulasi trading dengan saldo virtual</p>
        </div>

        {error && (
          <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatusCard
            title="Saldo Virtual"
            value={loading || !portfolio ? "..." : `Rp ${portfolio.availableBalance.toLocaleString("id-ID")}`}
            subtext="Available balance"
            loading={loading}
          />
          <StatusCard
            title="Total Equity"
            value={loading || !portfolio ? "..." : `Rp ${portfolio.equityIdr.toLocaleString("id-ID")}`}
            subtext="Saldo + posisi terbuka"
            loading={loading}
          />
          <StatusCard
            title="P&L Keseluruhan"
            value={loading || !portfolio ? "..." : `${pnlPercent >= 0 ? "+" : ""}${pnlPercent.toFixed(2)}%`}
            subtext={`vs modal awal Rp ${portfolio?.startingBalance.toLocaleString("id-ID") ?? "-"}`}
            loading={loading}
          />
          <StatusCard
            title="Posisi Terbuka"
            value={loading ? "..." : String(status?.openPositions.length ?? 0)}
            subtext="Pair aktif"
            loading={loading}
          />
        </div>

        {/* Open Positions */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-5">Posisi Aktif</h2>
          {loading ? (
            <p className="text-slate-400 text-sm">Memuat...</p>
          ) : !status?.openPositions.length ? (
            <p className="text-slate-500 text-sm">Tidak ada posisi terbuka saat ini.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-white/10">
                    <th className="pb-2">Pair</th>
                    <th className="pb-2">Entry Price</th>
                    <th className="pb-2">Nilai</th>
                    <th className="pb-2 text-red-400">Stop Loss</th>
                    <th className="pb-2 text-emerald-400">Take Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {status.openPositions.map((pos) => (
                    <tr key={pos.pair} className="border-b border-white/5">
                      <td className="py-2 font-medium">{pos.pair.toUpperCase()}</td>
                      <td className="py-2">Rp {pos.entryPrice.toLocaleString("id-ID")}</td>
                      <td className="py-2">Rp {pos.entryValue.toLocaleString("id-ID")}</td>
                      <td className="py-2 text-red-400">Rp {pos.stopLossPrice.toLocaleString("id-ID")}</td>
                      <td className="py-2 text-emerald-400">Rp {pos.takeProfitPrice.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Trade History */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-5">Histori Transaksi Terbaru</h2>
          {loading ? (
            <p className="text-slate-400 text-sm">Memuat...</p>
          ) : !status?.trades.length ? (
            <p className="text-slate-500 text-sm">Belum ada transaksi.</p>
          ) : (
            <div className="space-y-2">
              {status.trades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between bg-white/5 rounded-md px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      <span className={trade.type === "BUY" ? "text-sky-400" : "text-orange-400"}>
                        {trade.type}
                      </span>{" "}
                      {trade.pair.toUpperCase()}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(trade.executedAt).toLocaleString("id-ID")} · Rp{" "}
                      {trade.price.toLocaleString("id-ID")}
                      {trade.reason && ` · ${trade.reason}`}
                    </p>
                  </div>
                  {trade.pnlIdr !== undefined && (
                    <div className={`text-right font-medium ${trade.pnlIdr >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      <p>
                        {trade.pnlIdr >= 0 ? "+" : ""}Rp {trade.pnlIdr.toFixed(0)}
                      </p>
                      <p className="text-xs">
                        {trade.pnlPercent! >= 0 ? "+" : ""}
                        {trade.pnlPercent?.toFixed(2)}%
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
