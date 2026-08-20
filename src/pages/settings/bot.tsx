/**
==========================================================
AURA Trade OS
Bot Configuration
Version : 0.1.0 Alpha

SEBELUMNYA halaman ini stub kosong (<select> tanpa onChange,
<input readOnly>). Sekarang:
1. Toggle mode paper/live + emergency stop -- pakai
   BotControlPanel yang SUDAH live (bot_control/main via
   /api/bot/control), TIDAK dibuat ulang di sini supaya tidak
   ada dua UI berbeda yang saling tidak sinkron untuk hal yang
   sama.
2. Scan Interval & Pairs -- field BotSettings yang SUDAH ada
   di Firestore tapi JUJUR belum tersambung ke cron scheduler
   asli (Vercel Cron pakai jadwal dari vercel.json + env var
   BOT_PAIRS, bukan baca Firestore). Diisi di sini TERSIMPAN,
   tapi BELUM MENGUBAH perilaku bot sampai ada kerja lanjutan
   menyambungkan scheduler/cron.ts ke BotSettings.pairs -- lihat
   catatan kuning di bawah field-nya.
==========================================================
*/

import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import BotControlPanel from "@/components/BotControlPanel";

interface BotSettings {
  scanIntervalMinutes: number;
  pairs: string[];
  [key: string]: unknown;
}

export default function BotSettingsPage() {
  const [scanInterval, setScanInterval] = useState(5);
  const [pairsText, setPairsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"interval" | "pairs" | null>(null);
  const [saved, setSaved] = useState<"interval" | "pairs" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error(`Gagal memuat settings: ${res.status}`);
        const json = await res.json();
        const data: BotSettings = json.data;
        setScanInterval(data.scanIntervalMinutes ?? 5);
        setPairsText((data.pairs ?? []).join(", "));
      } catch (err) {
        console.error("[BotSettingsPage] Failed to load:", err);
        setError("Gagal memuat pengaturan.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSaveInterval() {
    setSaving("interval");
    setSaved(null);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanIntervalMinutes: scanInterval }),
      });
      if (!res.ok) throw new Error(`Gagal menyimpan: ${res.status}`);
      setSaved("interval");
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      console.error("[BotSettingsPage] Failed to save interval:", err);
      setError("Gagal menyimpan pengaturan.");
    } finally {
      setSaving(null);
    }
  }

  async function handleSavePairs() {
    setSaving("pairs");
    setSaved(null);
    setError(null);
    try {
      const pairs = pairsText
        .split(",")
        .map((p) => p.trim().toLowerCase())
        .filter(Boolean);

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pairs }),
      });
      if (!res.ok) throw new Error(`Gagal menyimpan: ${res.status}`);
      setSaved("pairs");
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      console.error("[BotSettingsPage] Failed to save pairs:", err);
      setError("Gagal menyimpan pengaturan.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <BotControlPanel />

        <div className="card space-y-6">
          <div>
            <h1 className="text-xl font-bold">Bot Configuration</h1>
            <p className="text-xs text-slate-500 mt-1">
              Scan Interval &amp; Pairs tersimpan ke Firestore, tapi{" "}
              <span className="text-amber-400">
                belum tersambung ke cron scheduler asli
              </span>{" "}
              (services/scheduler/cron.ts saat ini baca dari env var
              BOT_PAIRS + jadwal Vercel Cron, bukan dari sini). Mengubah
              nilai di bawah TIDAK langsung mengubah perilaku bot berjalan.
            </p>
          </div>

          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-slate-400">Scan Interval (menit)</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                min={1}
                max={60}
                value={scanInterval}
                disabled={loading || saving === "interval"}
                onChange={(e) => setScanInterval(Number(e.target.value))}
                onBlur={handleSaveInterval}
                className="bg-slate-900/60 border border-slate-700 rounded-md px-2 py-1 w-24"
              />
              {saving === "interval" && (
                <span className="text-xs text-slate-400">Menyimpan...</span>
              )}
              {saved === "interval" && (
                <span className="text-xs text-emerald-400">Tersimpan ✓</span>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400">
              Pairs (pisahkan dengan koma)
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={pairsText}
                disabled={loading || saving === "pairs"}
                onChange={(e) => setPairsText(e.target.value)}
                onBlur={handleSavePairs}
                placeholder="btcidr, ethidr, solidr"
                className="bg-slate-900/60 border border-slate-700 rounded-md px-3 py-1 flex-1"
              />
              {saving === "pairs" && (
                <span className="text-xs text-slate-400">Menyimpan...</span>
              )}
              {saved === "pairs" && (
                <span className="text-xs text-emerald-400">Tersimpan ✓</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
