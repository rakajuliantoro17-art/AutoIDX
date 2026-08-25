"use client";

/**
==========================================================
AURA Trade OS
System Status Badge (Header)
Version : 0.1.0 Alpha

Sebelumnya src/app/layout.tsx punya teks hardcode
"Paper Trading" di header -- muncul di SEMUA halaman App Router
(Scanner, Portfolio, Activity, Backtest, Settings) dan TIDAK
PERNAH berubah walau mode sebenarnya sudah live. Komponen ini
fetch mode ASLI dari /api/settings/config (bot_control Firestore,
sumber yang sama dipakai BotControlPanel), auto-refresh tiap 5
detik.

Kalau user belum login (mis. di halaman /login, yang berbagi
root layout yang sama), TIDAK fetch apa pun dan TIDAK mengklaim
mode apa pun -- daripada menampilkan status yang belum tentu
benar.
==========================================================
*/

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/services/auth/AuthContext";
import { REFRESH_INTERVALS } from "@/utils/constants";

type BotMode = "paper" | "live";

const REFRESH_INTERVAL_MS = REFRESH_INTERVALS.TICKER_MS;

export default function SystemStatusBadge() {

  const { user } = useAuth();

  const [effectiveMode, setEffectiveMode] = useState<BotMode | null>(null);
  const [requestedMode, setRequestedMode] = useState<BotMode | null>(null);
  const [emergencyStop, setEmergencyStop] = useState(false);

  const fetchMode = useCallback(async () => {

    if (!user) return;

    try {

      const idToken = await user.getIdToken();

      const response = await fetch("/api/settings/config", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) return;

      const json = await response.json();

      setEffectiveMode(json.effectiveMode === "live" ? "live" : "paper");
      setRequestedMode(json.requestedMode === "live" ? "live" : "paper");
      setEmergencyStop(Boolean(json.emergencyStop));

    } catch (error) {

      console.error("[SystemStatusBadge] Failed to fetch mode:", error);

    }

  }, [user]);

  useEffect(() => {

    fetchMode();

    const interval = setInterval(fetchMode, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);

  }, [fetchMode]);

  if (!user || effectiveMode === null) {

    return (
      <div className="glass flex items-center gap-3 rounded-full px-4 py-2">
        <span className="status-dot status-warning" />
        <div className="text-right">
          <p className="text-sm text-slate-300">Memuat status...</p>
          <p className="text-xs text-slate-500">v0.0.2 Alpha</p>
        </div>
      </div>
    );

  }

  const isLive = effectiveMode === "live";

  // Live DIMINTA di dashboard tapi BOT_LIVE_CONFIRM belum aktif di
  // Vercel -- dua syarat live belum lengkap, sistem masih paper.
  // Ini beda dari isLive=false biasa -- perlu ditandai jelas supaya
  // tidak dikira "lupa switch" padahal sudah switch, cuma env var
  // konfirmasinya yang belum di-set + redeploy.
  const isPendingLiveConfirm =
    requestedMode === "live" && !isLive && !emergencyStop;

  let label = "Paper Trading";
  let dotClass = "status-dot status-online";
  let labelClass = "text-sm text-slate-300";

  if (emergencyStop) {
    label = "Emergency Stop Aktif";
    dotClass = "status-dot status-error";
    labelClass = "text-sm font-semibold text-red-400";
  } else if (isLive) {
    label = "Live Trading";
    dotClass = "status-dot status-error";
    labelClass = "text-sm font-semibold text-red-400";
  } else if (isPendingLiveConfirm) {
    label = "Live Diminta - Masih Paper";
    dotClass = "status-dot status-warning";
    labelClass = "text-sm font-semibold text-amber-400";
  }

  return (
    <div className="glass flex items-center gap-3 rounded-full px-4 py-2">

      <span className={dotClass} />

      <div className="text-right">

        <p className={labelClass}>
          {label}
        </p>

        <p className="text-xs text-slate-500">v0.0.2 Alpha</p>

      </div>

    </div>
  );

}
