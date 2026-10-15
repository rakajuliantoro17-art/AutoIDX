"use client";

/**
==========================================================
AURA Trade OS
Mode Switcher (Paper / Live) untuk menu gear di header
==========================================================
Memakai endpoint yang sama dengan BotControlPanel
(POST /api/bot/control { mode }) -- tidak ada jalur baru.
Pindah ke LIVE wajib konfirmasi eksplisit (uang asli) dan
tetap butuh BOT_LIVE_CONFIRM di Vercel; pindah ke PAPER
langsung. Emergency Stop TIDAK diubah dari sini.
==========================================================
*/

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/services/auth/AuthContext";

type Mode = "paper" | "live";

export default function ModeSwitcher({ onChanged }: { onChanged: () => void }) {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode | null>(null);
  const [confirmLive, setConfirmLive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/bot/control");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setMode(json.mode === "live" ? "live" : "paper");
      setError("");
    } catch {
      setError("Gagal membaca mode saat ini.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function send(next: Mode) {
    if (!user) {
      setError("Harus login untuk mengubah mode.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/bot/control", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode: next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Gagal mengubah mode.");
      }
      const data = await res.json();
      setMode(data.mode === "live" ? "live" : "paper");
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
      setConfirmLive(false);
    }
  }

  function choose(next: Mode) {
    if (saving || next === mode) return;
    if (next === "live") {
      setConfirmLive(true);
      return;
    }
    send(next);
  }

  const base =
    "flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:opacity-50";

  return (
    <div className="mt-2 space-y-2 rounded-xl border border-white/10 p-2">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => choose("paper")}
          aria-pressed={mode === "paper"}
          className={`${base} ${
            mode === "paper"
              ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-300"
              : "border-white/10 text-[var(--text-secondary)] hover:bg-white/5"
          }`}
        >
          Paper
          <span className="block text-[10px] font-normal opacity-70">simulasi</span>
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => choose("live")}
          aria-pressed={mode === "live"}
          className={`${base} ${
            mode === "live"
              ? "border-red-400/60 bg-red-500/15 text-red-300"
              : "border-white/10 text-[var(--text-secondary)] hover:bg-white/5"
          }`}
        >
          Live
          <span className="block text-[10px] font-normal opacity-70">uang asli</span>
        </button>
      </div>

      {confirmLive && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-xs">
          <p className="font-semibold text-red-300">Yakin pindah ke mode LIVE?</p>
          <p className="mt-1 text-[var(--text-secondary)]">
            Order akan memakai uang asli. Live hanya aktif bila BOT_LIVE_CONFIRM di Vercel juga menyala.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => send("live")}
              className="flex-1 rounded-lg bg-red-500/80 px-3 py-2 font-semibold text-white disabled:opacity-50"
            >
              Ya, aktifkan Live
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setConfirmLive(false)}
              className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-[var(--text)]"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {error && <p className="px-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
