/**
==========================================================
AURA Trade OS
Agen Operasional
==========================================================
Laporan harian 4 peran (HRD, Manajer, Trader, Analis Pair) dan usulan
yang menunggu persetujuan. Agen tidak mengubah apa pun sendiri; hanya
pemilik yang melihat tombol Setujui/Tolak.
==========================================================
*/
"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/services/auth/AuthContext";
import AiScoreboard from "@/components/AiScoreboard";

interface Section {
  role: string;
  title: string;
  lines: string[];
}
interface Report {
  dateKey: string;
  createdAtMs: number;
  sections: Section[];
  narrative: string | null;
  narrativeProvider: string | null;
}
interface Rec {
  id: string;
  role: string;
  kind: string;
  title: string;
  detail: string;
  status: "pending" | "approved" | "rejected";
  createdAtMs: number;
  decidedBy?: string;
}

const STATUS_LABEL: Record<Rec["status"], string> = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
};

export default function AgentPage() {
  const { user, loading } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [recs, setRecs] = useState<Rec[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const r = await fetch("/api/agent/report", { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error("Gagal memuat laporan agen");
      const j = await r.json();
      setReport(j.report ?? null);
      setRecs(j.recommendations ?? []);
      setIsOwner(!!j.isOwner);
      setEnabled(!!j.enabled);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function call(url: string, body?: unknown, key = "run") {
    if (!user) return;
    setBusy(key);
    try {
      const token = await user.getIdToken();
      const r = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error ?? "Gagal");
      setError(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-[var(--text-secondary)]">Memuat...</p>
      </DashboardLayout>
    );
  }
  if (!user) {
    return (
      <DashboardLayout>
        <p className="text-[var(--text-secondary)]">Silakan login dulu.</p>
      </DashboardLayout>
    );
  }

  const pending = recs.filter((r) => r.status === "pending");
  const decided = recs.filter((r) => r.status !== "pending").slice(0, 10);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Agen Operasional</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Hanya mengamati dan mengusulkan. Tidak mengubah setting, order, atau kode sendiri.
            </p>
          </div>
          {isOwner && enabled && (
            <button
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={busy === "run"}
              onClick={() => call("/api/agent/report", undefined, "run")}
            >
              {busy === "run" ? "Menjalankan..." : "Jalankan sekarang"}
            </button>
          )}
        </div>

        {!enabled && (
          <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-md px-3 py-2">
            Agen belum aktif. Nyalakan flag <code>opsAgent</code> di Firestore (bot_control/flags) dan jadwalkan
            cron harian ke <code>/api/cron/agent</code>.
          </div>
        )}
        {error && (
          <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2">{error}</div>
        )}

        {report ? (
          <>
            <div className="card space-y-2">
              <h2 className="font-bold">Ringkasan {report.dateKey}</h2>
              <p className="text-sm">
                {report.narrative ?? "Ringkasan naratif tidak tersedia (tidak ada API key AI atau panggilan gagal). Lihat rincian di bawah."}
              </p>
              {report.narrativeProvider && (
                <p className="text-xs text-[var(--text-muted)]">Ditulis oleh {report.narrativeProvider}.</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {report.sections.map((s) => (
                <div key={s.role} className="card space-y-2 min-w-0">
                  <h3 className="font-semibold">{s.title}</h3>
                  <ul className="text-sm space-y-1 list-disc pl-4 break-words">
                    {s.lines.map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">Belum ada laporan.</p>
        )}

        <AiScoreboard />

        <div className="card space-y-3">
          <h2 className="font-bold">Usulan menunggu keputusan ({pending.length})</h2>
          {pending.length === 0 && <p className="text-sm text-[var(--text-muted)]">Tidak ada usulan.</p>}
          {pending.map((r) => (
            <div key={r.id} className="border-t border-white/10 pt-3 space-y-1">
              <p className="text-xs text-[var(--text-muted)]">{r.role}</p>
              <p className="font-semibold">{r.title}</p>
              <p className="text-sm text-[var(--text-secondary)]">{r.detail}</p>
              {isOwner ? (
                <div className="flex gap-2 pt-1">
                  <button
                    className="rounded bg-emerald-500/20 text-emerald-400 px-3 py-1 text-xs disabled:opacity-50"
                    disabled={busy === r.id}
                    onClick={() => call("/api/agent/decide", { id: r.id, decision: "approve" }, r.id)}
                  >
                    {r.kind === "note" ? "Tandai dibaca" : "Setujui & terapkan"}
                  </button>
                  <button
                    className="rounded bg-rose-500/20 text-rose-400 px-3 py-1 text-xs disabled:opacity-50"
                    disabled={busy === r.id}
                    onClick={() => call("/api/agent/decide", { id: r.id, decision: "reject" }, r.id)}
                  >
                    Tolak
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">Hanya pemilik yang dapat memutuskan.</p>
              )}
            </div>
          ))}
        </div>

        {decided.length > 0 && (
          <div className="card space-y-2">
            <h2 className="font-bold">Riwayat keputusan</h2>
            {decided.map((r) => (
              <p key={r.id} className="text-sm">
                <span className="text-[var(--text-muted)]">{STATUS_LABEL[r.status]}:</span> {r.title}
              </p>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
