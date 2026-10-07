/**
==========================================================
AURA Trade OS
Bot Configuration
Version : 0.1.0 Alpha

CATATAN: checklist pemilihan pair SUDAH ADA dan benar di
BotControlPanel.tsx (section "Priority Pairs", simpan ke
BotControl.priorityPairs via POST /api/bot/control, dipakai
executeCron() di scheduler/cron.ts). Halaman ini sempat
ditambahi checklist KEDUA yang duplikat (nyimpen ke
BotSettings.pairs, tidak terhubung ke cron sama sekali) --
sudah DIHAPUS LAGI. Jangan tambahkan lagi tanpa mengecek
BotControlPanel.tsx dulu.
==========================================================
*/

import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import BotControlPanel from "@/components/BotControlPanel";

interface BotSettings {
  scanIntervalMinutes: number;
  [key: string]: unknown;
}

export default function BotSettingsPage() {
  const [scanInterval, setScanInterval] = useState(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error(`Gagal memuat settings: ${res.status}`);

        const json = await res.json();
        const data: BotSettings = json.data;
        setScanInterval(data.scanIntervalMinutes ?? 5);
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
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanIntervalMinutes: scanInterval }),
      });
      if (!res.ok) throw new Error(`Gagal menyimpan: ${res.status}`);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[BotSettingsPage] Failed to save interval:", err);
      setError("Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
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
              Scan Interval tersimpan ke Firestore. Untuk memilih pair mana
              yang boleh ditradingkan bot secara aktif, pakai checklist
              "Priority Pairs" di panel kontrol di atas.
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
                disabled={loading || saving}
                onChange={(e) => setScanInterval(Number(e.target.value))}
                onBlur={handleSaveInterval}
                className="bg-slate-900/60 border border-slate-700 rounded-md px-2 py-1 w-24"
              />
              {saving && (
                <span className="text-xs text-slate-400">Menyimpan...</span>
              )}
              {saved && (
                <span className="text-xs text-emerald-400">Tersimpan ✓</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
