/**
==========================================================
AURA Trade OS
Bot Control Panel (Emergency Stop + Paper/Live Toggle)
Version : 0.0.1 Alpha
==========================================================
Toggle real-time (tanpa redeploy) untuk emergencyStop dan
mode paper/live. Baca/tulis lewat /api/bot/control, yang
tersambung ke Firestore (bot_control/main) lewat Admin SDK.

CATATAN: menyalakan mode "live" di sini TIDAK langsung
membuat bot eksekusi order asli -- masih perlu env var
BOT_LIVE_CONFIRM=true juga di Vercel (gerbang kedua, sengaja
butuh redeploy supaya tidak ada yang "kepencet" tanpa sadar).
==========================================================
*/
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/services/auth/AuthContext";
import { formatFullDateTime, formatRelativeTime } from "@/utils";

interface BotControlState {
  emergencyStop: boolean;
  mode: "paper" | "live";
  updatedAt: number;
  updatedBy?: string;
}

export default function BotControlPanel() {
  const { user } = useAuth();

  const [control, setControl] = useState<BotControlState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showLiveConfirm, setShowLiveConfirm] = useState(false);

  async function loadControl() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bot/control");
      if (!res.ok) throw new Error("Gagal memuat status kontrol bot.");
      const data = await res.json();
      setControl(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadControl();
  }, []);

  async function sendUpdate(update: Partial<Pick<BotControlState, "emergencyStop" | "mode">>) {
    if (!user) {
      setError("Kamu harus login untuk mengubah pengaturan ini.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const token = await user.getIdToken();

      const res = await fetch("/api/bot/control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(update),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Gagal menyimpan perubahan.");
      }

      const data = await res.json();
      setControl(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  function toggleEmergencyStop() {
    if (!control) return;
    sendUpdate({ emergencyStop: !control.emergencyStop });
  }

  function requestModeChange(nextMode: "paper" | "live") {
    if (!control || saving) return;

    if (nextMode === "live") {
      // Perubahan ke LIVE butuh konfirmasi eksplisit -- ini uang asli.
      setShowLiveConfirm(true);
      return;
    }

    sendUpdate({ mode: nextMode });
  }

  function confirmGoLive() {
    setShowLiveConfirm(false);
    sendUpdate({ mode: "live" });
  }

  if (loading) {
    return (
      <div className="card">
        <p className="text-slate-400">Memuat status kontrol bot...</p>
      </div>
    );
  }

  if (!control) {
    return (
      <div className="card">
        <p className="text-red-400">{error || "Status kontrol bot tidak tersedia."}</p>
      </div>
    );
  }

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Bot Control</h2>
        {control.updatedAt ? (
          <span className="text-xs text-slate-500">
            Terakhir diubah:{" "}
            <span title={formatFullDateTime(new Date(control.updatedAt).toISOString())}>
              {formatRelativeTime(new Date(control.updatedAt).toISOString())}
            </span>
            {control.updatedBy ? ` oleh ${control.updatedBy}` : ""}
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : null}

      {/* --- Emergency Stop --- */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 p-5">
        <div>
          <p className="font-semibold">
            Emergency Stop
            {control.emergencyStop ? (
              <span className="ml-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400">
                AKTIF
              </span>
            ) : (
              <span className="ml-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                NONAKTIF
              </span>
            )}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Kalau aktif: BUY baru langsung diblokir. SELL, stop-loss, dan take-profit
            tetap berjalan supaya posisi terbuka tidak "nyangkut".
          </p>
        </div>

        <button
          onClick={toggleEmergencyStop}
          disabled={saving}
          className={`
            shrink-0 rounded-full px-6 py-3 font-bold transition
            disabled:opacity-50
            ${
              control.emergencyStop
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-red-500 text-white hover:bg-red-600"
            }
          `}
        >
          {control.emergencyStop ? "Matikan Emergency Stop" : "Aktifkan Emergency Stop"}
        </button>
      </div>

      {/* --- Trading Mode --- */}
      <div className="rounded-xl border border-white/10 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">
              Trading Mode:{" "}
              <span className={control.mode === "live" ? "text-red-400" : "text-yellow-400"}>
                {control.mode === "live" ? "LIVE (uang asli)" : "PAPER (simulasi)"}
              </span>
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Mode "live" di sini baru satu dari dua syarat. Bot baru benar-benar
              eksekusi order asli kalau env var <code>BOT_LIVE_CONFIRM=true</code> juga
              sudah di-set di Vercel.
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => requestModeChange("paper")}
            disabled={saving || control.mode === "paper"}
            className="flex-1 rounded-xl bg-white/10 px-4 py-3 font-semibold hover:bg-white/20 disabled:opacity-40"
          >
            Paper Trading
          </button>
          <button
            onClick={() => requestModeChange("live")}
            disabled={saving || control.mode === "live"}
            className="flex-1 rounded-xl bg-red-500/20 px-4 py-3 font-semibold text-red-400 hover:bg-red-500/30 disabled:opacity-40"
          >
            Live Trading
          </button>
        </div>
      </div>

      {/* --- Konfirmasi pindah ke Live --- */}
      {showLiveConfirm ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-5 space-y-4">
          <p className="font-bold text-red-400">
            Yakin mau pindah ke mode LIVE?
          </p>
          <p className="text-sm text-slate-300">
            Bot akan mencoba mengeksekusi order ASLI dengan uang sungguhan setelah
            <code className="mx-1">BOT_LIVE_CONFIRM=true</code>
            juga di-set di Vercel. Pastikan nominal trade, stop loss, dan batas
            eksposur di pengaturan risk sudah sesuai keinginan kamu sebelum lanjut.
          </p>
          <div className="flex gap-3">
            <button
              onClick={confirmGoLive}
              disabled={saving}
              className="rounded-xl bg-red-500 px-5 py-2 font-bold text-white hover:bg-red-600 disabled:opacity-50"
            >
              Ya, pindah ke Live
            </button>
            <button
              onClick={() => setShowLiveConfirm(false)}
              disabled={saving}
              className="rounded-xl bg-white/10 px-5 py-2 font-semibold hover:bg-white/20"
            >
              Batal
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
