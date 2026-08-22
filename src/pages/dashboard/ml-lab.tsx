/**
==========================================================
AURA Trade OS
ML Lab (Eksperimental)
Version : 0.1.0 Alpha

Halaman ini SENGAJA dibuat supaya training & prediksi ML bisa
dicoba tanpa perlu buka browser console / paste kode manual -
cukup login normal di aplikasi ini, lalu klik tombol.

Prediksi di sini ADVISORY ONLY - tidak dipakai eksekusi order
otomatis manapun. Lihat docs/claude.md, "Update: Implementasi
ML Nyata", untuk detail & alasan.
==========================================================
*/
"use client";

import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/services/auth/AuthContext";
import { formatIDR } from "@/utils";

const DEFAULT_PAIRS = ["btc_idr", "eth_idr", "sol_idr", "xrp_idr", "ada_idr"];

interface TrainResponse {
  success?: boolean;
  error?: string;
  modelId?: string;
  datasetSize?: number;
  labeledSamples?: number;
  failedPairs?: string[];
  trainedSamples?: number;
  validationSamples?: number;
  durationMs?: number;
  finalTrainLoss?: number;
  validationMetrics?: {
    accuracy: number;
    perClass: Record<
      string,
      { precision: number; recall: number; f1: number; support: number }
    >;
    confusionMatrix: number[][];
  };
}

interface PredictResponse {
  error?: string;
  pair?: string;
  price?: number;
  candleTime?: string;
  prediction?: {
    label: string;
    confidence: number;
    probabilities: Record<string, number>;
  };
  model?: {
    id: string;
    trainedAt: string;
    validationAccuracy: number;
  };
  note?: string;
}

function pct(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n)) return "-";
  return `${(n * 100).toFixed(1)}%`;
}

