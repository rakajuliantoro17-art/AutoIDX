/**
 * Panel flag fitur (ramah HP). Semua orang yang login bisa melihat;
 * hanya pemilik (BOT_OWNER_UID) yang bisa mengubah. Perubahan tercatat
 * di audit_logs dan berlaku <= 60 detik.
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/services/auth/AuthContext";

const INFO: { name: string; title: string; desc: string; risk: "aman" | "ubah perilaku" }[] = [
  { name: "aiShadowPrediction", title: "Penilaian AI & ML (shadow)", desc: "Mencatat saran ML/ChatGPT/Gemini/Claude lalu menilainya. Tidak mempengaruhi order.", risk: "aman" },
  { name: "opsAgent", title: "Agen operasional", desc: "Laporan harian & usulan (menunggu persetujuan Anda). Perlu cron ke /api/cron/agent.", risk: "aman" },
  { name: "logRetention", title: "Hapus log lama", desc: "Menghapus activity log lebih dari 30 hari agar kuota Firestore hemat.", risk: "aman" },
  { name: "uncertainOrderReconcile", title: "Cek ulang order live tak pasti", desc: "Memeriksa ulang order live yang statusnya belum jelas.", risk: "aman" },
  { name: "fixedTakeProfit", title: "Take profit tetap", desc: "TP memakai angka slider apa adanya (bukan hasil ATR x rasio).", risk: "ubah perilaku" },
  { name: "portfolioExposureLimit", title: "Batas total eksposur", desc: "BUY ditolak bila total semua posisi melewati batas eksposur.", risk: "ubah perilaku" },
  { name: "watchlistOnly", title: "Hanya watchlist (10 pair)", desc: "Bot hanya memproses watchlist tetap + posisi terbuka; kandidat scanner hanya dipantau, tidak dieksekusi. Matikan untuk memperluas.", risk: "ubah perilaku" },
  { name: "trailingStop", title: "Trailing stop", desc: "Stop-loss naik mengikuti harga. Juga butuh env TRAILING_STOP_ENABLED=true.", risk: "ubah perilaku" },
];

export default function FeatureFlagsPanel() {
  const { user } = useAuth();
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const r = await fetch("/api/flags", { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error("Gagal memuat flag");
      const j = await r.json();
      setFlags(j.flags ?? {});
      setIsOwner(!!j.isOwner);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(name: string, title: string, risk: string) {
    if (!user || !isOwner) return;
    const next = !flags[name];
    if (next && risk === "ubah perilaku" && !window.confirm(`Nyalakan "${title}"? Ini mengubah perilaku trading. Pastikan sudah diuji di mode paper.`)) {
      return;
    }
    setBusy(name);
    try {
      const token = await user.getIdToken();
      const r = await fetch("/api/flags", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name, value: next }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error ?? "Gagal");
      setFlags((f) => ({ ...f, [name]: next }));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  if (!user) return null;

  return (
    <div className="card space-y-3">
      <div>
        <h2 className="text-xl font-semibold">Flag Fitur</h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Berlaku maksimal 60 detik. Flag tidak bisa melonggarkan gerbang live.
          {!isOwner && " Hanya pemilik yang dapat mengubah."}
        </p>
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {INFO.map((f) => {
        const on = !!flags[f.name];
        return (
          <div key={f.name} className="flex items-start justify-between gap-3 border-t border-white/10 pt-3">
            <div className="min-w-0">
              <p className="font-semibold text-sm">
                {f.title}{" "}
                <span className={`text-[10px] ${f.risk === "aman" ? "text-emerald-400" : "text-amber-400"}`}>({f.risk})</span>
              </p>
              <p className="text-xs text-[var(--text-secondary)]">{f.desc}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={f.title}
              disabled={!isOwner || busy === f.name}
              onClick={() => toggle(f.name, f.title, f.risk)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50 ${on ? "bg-emerald-500" : "bg-white/20"}`}
            >
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
