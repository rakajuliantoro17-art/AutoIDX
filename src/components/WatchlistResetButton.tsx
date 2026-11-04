"use client";

import { useState } from "react";
import { useAuth } from "@/services/auth/AuthContext";

/** Tombol "Recek watchlist": kembali ke daftar awal supaya usulan agen bisa menambah pair lagi hingga 25. Khusus pemilik. */
export default function WatchlistResetButton({ onDone, count }: { onDone?: () => void; count: number }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function reset() {
    if (!user || busy) return;
    if (!window.confirm(`Kembalikan watchlist (${count} pair) ke daftar awal? Pair yang punya posisi terbuka tetap diproses bot. Tidak ada order dikirim.`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/bot/watchlist-reset", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const json = await response.json();
      setMsg(json.message ?? json.error ?? (response.ok ? "Selesai." : "Gagal."));
      if (response.ok) onDone?.();
    } catch {
      setMsg("Gagal menghubungi server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button type="button" onClick={reset} disabled={busy} className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50">
        {busy ? "Memproses..." : "Recek watchlist (kembali ke pair awal)"}
      </button>
      {msg && <span className="text-xs text-[var(--text-muted)]">{msg}</span>}
    </div>
  );
}
