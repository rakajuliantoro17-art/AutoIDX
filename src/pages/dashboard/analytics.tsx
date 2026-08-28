/**
==========================================================
AURA Trade OS
Risk Analytics Dashboard
Version : 0.2.0 Alpha

GANTI TOTAL dari versi sebelumnya - yang lama isinya statis
hardcode ("EMA Fast di atas EMA Slow", confidence=82, dst,
tidak pernah berubah apapun kondisi pasarnya). Sekarang
konsumsi /api/analytics/risk (data REAL dari riwayat trade
tertutup, lihat file itu untuk detail rekonstruksi FIFO
BUY->SELL). Mengaktifkan services/analytics/riskAnalytics.ts
yang sebelumnya orphan total.

Metrik di sini SENGAJA beda dari halaman /portfolio (yang
sudah menampilkan balance/winRate/recentTrades) - fokus ke
risk score, max drawdown, best/worst trade yang belum
ditampilkan di manapun.
==========================================================
*/
"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/services/auth/AuthContext";

interface RiskAnalyticsResponse {
  mode: "paper" | "live";
  totalClosedTrades: number;
  message?: string;
  riskScore?: number;
  averageExposure?: number;
  averageLoss?: number;
  maxDrawdownIdr?: number;
  bestTradeIdr?: number;
  worstTradeIdr?: number;
  averageProfitIdr?: number;
  winningTrades?: number;
  losingTrades?: number;
  winRate?: number;
  totalVolumeIdr?: number;
  totalFeesIdr?: number;
  strategyBreakdown?: {
    strategy: string;
    trades: number;
    totalPnlIdr: number;
    averagePnlIdr: number;
    winRate: number;
  }[];
  strategyBreakdownNote?: string;
}

function riskScoreStyle(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
}

function idr(n: number | undefined): string {
  if (n === undefined) return "-";
  return `Rp${n.toLocaleString("id-ID")}`;
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();

  const [data, setData] = useState<RiskAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/analytics/risk", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? `HTTP ${res.status}`);
      } else {
        setData(json);
      }
    } catch (err: any) {
      setError(err?.message ?? "Gagal memuat analytics");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (authLoading) {
    return (
      <DashboardLayout>
        <p className="text-slate-400">Memuat...</p>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <p className="text-slate-400">Silakan login dulu.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Risk Analytics</h1>
            <p className="text-xs text-slate-400 mt-1">
              Dihitung dari riwayat trade tertutup ({data?.mode ?? "..."} mode) -
              bukan simulasi/contoh.
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="rounded bg-slate-700 px-3 py-2 text-sm disabled:opacity-50"
          >
            {loading ? "Memuat..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="rounded bg-red-950 border border-red-800 p-3 text-sm text-red-300">
            Gagal: {error}
          </div>
        )}

        {data && data.totalClosedTrades === 0 && (
          <div className="glass p-6 text-sm text-slate-400">
            {data.message ?? "Belum ada trade tertutup untuk dianalisis."}
          </div>
        )}

        {data && data.totalClosedTrades > 0 && (
          <>
            <div className="glass p-6">
              <p className="text-xs text-slate-400">Risk Score</p>
              <p className={`text-4xl font-bold ${riskScoreStyle(data.riskScore ?? 0)}`}>
                {data.riskScore}/100
              </p>
              <p className="text-xs text-slate-500 mt-1">
                100 = risiko rendah (exposure &amp; loss kecil relatif terhadap
                riwayat sendiri), 0 = risiko tinggi. Dihitung dari{" "}
                {data.totalClosedTrades} trade tertutup terakhir.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="card">
                <p className="text-xs text-slate-400">Win Rate</p>
                <p className="text-xl font-bold">{data.winRate}%</p>
                <p className="text-xs text-slate-500">
                  {data.winningTrades}W / {data.losingTrades}L
                </p>
              </div>
              <div className="card">
                <p className="text-xs text-slate-400">Max Drawdown</p>
                <p className="text-xl font-bold text-red-400">
                  {idr(data.maxDrawdownIdr)}
                </p>
              </div>
              <div className="card">
                <p className="text-xs text-slate-400">Trade Terbaik</p>
                <p className="text-xl font-bold text-emerald-400">
                  {idr(data.bestTradeIdr)}
                </p>
              </div>
              <div className="card">
                <p className="text-xs text-slate-400">Trade Terburuk</p>
                <p className="text-xl font-bold text-red-400">
                  {idr(data.worstTradeIdr)}
                </p>
              </div>
              <div className="card">
                <p className="text-xs text-slate-400">Rata-rata Profit/Trade</p>
                <p className="text-xl font-bold">{idr(data.averageProfitIdr)}</p>
              </div>
              <div className="card">
                <p className="text-xs text-slate-400">Rata-rata Exposure</p>
                <p className="text-xl font-bold">{data.averageExposure}%</p>
              </div>
              <div className="card">
                <p className="text-xs text-slate-400">Rata-rata Loss</p>
                <p className="text-xl font-bold">{data.averageLoss}%</p>
              </div>
              <div className="card">
                <p className="text-xs text-slate-400">Total Trade Dianalisis</p>
                <p className="text-xl font-bold">{data.totalClosedTrades}</p>
              </div>
              <div className="card">
                <p className="text-xs text-slate-400">Total Volume</p>
                <p className="text-xl font-bold">{idr(data.totalVolumeIdr)}</p>
              </div>
              <div className="card">
                <p className="text-xs text-slate-400">Total Fee</p>
                <p className="text-xl font-bold">{idr(data.totalFeesIdr)}</p>
              </div>
            </div>

            {data.strategyBreakdown && data.strategyBreakdown.length > 0 && (
              <div className="glass p-4">
                <p className="text-sm font-bold mb-2">Breakdown per Strategi</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-500 text-left">
                      <th>Strategi</th>
                      <th className="text-center">Trade</th>
                      <th className="text-center">Win Rate</th>
                      <th className="text-right">Total PnL</th>
                      <th className="text-right">Rata-rata PnL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.strategyBreakdown.map((s) => (
                      <tr key={s.strategy}>
                        <td>{s.strategy}</td>
                        <td className="text-center">{s.trades}</td>
                        <td className="text-center">{s.winRate}%</td>
                        <td
                          className={`text-right ${
                            s.totalPnlIdr >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {idr(s.totalPnlIdr)}
                        </td>
                        <td className="text-right">{idr(s.averagePnlIdr)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.strategyBreakdownNote && (
                  <p className="text-xs text-slate-500 mt-2">{data.strategyBreakdownNote}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
