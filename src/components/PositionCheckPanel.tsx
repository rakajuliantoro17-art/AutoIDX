/**
 * Panel "Cek Posisi vs Saldo Indodax" (ramah HP, khusus pemilik).
 * Dimuat HANYA saat tombol ditekan (hemat kuota Firestore). Posisi hantu
 * (bot mencatat koin, Indodax 0) bisa dibersihkan; server memverifikasi
 * ulang saldo dan mencatat ke audit_logs.
 */
import { useState } from "react";
import { useAuth } from "@/services/auth/AuthContext";

interface Row {
  pair: string;
  localQty: number;
  entryPrice: number;
  exchangeQty: number;
  status: "COCOK" | "HANTU" | "SELISIH";
}

const BADGE: Record<Row["status"], string> = {
  COCOK: "bg-emerald-500/20 text-emerald-400",
  HANTU: "bg-red-500/20 text-red-400",
  SELISIH: "bg-amber-500/20 text-amber-400",
};

const LABEL: Record<Row["status"], string> = {
  COCOK: "Cocok",
  HANTU: "Posisi hantu",
  SELISIH: "Selisih",
};

const fmt = (n: number) => (Number.isFinite(n) ? Number(n.toPrecision(6)).toString() : "-");

export default function PositionCheckPanel() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function token() {
    return user!.getIdToken();
  }

  async function check() {
    if (!user) return;
    setBusy("check");
    setMsg(null);
    try {
      const r = await fetch("/api/positions/check", { headers: { Authorization: `Bearer ${await token()}` } });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Gagal memeriksa posisi.");
      setRows(j.positions ?? []);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  async function clear(row: Row) {
    if (
      !window.confirm(
        `Bersihkan catatan posisi ${row.pair.toUpperCase()}?\nBot mencatat ${fmt(row.localQty)} koin, saldo Indodax ${fmt(row.exchangeQty)}. Tidak ada order yang dikirim; hanya catatan bot yang dihapus.`
      )
    )
      return;
    setBusy(row.pair);
    setMsg(null);
    try {
      const r = await fetch("/api/positions/clear", {
        method: "POST",
        headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ pair: row.pair }),
      });
      const j = await r.json();
      setMsg(j.message ?? j.error ?? (r.ok ? "Selesai." : "Gagal."));
      if (r.ok) await check();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold">Cek Posisi vs Saldo Indodax</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Membandingkan posisi terbuka di bot dengan saldo koin asli di Indodax. Posisi hantu (sisa mode paper)
        memicu emergency stop otomatis di mode live; bersihkan di sini. Khusus pemilik.
      </p>

      <button
        onClick={check}
        disabled={busy !== null}
        className="mt-4 w-full rounded-full bg-emerald-500 px-5 py-3 font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50 sm:w-auto"
      >
        {busy === "check" ? "Memeriksa..." : "Periksa posisi sekarang"}
      </button>

      {msg ? <p className="mt-3 text-sm text-[var(--text-secondary)] break-words">{msg}</p> : null}

      {rows ? (
        rows.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--text-muted)]">Tidak ada posisi terbuka di catatan bot.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {rows.map((r) => (
              <div key={r.pair} className="rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold uppercase">{r.pair}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${BADGE[r.status]}`}>{LABEL[r.status]}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Catatan bot: {fmt(r.localQty)} · Saldo Indodax: {fmt(r.exchangeQty)}
                </p>
                {r.status === "HANTU" ? (
                  <button
                    onClick={() => clear(r)}
                    disabled={busy !== null}
                    className="mt-3 w-full rounded-full bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50 sm:w-auto"
                  >
                    {busy === r.pair ? "Membersihkan..." : "Bersihkan posisi hantu"}
                  </button>
                ) : null}
                {r.status === "SELISIH" ? (
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    Saldo Indodax masih ada tapi tidak cocok; tidak bisa dibersihkan otomatis. Periksa manual di Indodax.
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}
