/**
==========================================================
AURA Trade OS
Bot Configuration
Version : 0.2.0 Alpha

Pairs SEKARANG checklist (bukan input teks bebas), diambil
dari /api/market/qualified -- HANYA pair yang lolos
kualifikasi AI di scan terakhir yang bisa dipilih, sesuai
kesepakatan: checklist berubah dinamis sesuai qualifiedPairs
terkini. Maksimal 10 pair (divalidasi juga di server, lihat
api/settings/validate.ts).

Kalau tidak ada pair yang dicentang, bot kembali ke mode
auto (top opportunity by score) -- lihat scheduler/scanCycle.ts.
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

interface QualifiedOpportunity {
  pair: string;
  symbol: string;
  opportunityScore: number;
  aiScore?: number;
  aiDirection?: "BULLISH" | "BEARISH" | "NEUTRAL";
  trend: string;
}

const MAX_SELECTED_PAIRS = 10;

export default function BotSettingsPage() {
  const [scanInterval, setScanInterval] = useState(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"interval" | "pairs" | null>(null);
  const [saved, setSaved] = useState<"interval" | "pairs" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [opportunities, setOpportunities] = useState<QualifiedOpportunity[]>([]);
  const [qualifiedPairs, setQualifiedPairs] = useState<string[]>([]);
  const [scanAvailable, setScanAvailable] = useState(true);
  const [selectedPairs, setSelectedPairs] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const [settingsRes, qualifiedRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/market/qualified"),
        ]);

        if (!settingsRes.ok) throw new Error(`Gagal memuat settings: ${settingsRes.status}`);
        if (!qualifiedRes.ok) throw new Error(`Gagal memuat daftar pair: ${qualifiedRes.status}`);

        const settingsJson = await settingsRes.json();
        const qualifiedJson = await qualifiedRes.json();

        const data: BotSettings = settingsJson.data;
        setScanInterval(data.scanIntervalMinutes ?? 5);
        setSelectedPairs(new Set(data.pairs ?? []));

        setOpportunities(qualifiedJson.data.opportunities ?? []);
        setQualifiedPairs(qualifiedJson.data.qualifiedPairs ?? []);
        setScanAvailable(qualifiedJson.data.scanAvailable ?? true);
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

  async function persistPairs(nextSelected: Set<string>) {
    setSaving("pairs");
    setSaved(null);
    setError(null);
    try {
      const pairs = Array.from(nextSelected);

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pairs }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Gagal menyimpan: ${res.status}`);
      }

      setSaved("pairs");
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      console.error("[BotSettingsPage] Failed to save pairs:", err);
      setError(err instanceof Error ? err.message : "Gagal menyimpan pengaturan.");
      // Rollback tampilan checklist ke state sebelum toggle gagal disimpan.
      setSelectedPairs(new Set(nextSelected));
    } finally {
      setSaving(null);
    }
  }

  function togglePair(pair: string) {
    if (saving === "pairs") return;

    const next = new Set(selectedPairs);

    if (next.has(pair)) {
      next.delete(pair);
    } else {
      if (next.size >= MAX_SELECTED_PAIRS) {
        setError(`Maksimal ${MAX_SELECTED_PAIRS} pair yang bisa dipilih.`);
        setTimeout(() => setError(null), 3000);
        return;
      }
      next.add(pair);
    }

    setSelectedPairs(next);
    persistPairs(next);
  }

  // Gabungkan opportunities (punya skor AI) dengan qualifiedPairs
  // (nama-nama saja) supaya pair qualified yang tidak masuk top
  // opportunities tetap muncul di checklist, walau tanpa detail skor.
  const checklistItems: QualifiedOpportunity[] = [
    ...opportunities,
    ...qualifiedPairs
      .filter((pair) => !opportunities.some((o) => o.pair === pair))
      .map((pair) => ({ pair, symbol: pair.toUpperCase(), opportunityScore: 0, trend: "-" })),
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <BotControlPanel />

        <div className="card space-y-6">
          <div>
            <h1 className="text-xl font-bold">Bot Configuration</h1>
            <p className="text-xs text-slate-500 mt-1">
              Scan Interval tersimpan ke Firestore. Pilih pair mana yang
              boleh ditradingkan bot secara aktif lewat checklist di bawah
              (maks {MAX_SELECTED_PAIRS} pair) -- kalau tidak ada yang
              dicentang, bot otomatis fokus ke top opportunity hasil scan.
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
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-400">
                Pair untuk Trading Aktif ({selectedPairs.size}/{MAX_SELECTED_PAIRS})
              </label>
              {saving === "pairs" && (
                <span className="text-xs text-slate-400">Menyimpan...</span>
              )}
              {saved === "pairs" && (
                <span className="text-xs text-emerald-400">Tersimpan ✓</span>
              )}
            </div>

            {!scanAvailable && (
              <p className="text-xs text-amber-400 mt-2">
                Belum ada hasil scan tersimpan. Checklist akan terisi
                otomatis setelah siklus cron pertama selesai.
              </p>
            )}

            {scanAvailable && checklistItems.length === 0 && !loading && (
              <p className="text-xs text-slate-500 mt-2">
                Tidak ada pair yang qualified di scan terakhir.
              </p>
            )}

            <div className="mt-2 max-h-80 overflow-y-auto space-y-1 border border-slate-800 rounded-md p-2">
              {loading && (
                <p className="text-xs text-slate-500 px-2 py-1">Memuat...</p>
              )}

              {!loading &&
                checklistItems.map((item) => {
                  const checked = selectedPairs.has(item.pair);
                  return (
                    <label
                      key={item.pair}
                      className={`flex items-center justify-between gap-3 px-2 py-1.5 rounded-md cursor-pointer hover:bg-slate-800/60 ${
                        checked ? "bg-sky-500/10 border border-sky-500/30" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={saving === "pairs"}
                          onChange={() => togglePair(item.pair)}
                        />
                        <span className="font-mono text-sm">{item.symbol}</span>
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-2">
                        {item.aiDirection && (
                          <span
                            className={
                              item.aiDirection === "BULLISH"
                                ? "text-emerald-400"
                                : item.aiDirection === "BEARISH"
                                ? "text-rose-400"
                                : "text-slate-400"
                            }
                          >
                            {item.aiDirection}
                          </span>
                        )}
                        <span>Skor: {item.opportunityScore.toFixed(1)}</span>
                      </span>
                    </label>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
