/**
==========================================================
AURA Trade OS
Canary Monitor (Live Trading - Skala Kecil)
Version : 0.1.0 Alpha

Menampilkan snapshot Canary Metrics (win rate, error rate,
drawdown, latency eksekusi) untuk memantau kesehatan live
trading selama fase testing skala kecil. Status CRITICAL akan
otomatis memblokir BUY live baru (lihat services/trading/live.ts)
- SELL tetap selalu diizinkan, konsisten dengan Emergency Stop.
==========================================================
*/
"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/services/auth/AuthContext";
import { formatIDR, formatFullDateTime, formatRelativeTime } from "@/utils";

interface CanarySnapshot {
  status: "HEALTHY" | "WARNING" | "CRITICAL";
  totalOrders: number;
  successfulOrders: number;
  failedOrders: number;
  rejectedOrders: number;
  errorRate: number;
  successRate: number;
  averageLatencyMs: number;
  maxLatencyMs: number;
  totalPnl: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  drawdown: number;
  totalVolume: number;
  lastOrderAt?: number;
  reasons: string[];
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

const STATUS_STYLE: Record<string, string> = {
  HEALTHY: "bg-emerald-950 border-emerald-700 text-emerald-300",
  WARNING: "bg-amber-950 border-amber-700 text-amber-300",
  CRITICAL: "bg-red-950 border-red-700 text-red-300",
};

export default function CanaryMonitorPage() {
  const { user, loading: authLoading } = useAuth();

  const [snapshot, setSnapshot] = useState<CanarySnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const fetchSnapshot = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/canary/status", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
      } else {
        setSnapshot(data.snapshot);
      }
    } catch (err: any) {
      setError(err?.message ?? "Gagal memuat status canary");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  async function handleReset() {
    if (!user) return;
    if (!confirm("Reset semua data canary? Ini menghapus riwayat order yang sudah tercatat.")) {
      return;
    }

    setResetting(true);

    try {
      const idToken = await user.getIdToken();
      await fetch("/api/canary/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ reset: true }),
      });
      await fetchSnapshot();
    } finally {
      setResetting(false);
    }
  }

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
            <h1 className="text-2xl font-bold">Canary Monitor</h1>
            <p className="text-sm text-slate-400 mt-1">
              Kesehatan live trading skala kecil. Status CRITICAL otomatis
              memblokir BUY live baru — SELL tetap selalu diizinkan.
            </p>
          </div>
          <button
            onClick={fetchSnapshot}
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

        {snapshot && (
          <>
            <div className={`rounded border p-4 ${STATUS_STYLE[snapshot.status]}`}>
              <p className="text-lg font-bold">Status: {snapshot.status}</p>
              {snapshot.reasons.length > 0 && (
                <ul className="mt-2 text-sm list-disc list-inside">
                  {snapshot.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="card">
                <p className="text-xs text-slate-400">Total Order</p>
                <p className="text-xl font-bold">{snapshot.totalOrders}</p>
              </div>
              <div className="card">
                <p className="text-xs text-slate-400">Error Rate</p>
                <p className="text-xl font-bold">{pct(snapshot.errorRate)}</p>
              </div>
              <div className="card">
                <p className="text-xs text-slate-400">Win Rate</p>
                <p className="text-xl font-bold">{pct(snapshot.winRate)}</p>
              </div>
              <div className="card">
                <p className="text-xs text-slate-400">Drawdown</p>
                <p className="text-xl font-bold">{pct(snapshot.drawdown)}</p>
              </div>
              <div className="card">
                <p className="text-xs text-slate-400">Latency Rata-rata</p>
                <p className="text-xl font-bold">{snapshot.averageLatencyMs.toFixed(0)} ms</p>
              </div>
              <div className="card">
                <p className="text-xs text-slate-400">Order Gagal</p>
                <p className="text-xl font-bold">{snapshot.failedOrders + snapshot.rejectedOrders}</p>
              </div>
              <div className="card">
                <p className="text-xs text-slate-400">Total PnL</p>
                <p className="text-xl font-bold">
                  {formatIDR(snapshot.totalPnl)}
                </p>
              </div>
              <div className="card">
                <p className="text-xs text-slate-400">Order Terakhir</p>
                <p className="text-sm">
                  {snapshot.lastOrderAt
                    ? formatFullDateTime(new Date(snapshot.lastOrderAt).toISOString())
                    : "-"}
                </p>
                {snapshot.lastOrderAt && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatRelativeTime(new Date(snapshot.lastOrderAt).toISOString())}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleReset}
              disabled={resetting}
              className="rounded bg-red-800 px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {resetting ? "Mereset..." : "Reset Canary (mulai periode baru)"}
            </button>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
