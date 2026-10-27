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
  valueIdr?: number;
  releasable?: boolean;
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

  interface WalletRow {
    asset: string;
    total: number;
    status: "DIKELOLA" | "DI_LUAR_KELOLAAN" | "TAK_TERLACAK";
    extraQty: number;
    history: { time: string; type: string; price: number; amount: number }[] | null;
    orderHistoryRaw?: unknown;
  }
  const [wallet, setWallet] = useState<{ idr: { available: number; hold: number }; holdings: WalletRow[]; transfers?: { withdrawIdr?: unknown[]; depositIdr?: unknown[] } | null; historyError?: string | null; recentTrades?: { pair: string; time: string; type: string; price: number; idr: number; fee: number; orderId: string }[]; recentErrors?: string[] } | null>(null);

  async function loadWallet() {
    if (!user) return;
    setBusy("wallet");
    setMsg(null);
    try {
      const r = await fetch("/api/positions/wallet", { headers: { Authorization: `Bearer ${await token()}` } });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Gagal membaca dompet.");
      setWallet(j);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  async function unmarkUnmanaged(asset: string) {
    if (
      !window.confirm(
        `Batalkan penandaan "di luar kelolaan" untuk ${asset.toUpperCase()}?\nLakukan HANYA setelah koin ini sudah dijual/dipindahkan. Jika masih ada di dompet, saldonya akan terbaca sebagai selisih dan bisa memicu emergency stop saat rekonsiliasi.`
      )
    )
      return;
    setBusy(`unmark:${asset}`);
    setMsg(null);
    try {
      const r = await fetch("/api/positions/unmark-unmanaged", {
        method: "POST",
        headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ asset, confirm: true }),
      });
      const j = await r.json();
      setMsg(j.message ?? j.error ?? (r.ok ? "Selesai." : "Gagal."));
      if (r.ok) await loadWallet();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  async function markUnmanaged(asset: string, qty: number) {
    if (
      !window.confirm(
        `Tandai ${asset.toUpperCase()} (${fmt(qty)}) sebagai "di luar kelolaan"?\nGunakan HANYA jika koin ini milik Anda sendiri (bukan hasil beli bot). Tidak ada order dikirim; jumlah ini hanya dikurangkan dari saldo bursa saat rekonsiliasi supaya pembelian bot di pair yang sama tidak memicu emergency stop.`
      )
    )
      return;
    setBusy(`mark:${asset}`);
    setMsg(null);
    try {
      const r = await fetch("/api/positions/mark-unmanaged", {
        method: "POST",
        headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ asset, confirm: true }),
      });
      const j = await r.json();
      setMsg(j.message ?? j.error ?? (r.ok ? "Selesai." : "Gagal."));
      if (r.ok) await loadWallet();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  async function release(row: Row) {
    if (
      !window.confirm(
        `Lepas ${row.pair.toUpperCase()} dari kelolaan bot?\nNilai posisi ~Rp${row.valueIdr ?? "?"} (di bawah minimum order Indodax Rp10.000, tidak bisa dijual bot). Tidak ada order dikirim; koin tetap di dompet Indodax dan tidak lagi dijual otomatis oleh bot.`
      )
    )
      return;
    setBusy(row.pair);
    setMsg(null);
    try {
      const r = await fetch("/api/positions/release", {
        method: "POST",
        headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ pair: row.pair, confirm: true }),
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

      <button
        onClick={loadWallet}
        disabled={busy !== null}
        className="mt-3 w-full rounded-full border border-white/20 px-5 py-3 font-bold transition hover:bg-white/10 disabled:opacity-50 sm:ml-3 sm:w-auto"
      >
        {busy === "wallet" ? "Membaca..." : "Lihat isi dompet"}
      </button>

      {wallet ? (
        <div className="mt-4 space-y-2 text-sm">
          <p className="text-[var(--text-secondary)]">
            IDR tersedia Rp{Math.round(wallet.idr.available)} · tertahan Rp{Math.round(wallet.idr.hold)}
          </p>
          {wallet.recentTrades ? (
            <div className="rounded-lg border border-slate-700 p-2 text-xs text-slate-300">
              <p className="font-semibold">Trade terbaru semua pair ({wallet.recentTrades.length}):</p>
              {wallet.recentTrades.length === 0 ? <p>Tidak ada trade pada rentang ini.</p> : null}
              {wallet.recentTrades.map((t, i) => (
                <p key={i} className="font-mono">
                  {new Date(t.time).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} · {t.pair} · {t.type.toUpperCase()} · Rp{fmt(t.idr)} @ {fmt(t.price)} · fee {fmt(t.fee)}
                </p>
              ))}
              {wallet.recentErrors?.length ? <p className="text-red-400">Gagal: {wallet.recentErrors.join(" | ")}</p> : null}
            </div>
          ) : null}
          {wallet.historyError ? <p className="text-xs text-red-400">Riwayat trade gagal dibaca: {wallet.historyError}</p> : null}
          {wallet.transfers ? (
            <div className="rounded-xl border border-white/10 p-3 text-xs text-[var(--text-secondary)] break-words">
              <p className="font-semibold">Deposit/penarikan IDR terbaru</p>
              <p>Penarikan: {JSON.stringify(wallet.transfers.withdrawIdr ?? [])}</p>
              <p>Deposit: {JSON.stringify(wallet.transfers.depositIdr ?? [])}</p>
            </div>
          ) : null}
          {wallet.holdings.length === 0 ? <p className="text-[var(--text-muted)]">Tidak ada koin di dompet.</p> : null}
          {wallet.holdings.map((h) => (
            <div key={h.asset} className="rounded-xl border border-white/10 p-3">
              <p className="font-semibold uppercase">
                {h.asset} · {fmt(h.total)} ·{" "}
                {h.status === "DIKELOLA" ? "dikelola bot" : h.status === "DI_LUAR_KELOLAAN" ? "di luar kelolaan" : `TAK TERLACAK (selisih ${fmt(h.extraQty)})`}
              </p>
              {h.history ? (
                h.history.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">Tidak ada transaksi pada periode ini.</p>
                ) : (
                  <ul className="mt-1 text-xs text-[var(--text-secondary)]">
                    {h.history.map((t, i) => (
                      <li key={i}>
                        {t.time.replace("T", " ").slice(0, 19)} UTC · {t.type} · {fmt(t.amount)} @ {t.price}
                      </li>
                    ))}
                  </ul>
                )
              ) : null}
              {h.status === "DI_LUAR_KELOLAAN" ? (
                <button
                  onClick={() => unmarkUnmanaged(h.asset)}
                  disabled={busy !== null}
                  className="mt-2 w-full rounded-full bg-slate-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-500 disabled:opacity-50 sm:w-auto"
                >
                  {busy === `unmark:${h.asset}` ? "Membatalkan..." : "Batalkan penandaan"}
                </button>
              ) : null}
              {h.status === "TAK_TERLACAK" ? (
                <button
                  onClick={() => markUnmanaged(h.asset, h.extraQty)}
                  disabled={busy !== null}
                  className="mt-2 w-full rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-600 disabled:opacity-50 sm:w-auto"
                >
                  {busy === `mark:${h.asset}` ? "Menandai..." : "Tandai di luar kelolaan"}
                </button>
              ) : null}
              {h.orderHistoryRaw ? (
                <p className="mt-1 text-xs text-[var(--text-secondary)] break-words">
                  Riwayat order: {JSON.stringify(h.orderHistoryRaw).slice(0, 1500)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

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
                {r.releasable ? (
                  <div className="mt-3">
                    <p className="text-xs text-amber-400">
                      Nilai ~Rp{r.valueIdr} di bawah minimum order Indodax (Rp10.000): bot tidak bisa menjualnya.
                    </p>
                    <button
                      onClick={() => release(r)}
                      disabled={busy !== null}
                      className="mt-2 w-full rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-600 disabled:opacity-50 sm:w-auto"
                    >
                      {busy === r.pair ? "Melepas..." : "Lepas dari bot (tanpa jual)"}
                    </button>
                  </div>
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
