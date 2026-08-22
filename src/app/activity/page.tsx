/**
==========================================================
AURA Trade OS
Activity Logs
Version : 0.2.0 Alpha

Perubahan dari 0.1.0: sebelumnya `activities` adalah array
statis hardcode (3 baris contoh, tidak pernah berubah). Sekarang
fetch data ASLI dari /api/logs/recent (activity_logs + trades
Firestore), auto-refresh tiap 5 detik selama halaman ini dibuka
- supaya bisa dipantau near-realtime tanpa perlu refresh manual.
==========================================================
*/
"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/services/auth/AuthContext";
import { formatIDR } from "@/utils";

interface ActivityItem {
  id: string;
  time: string;
  level: "INFO" | "SUCCESS" | "WARNING" | "DANGER";
  module: string;
  message: string;
}

interface TradeItem {
  id: string;
  pair: string;
  type: "BUY" | "SELL";
  price: number;
  amount: number;
  totalIdr: number;
  mode: "paper" | "live";
  reason: string;
  time: string | null;
}

const REFRESH_INTERVAL_MS = 5000;

function levelFromType(type: string): ActivityItem["level"] {
  switch (type) {
    case "success":
      return "SUCCESS";
    case "warning":
      return "WARNING";
    case "danger":
      return "DANGER";
    default:
      return "INFO";
  }
}

function badge(level: ActivityItem["level"]) {

  switch (level) {

    case "SUCCESS":
      return "bg-emerald-500/20 text-emerald-400";

    case "WARNING":
      return "bg-yellow-500/20 text-yellow-400";

    case "DANGER":
      return "bg-red-500/20 text-red-400";

    default:
      return "bg-sky-500/20 text-sky-400";
  }

}

function formatTime(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

export default function ActivityPage() {

  const { user } = useAuth();

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {

    if (!user) return;

    try {

      const idToken = await user.getIdToken();

      const response = await fetch("/api/logs/recent?limit=50", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Gagal memuat log.");
      }

      setActivities(
        (json.logs ?? []).map((log: any) => ({
          id: log.id,
          time: formatTime(log.timestamp),
          level: levelFromType(log.type),
          module: log.source,
          message: log.message,
        }))
      );

      setTrades(
        (json.trades ?? []).map((trade: any) => ({
          ...trade,
          time: formatTime(trade.timestamp),
        }))
      );

      setLastFetchedAt(new Date().toLocaleTimeString("id-ID"));
      setError(null);

    } catch (err) {

      console.error("[ActivityPage] Failed to fetch logs:", err);
      setError(
        err instanceof Error ? err.message : "Gagal memuat log."
      );

    } finally {
      setLoading(false);
    }

  }, [user]);

  useEffect(() => {

    fetchLogs();

    const interval = setInterval(fetchLogs, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);

  }, [fetchLogs]);

  const successCount = activities.filter((a) => a.level === "SUCCESS").length;
  const warningCount = activities.filter((a) => a.level === "WARNING").length;
  const dangerCount = activities.filter((a) => a.level === "DANGER").length;

  return (

    <section className="space-y-8">

      <div className="glass p-8">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold">
              Activity Logs
            </h1>

            <p className="mt-2 text-slate-400">
              Riwayat aktivitas AutoIDX selama proses scanning,
              analisis, dan eksekusi trading — auto-refresh tiap{" "}
              {REFRESH_INTERVAL_MS / 1000} detik.
            </p>

          </div>

          <div className="text-right text-xs text-slate-500">
            {lastFetchedAt && (
              <p>Terakhir diperbarui: {lastFetchedAt}</p>
            )}
          </div>

        </div>

        {error && (
          <div className="mt-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}

      </div>

      {/* Summary */}

      <div className="grid gap-6 md:grid-cols-4">

        <div className="card">
          <p className="text-sm text-slate-400">Total Events</p>
          <h2 className="mt-2 text-2xl font-bold">
            {loading ? "..." : activities.length}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">Success</p>
          <h2 className="mt-2 text-2xl font-bold text-emerald-400">
            {loading ? "..." : successCount}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">Warning</p>
          <h2 className="mt-2 text-2xl font-bold text-yellow-400">
            {loading ? "..." : warningCount}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">Danger</p>
          <h2 className="mt-2 text-2xl font-bold text-red-400">
            {loading ? "..." : dangerCount}
          </h2>
        </div>

      </div>

      {/* Recent Trades (BUY/SELL asli, termasuk live) */}

      <div className="card overflow-x-auto">

        <h2 className="text-lg font-semibold mb-4">
          Transaksi Terbaru
        </h2>

        <table className="w-full text-sm">

          <thead className="border-b border-white/10">
            <tr>
              <th className="py-3 text-left">Waktu</th>
              <th className="text-left">Pair</th>
              <th className="text-left">Sisi</th>
              <th className="text-left">Harga</th>
              <th className="text-left">Jumlah</th>
              <th className="text-left">Mode</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="py-4 text-slate-500" colSpan={6}>
                  Memuat...
                </td>
              </tr>
            ) : trades.length === 0 ? (
              <tr>
                <td className="py-4 text-slate-500" colSpan={6}>
                  Belum ada transaksi.
                </td>
              </tr>
            ) : (
              trades.map((trade) => (
                <tr key={trade.id} className="border-b border-white/5">
                  <td className="py-3">{trade.time}</td>
                  <td>{trade.pair.toUpperCase()}</td>
                  <td className={trade.type === "BUY" ? "text-emerald-400" : "text-rose-400"}>
                    {trade.type}
                  </td>
                  <td>{formatIDR(trade.price ?? 0)}</td>
                  <td>{trade.amount}</td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        trade.mode === "live"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {trade.mode.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>

      </div>

      {/* Activity Table */}

      <div className="card overflow-x-auto">

        <h2 className="text-lg font-semibold mb-4">
          Log Sistem
        </h2>

        <table className="w-full text-sm">

          <thead className="border-b border-white/10">
            <tr>
              <th className="py-3 text-left">Time</th>
              <th className="text-left">Level</th>
              <th className="text-left">Module</th>
              <th className="text-left">Message</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="py-4 text-slate-500" colSpan={4}>
                  Memuat...
                </td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td className="py-4 text-slate-500" colSpan={4}>
                  Belum ada log.
                </td>
              </tr>
            ) : (
              activities.map((item) => (
                <tr key={item.id} className="border-b border-white/5">
                  <td className="py-4">{item.time}</td>
                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${badge(item.level)}`}
                    >
                      {item.level}
                    </span>
                  </td>
                  <td>{item.module}</td>
                  <td>{item.message}</td>
                </tr>
              ))
            )}
          </tbody>

        </table>

      </div>

    </section>

  );

}
