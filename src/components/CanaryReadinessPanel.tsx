"use client";
/** Panel kesiapan canary (khusus pemilik): daftar gerbang yang harus lolos sebelum BUY live pertama. */
import { useState } from "react";
import { useAuth } from "@/services/auth/AuthContext";

interface Check { id: string; label: string; status: "pass" | "fail" | "warn"; detail: string }

const ICON = { pass: "✅", fail: "❌", warn: "⚠️" } as const;

export default function CanaryReadinessPanel() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ ready: boolean; checks: Check[] } | null>(null);

  async function run() {
    if (!user || loading) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/canary/readiness", { headers: { Authorization: `Bearer ${token}` } });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      setResult(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memeriksa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h2 className="text-lg font-semibold">Kesiapan Canary</h2>
        <button onClick={run} disabled={loading} className="text-xs px-3 py-2 rounded-md bg-sky-500/20 text-sky-300 disabled:opacity-50">
          {loading ? "Memeriksa..." : "Periksa Sekarang"}
        </button>
      </div>
      <p className="text-xs text-[var(--text-secondary)] mb-3">Baca-saja. Memastikan BUY live pertama lolos semua gerbang, tanpa mengirim order.</p>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {result && (
        <>
          <p className={`text-sm font-semibold mb-2 ${result.ready ? "text-emerald-300" : "text-rose-400"}`}>
            {result.ready ? "Siap: tidak ada gerbang yang menggagalkan BUY." : "Belum siap: ada gerbang yang akan memblokir BUY."}
          </p>
          <ul className="space-y-1 text-xs">
            {result.checks.map((c) => (
              <li key={c.id}><span className="mr-1">{ICON[c.status]}</span><b>{c.label}</b> — {c.detail}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
