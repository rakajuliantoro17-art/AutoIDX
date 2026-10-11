/**
 * Widget kecil di sidebar: kinerja para agen (ML + ChatGPT/Gemini/Claude/
 * DeepSeek + konsensus) seperti statistik ringkas. Garis tipis pada batang =
 * baseline; batang di kanan garis berarti unggul. Klik -> halaman Agen.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/services/auth/AuthContext";

interface Summary {
  sources: Record<string, { scored: number; accuracy: number; baseline: number; verdict: string }>;
  pendingCount: number;
  lastReportMs: number | null;
  agentEnabled: boolean;
  shadowEnabled: boolean;
}

const MIN_SCORED = 30;
const ORDER = ["ml", "llm:openai", "llm:gemini", "llm:claude", "llm:deepseek", "llm:consensus"];
const NAMES: Record<string, string> = {
  ml: "ML",
  "llm:openai": "ChatGPT",
  "llm:gemini": "Gemini",
  "llm:claude": "Claude",
  "llm:deepseek": "DeepSeek",
  "llm:consensus": "Konsensus",
};

function ago(ms: number | null): string {
  if (!ms) return "belum ada laporan";
  const m = Math.max(0, Math.round((Date.now() - ms) / 60000));
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h} jam lalu` : `${Math.round(h / 24)} hari lalu`;
}

export default function AgentSidebarWidget() {
  const { user } = useAuth();
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    if (!user) {
      setData(null);
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const token = await user!.getIdToken();
        const r = await fetch("/api/agent/summary", { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) return;
        const j = (await r.json()) as Summary;
        if (!cancelled) setData(j);
      } catch {
        /* widget bersifat pelengkap; diam bila gagal */
      }
    }
    load();
    const t = setInterval(load, 120_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [user]);

  if (!user || !data) return null;

  const keys = ORDER.filter((k) => data.sources[k]);

  return (
    <Link
      href="/dashboard/agent"
      className="block rounded-[var(--radius-md)] border border-[var(--border)] p-3 transition hover:bg-[var(--surface-hover)]"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Kinerja Agen</span>
        {data.pendingCount > 0 && (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400">
            {data.pendingCount} usulan
          </span>
        )}
      </div>

      {keys.length === 0 ? (
        <p className="text-[11px] text-[var(--text-muted)]">
          {data.shadowEnabled ? "Menunggu prediksi ternilai..." : "Penilaian AI belum aktif (flag aiShadowPrediction)."}
        </p>
      ) : (
        <div className="space-y-1.5">
          {keys.map((k) => {
            const s = data.sources[k];
            const ready = s.scored >= MIN_SCORED;
            const win = ready && s.accuracy > s.baseline;
            return (
              <div key={k}>
                <div className="flex justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>{NAMES[k] ?? k}</span>
                  <span>{ready ? `${Math.round(s.accuracy * 100)}%` : `${s.scored}/${MIN_SCORED}`}</span>
                </div>
                <div className="relative h-1.5 rounded bg-white/10">
                  <div
                    className={`h-full rounded ${ready ? (win ? "bg-emerald-400" : "bg-rose-400") : "bg-sky-400/50"}`}
                    style={{ width: `${Math.min(100, Math.round((ready ? s.accuracy : s.scored / MIN_SCORED) * 100))}%` }}
                  />
                  {ready && (
                    <span
                      className="absolute top-[-2px] h-[10px] w-px bg-[var(--text-secondary)]"
                      style={{ left: `${Math.min(100, Math.round(s.baseline * 100))}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-2 text-[10px] text-[var(--text-muted)]">
        Laporan: {data.agentEnabled ? ago(data.lastReportMs) : "agen nonaktif"}
      </p>
    </Link>
  );
}
