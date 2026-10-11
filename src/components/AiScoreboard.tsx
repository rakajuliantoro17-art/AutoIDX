/**
 * Rapor AI (shadow): akurasi tiap AI/ML vs harga nyata + pembanding baseline.
 * Data dari GET /api/ai/performance (butuh flag aiShadowPrediction aktif).
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/services/auth/AuthContext";

interface Row {
  scored: number;
  accuracy: number;
  majorityBaselineAccuracy: number;
  avgReturnWhenBuyPercent: number | null;
  verdict: string;
  note: string;
}

const NAMES: Record<string, string> = {
  ml: "ML internal",
  "llm:openai": "ChatGPT (OpenAI)",
  "llm:gemini": "Gemini",
  "llm:claude": "Claude",
  "llm:deepseek": "DeepSeek",
  "llm:consensus": "Konsensus AI",
};

const VERDICT: Record<string, string> = {
  DATA_KURANG: "Data kurang",
  BELUM_MENGALAHKAN_BASELINE: "Belum unggul",
  MENGALAHKAN_BASELINE: "Unggul",
};

export default function AiScoreboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const r = await fetch("/api/ai/performance", { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error("Gagal memuat rapor AI");
      const j = await r.json();
      const all: Record<string, Row> = { ...(j.bySource ?? {}) };
      if (j.ml && !all.ml) all.ml = j.ml;
      setRows(all);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const keys = Object.keys(rows);

  return (
    <div className="card space-y-3">
      <h2 className="font-bold">Rapor AI (shadow)</h2>
      <p className="text-xs text-[var(--text-secondary)]">
        Tiap saran dinilai terhadap harga nyata 1 jam kemudian (±2%). Hanya tercatat bila flag{" "}
        <code>aiShadowPrediction</code> menyala. Tidak mempengaruhi order.
      </p>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {!error && keys.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">Belum ada prediksi ternilai.</p>
      )}
      {keys.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--text-muted)]">
                <th className="py-1 pr-3">Sumber</th>
                <th className="pr-3">Ternilai</th>
                <th className="pr-3">Akurasi</th>
                <th className="pr-3">Baseline</th>
                <th className="pr-3">Rata2 BUY</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => {
                const r = rows[k];
                return (
                  <tr key={k} className="border-t border-white/10">
                    <td className="py-1.5 pr-3">{NAMES[k] ?? k}</td>
                    <td className="pr-3">{r.scored}</td>
                    <td className="pr-3">{(r.accuracy * 100).toFixed(0)}%</td>
                    <td className="pr-3">{(r.majorityBaselineAccuracy * 100).toFixed(0)}%</td>
                    <td className="pr-3">
                      {r.avgReturnWhenBuyPercent == null ? "-" : `${r.avgReturnWhenBuyPercent.toFixed(2)}%`}
                    </td>
                    <td>{VERDICT[r.verdict] ?? r.verdict}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
