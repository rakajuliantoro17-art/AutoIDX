/**
==========================================================
AURA Trade OS
Executive Dashboard
Version : 0.1.0 Alpha

Perubahan dari 0.0.2:
1. Sebelumnya fetch ke /api/market (MarketScanner - tujuan
   beda, cari peluang lintas-pair) dan membaca field
   (lastPrice/rsi/signal/inPosition) yang TIDAK ADA di response
   itu - selalu jatuh ke default (price selalu Rp 0). Sekarang
   fetch ke /api/bot/state (bot_state Firestore, sumber
   kebenaran status bot sebenarnya, di-update tiap siklus cron
   oleh services/trading/engine.ts, termasuk saat HOLD).
2. `logs` sebelumnya array statis hardcode 3 baris, tidak pernah
   berubah. Sekarang fetch dari /api/logs/recent (endpoint yang
   sama dipakai src/app/activity/page.tsx), auto-refresh.

CATATAN: bot_state tidak simpan RSI (dihitung ulang tiap siklus
dari candle, tidak disimpan) - RSI card dihapus dari tampilan
sementara sampai ada tempat penyimpanan snapshot RSI terakhir.
Menampilkan RSI palsu/statis lebih menyesatkan daripada tidak
menampilkannya sama sekali.
==========================================================
*/
"use client";

import { useEffect, useState, useCallback } from "react";
import { REFRESH_INTERVALS } from "@/utils/constants";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardOverview, { type DashboardOverviewData } from "@/components/DashboardOverview";
import type { ActivityLog } from "@/components/RecentActivity";
import { useAuth } from "@/services/auth/AuthContext";

interface LogItem {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "danger";
}

const REFRESH_INTERVAL_MS = REFRESH_INTERVALS.STATUS_MS;

function formatClock(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString("id-ID", { hour12: false });
}

/**
 * LogItem (bentuk lama, dipakai loadLogs di bawah) -> ActivityLog
 * (bentuk yang diminta DashboardOverview/RecentActivity/ActivityView).
 * Konversi murni di sini, TIDAK fetch ulang apapun.
 */
function toActivityLog(log: LogItem): ActivityLog {
  return {
    id: log.id,
    time: log.timestamp,
    message: log.message,
    level:
      log.type === "success"
        ? "SUCCESS"
        : log.type === "warning"
          ? "WARNING"
          : log.type === "danger"
            ? "ERROR"
            : "INFO",
  };
}

export default function DashboardPage() {

  const { user } = useAuth();

  const [data, setData] = useState<DashboardOverviewData & { error: string | null }>({
    price: 0,
    signal: "HOLD",
    position: "OUT OF POSITION",
    stopLoss: 1,
    takeProfit: 3,
    loading: true,
    error: null,
  });

  const [logs, setLogs] = useState<LogItem[]>([]);

  const loadBotState = useCallback(async () => {

    if (!user) return;

    try {

      const idToken = await user.getIdToken();

      const res = await fetch("/api/bot/state?pair=btc_idr", {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `Bot State API failed: ${res.status}`);
      }

      const json = await res.json();

      setData({
        price: json.currentPrice ?? 0,
        signal: json.lastSignal ?? "HOLD",
        position: json.inPosition ? "ACTIVE POSITION" : "OUT OF POSITION",
        stopLoss: json.stopLoss ?? 1,
        takeProfit: json.takeProfit ?? 3,
        loading: false,
        error: null,
      });

    } catch (error) {

      console.error("[Dashboard] Failed to load bot state:", error);

      setData((prev) => ({
        ...prev,
        loading: false,
        error: "Gagal memuat status bot",
      }));

    }

  }, [user]);

  const loadLogs = useCallback(async () => {

    if (!user) return;

    try {

      const idToken = await user.getIdToken();

      const res = await fetch("/api/logs/recent?limit=10", {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!res.ok) return;

      const json = await res.json();

      setLogs(
        (json.logs ?? []).map((log: any) => ({
          id: log.id,
          timestamp: formatClock(log.timestamp),
          message: log.message,
          type:
            log.type === "success" || log.type === "warning" || log.type === "danger"
              ? log.type
              : "info",
        }))
      );

    } catch (error) {
      console.error("[Dashboard] Failed to load logs:", error);
    }

  }, [user]);

  useEffect(() => {

    loadBotState();
    loadLogs();

    const interval = setInterval(() => {
      loadBotState();
      loadLogs();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);

  }, [loadBotState, loadLogs]);

  return (
    <DashboardLayout>
      {data.error && (
        <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2 mb-4">
          {data.error} — menampilkan nilai default sementara.
        </div>
      )}
      <DashboardOverview
        data={data}
        logs={logs.map(toActivityLog)}
        logsLoading={data.loading}
        pair="btc_idr"
      />
    </DashboardLayout>
  );
}
