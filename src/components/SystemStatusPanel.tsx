"use client";

/**
==========================================================
AURA Trade OS
System Status Panel
Version : 0.1.0 Alpha
==========================================================
Menampilkan semua subsistem backend yang sedang berjalan
(cache, database, exchange/Indodax, Firebase, memory,
network, scheduler/cron) dengan status live, diambil dari
/api/health (endpoint publik, sudah ada, mengagregasi 7
pengecekan asli lewat services/health).

Dipakai sebagai:
1. Popover ringkas dari header (ikon server + jumlah OK/total).
2. Panel penuh yang bisa ditempel di halaman dashboard.
==========================================================
*/

import { useCallback, useEffect, useState } from "react";
import { REFRESH_INTERVALS } from "@/utils/constants";
import { IconServer } from "@/components/icons";

type HealthLevel = "HEALTHY" | "WARNING" | "UNHEALTHY" | string;

interface SubsystemCheck {
  status: HealthLevel;
  message?: string;
  latency?: number;
  usagePercent?: number;
}

interface HealthDetails {
  status: HealthLevel;
  checkedAt?: string;
  checks: Record<string, SubsystemCheck>;
}

interface HealthResponsePayload {
  success: boolean;
  status: string;
  version?: string;
  timestamp?: string;
  environment?: string;
  details?: HealthDetails;
}

const SUBSYSTEM_LABELS: Record<string, string> = {
  cache: "Cache",
  database: "Database (Firestore)",
  exchange: "Indodax Exchange",
  firebase: "Firebase Auth",
  memory: "Memori Proses",
  network: "Jaringan",
  scheduler: "Scheduler / Cron",
};

function levelStyle(level: HealthLevel) {
  switch (level) {
    case "HEALTHY":
      return { dot: "status-dot status-online", text: "text-emerald-400" };
    case "WARNING":
      return { dot: "status-dot status-warning", text: "text-amber-400" };
    case "UNHEALTHY":
      return { dot: "status-dot status-error", text: "text-rose-400" };
    default:
      return { dot: "status-dot status-warning", text: "text-slate-400" };
  }
}

function useSystemHealth(pollMs: number) {
  const [data, setData] = useState<HealthResponsePayload | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      const json = (await response.json()) as HealthResponsePayload;
      setData(json);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, pollMs);
    return () => clearInterval(interval);
  }, [fetchHealth, pollMs]);

  return { data, error, loading };
}

/* ==========================================================
   Compact trigger — dipakai di Header
========================================================== */

export function SystemStatusTrigger({
  onClick,
  open,
}: {
  onClick: () => void;
  open: boolean;
}) {
  const { data, error, loading } = useSystemHealth(
    REFRESH_INTERVALS.TICKER_MS,
  );

  const checks = data?.details?.checks ?? {};
  const entries = Object.entries(checks);
  const healthyCount = entries.filter(
    ([, v]) => v.status === "HEALTHY",
  ).length;
  const total = entries.length;

  const overall: HealthLevel = error
    ? "UNHEALTHY"
    : (data?.details?.status ?? "WARNING");

  const style = levelStyle(overall);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-haspopup="dialog"
      className={`glass flex items-center gap-2 rounded-full px-3 py-2 transition ${
        open ? "border-[var(--accent)]" : ""
      }`}
      title="Status sistem"
    >
      <IconServer className="h-4 w-4 text-[var(--text-secondary)]" />
      <span className={style.dot} />
      <span className="hidden text-xs font-medium text-[var(--text-secondary)] sm:inline">
        {loading ? "Memuat..." : `${healthyCount}/${total} Sistem`}
      </span>
    </button>
  );
}

/* ==========================================================
   Full panel — dipakai di dalam popover ATAU ditempel langsung
========================================================== */

export default function SystemStatusPanel({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { data, error, loading } = useSystemHealth(
    REFRESH_INTERVALS.TICKER_MS,
  );

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-full animate-pulse rounded-[var(--radius-md)] bg-[var(--surface)]"
          />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-rose-500/20 bg-rose-500/5 p-4">
        <span className="status-dot status-error" />
        <p className="text-sm text-rose-400">
          Tidak bisa mengambil status sistem.
        </p>
      </div>
    );
  }

  const checks = data.details?.checks ?? {};
  const entries = Object.entries(checks);

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      {entries.map(([key, check]) => {
        const style = levelStyle(check.status);
        const label = SUBSYSTEM_LABELS[key] ?? key;

        return (
          <div
            key={key}
            className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={style.dot} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--text)]">
                  {label}
                </p>
                {check.message && !compact && (
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    {check.message}
                  </p>
                )}
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className={`text-xs font-semibold ${style.text}`}>
                {check.status}
              </p>
              {typeof check.latency === "number" && (
                <p className="text-[10px] text-[var(--text-muted)]">
                  {check.latency}ms
                </p>
              )}
              {typeof check.usagePercent === "number" && (
                <p className="text-[10px] text-[var(--text-muted)]">
                  {check.usagePercent}%
                </p>
              )}
            </div>
          </div>
        );
      })}

      {data.details?.checkedAt && (
        <p className="pt-1 text-right text-[10px] text-[var(--text-muted)]">
          Diperbarui{" "}
          {new Date(data.details.checkedAt).toLocaleTimeString("id-ID")}
        </p>
      )}
    </div>
  );
}