export default function MlLabPage() {
  const { user, loading: authLoading } = useAuth();

  const [pairs, setPairs] = useState(DEFAULT_PAIRS.join(","));
  const [predictPair, setPredictPair] = useState("btc_idr");

  const [training, setTraining] = useState(false);
  const [predicting, setPredicting] = useState(false);

  const [trainResult, setTrainResult] = useState<TrainResponse | null>(null);
  const [predictResult, setPredictResult] = useState<PredictResponse | null>(null);
  const [trainErrorRaw, setTrainErrorRaw] = useState<string | null>(null);
  const [predictErrorRaw, setPredictErrorRaw] = useState<string | null>(null);

  async function handleTrain() {
    if (!user) return;

    setTraining(true);
    setTrainResult(null);
    setTrainErrorRaw(null);

    try {
      const idToken = await user.getIdToken();
      const pairList = pairs
        .split(",")
        .map((p) => p.trim().toLowerCase())
        .filter(Boolean);

      const res = await fetch("/api/ml/train", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ pairs: pairList }),
      });

      const data: TrainResponse = await res.json();

      if (!res.ok) {
        setTrainErrorRaw(data.error ?? `HTTP ${res.status}`);
      } else {
        setTrainResult(data);
      }
    } catch (err: any) {
      setTrainErrorRaw(err?.message ?? "Gagal memanggil /api/ml/train");
    } finally {
      setTraining(false);
    }
  }

  async function handlePredict() {
    if (!user) return;

    setPredicting(true);
    setPredictResult(null);
    setPredictErrorRaw(null);

    try {
      const idToken = await user.getIdToken();

      const res = await fetch(
        `/api/ml/predict?pair=${encodeURIComponent(predictPair.trim().toLowerCase())}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      const data: PredictResponse = await res.json();

      if (!res.ok) {
        setPredictErrorRaw(data.error ?? `HTTP ${res.status}`);
      } else {
        setPredictResult(data);
      }
    } catch (err: any) {
      setPredictErrorRaw(err?.message ?? "Gagal memanggil /api/ml/predict");
    } finally {
      setPredicting(false);
    }
  }

  if (authLoading) {
    return (
      <DashboardLayout>
        <p className="text-slate-400">Memuat...</p>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <p className="text-slate-400">
          Silakan login dulu untuk memakai ML Lab.
        </p>
      </DashboardLayout>
    );
  }

  const accuracy = trainResult?.validationMetrics?.accuracy;
  const randomBaseline =
    trainResult?.validationMetrics?.perClass
      ? 1 / Object.keys(trainResult.validationMetrics.perClass).length
      : undefined;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">ML Lab (Eksperimental)</h1>
          <p className="text-sm text-slate-400 mt-1">
            Advisory only — belum disambungkan ke eksekusi order otomatis.
            Halaman ini untuk melatih & mengevaluasi model secara transparan
            sebelum ada keputusan menyambungkannya ke live trading.
          </p>
        </div>

        {/* ============ TRAINING ============ */}
        <div className="card space-y-3">
          <h2 className="font-bold">1. Latih Model</h2>

          <label className="block text-sm text-slate-400">
            Pair (pisah koma)
            <input
              className="mt-1 w-full rounded bg-slate-800 px-3 py-2 text-sm"
              value={pairs}
              onChange={(e) => setPairs(e.target.value)}
              disabled={training}
            />
          </label>

          <button
            onClick={handleTrain}
            disabled={training}
            className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {training ? "Melatih model... (bisa 10-60 detik)" : "Mulai Training"}
          </button>

          {trainErrorRaw && (
            <div className="rounded bg-red-950 border border-red-800 p-3 text-sm text-red-300">
              Gagal: {trainErrorRaw}
            </div>
          )}

          {trainResult?.success && trainResult.validationMetrics && (
            <div className="rounded bg-slate-800 p-3 text-sm space-y-2">
              <p>
                Model ID: <span className="text-slate-300">{trainResult.modelId}</span>
              </p>
              <p>
                Sample training: {trainResult.trainedSamples} / validasi:{" "}
                {trainResult.validationSamples}
              </p>
              <p className="text-base">
                Akurasi validasi:{" "}
                <span
                  className={
                    accuracy !== undefined && randomBaseline !== undefined && accuracy > randomBaseline + 0.1
                      ? "text-emerald-400 font-bold"
                      : "text-amber-400 font-bold"
                  }
                >
                  {pct(accuracy)}
                </span>{" "}
                <span className="text-slate-500">
                  (baseline tebak-acak ~{pct(randomBaseline)})
                </span>
              </p>
              {accuracy !== undefined &&
                randomBaseline !== undefined &&
                accuracy <= randomBaseline + 0.1 && (
                  <p className="text-amber-400 text-xs">
                    ⚠️ Akurasi dekat/di bawah tebak-acak — model ini belum
                    belajar pola yang berguna. Jangan dipakai sebagai dasar
                    keputusan apapun dulu.
                  </p>
                )}

              <details>
                <summary className="cursor-pointer text-slate-400">
                  Detail per kelas
                </summary>
                <table className="mt-2 w-full text-xs">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="text-left">Kelas</th>
                      <th>Precision</th>
                      <th>Recall</th>
                      <th>F1</th>
                      <th>Support</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(trainResult.validationMetrics.perClass).map(
                      ([label, m]) => (
                        <tr key={label}>
                          <td>{label}</td>
                          <td className="text-center">{pct(m.precision)}</td>
                          <td className="text-center">{pct(m.recall)}</td>
                          <td className="text-center">{pct(m.f1)}</td>
                          <td className="text-center">{m.support}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </details>

              {trainResult.failedPairs && trainResult.failedPairs.length > 0 && (
                <p className="text-amber-400 text-xs">
                  Pair gagal ditarik: {trainResult.failedPairs.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ============ PREDICT ============ */}
        <div className="card space-y-3">
          <h2 className="font-bold">2. Coba Prediksi (Advisory Only)</h2>

          <label className="block text-sm text-slate-400">
            Pair
            <input
              className="mt-1 w-full rounded bg-slate-800 px-3 py-2 text-sm"
              value={predictPair}
              onChange={(e) => setPredictPair(e.target.value)}
              disabled={predicting}
            />
          </label>

          <button
            onClick={handlePredict}
            disabled={predicting}
            className="rounded bg-sky-600 px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {predicting ? "Memprediksi..." : "Prediksi"}
          </button>

          {predictErrorRaw && (
            <div className="rounded bg-red-950 border border-red-800 p-3 text-sm text-red-300">
              Gagal: {predictErrorRaw}
              {predictErrorRaw.includes("Belum ada model ML") && (
                <p className="mt-1 text-slate-400">
                  Latih model dulu di bagian atas sebelum mencoba prediksi.
                </p>
              )}
            </div>
          )}

          {predictResult?.prediction && (
            <div className="rounded bg-slate-800 p-3 text-sm space-y-2">
              <p className="text-base">
                Sinyal:{" "}
                <span className="font-bold text-slate-200">
                  {predictResult.prediction.label}
                </span>{" "}
                (confidence {pct(predictResult.prediction.confidence)})
              </p>
              <p className="text-slate-400 text-xs">
                Harga saat ini: {formatIDR(predictResult.price ?? 0)} • Candle:{" "}
                {predictResult.candleTime}
              </p>
              <p className="text-slate-400 text-xs">
                Model dilatih: {predictResult.model?.trainedAt} • Akurasi validasi model:{" "}
                {pct(predictResult.model?.validationAccuracy)}
              </p>
              <p className="text-amber-400 text-xs">{predictResult.note}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
