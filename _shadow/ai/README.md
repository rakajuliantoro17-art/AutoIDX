# Shadow: ai (kerangka lifecycle/selection/runtime/training generik)

Dipindah dari `src/services/ai/` pada 2026-10-11: 75 file (~7 ribu baris), nol importer aktif. Aktif (tetap): `prediction/{predictionEngine,predictionInput,predictionModel,predictionOutput}` (AI Score di scanner + `analytics/aiCalibration`). Jalur ML nyata ada di `services/ml/*` (dataset -> trainer -> `ml_models` -> predictor -> shadow scoring).

| Kelompok | Alasan |
|---|---|
| `lifecycle/*`, `selection/*`, `runtime/*` | registri/pemilih model in-memory; versi & model aktif sudah di `ml/storage/modelStore` (Firestore) |
| `training/*` (dataset, pipeline, training) | duplikat `ml/dataset` + `ml/models/trainer`; training berat harus offline (GitHub Actions), bukan Vercel. Satu-satunya ide yang diambil: **split kronologis** (`datasetSplit`) -> kini default di `ml/models/trainer` |
| `evaluation/*` | penilaian prediksi vs hasil sudah dibangun di `ml/shadow/scoring` (LabelingEngine + ModelEvaluator + baseline) |
| `features/*` | duplikat `ml/features` (scaler/statistics/vectorizer) |
| `decision/*`, `optimizer/*`, `pipeline/*` | belum ada bukti nilai tambah model; peta Fase 5: TAHAN sampai verdict shadow `MENGALAHKAN_BASELINE` + persetujuan |
| `aiManager`, `aiRegistry`, `aiContext`, `index`, `prediction/{predictionManager,predictionContext}` | fasad di atas modul di atas |

## Syarat aktif kembali
Verdict `ml_shadow_scores/summary` = `MENGALAHKAN_BASELINE` pada >=200 prediksi ternilai, lalu persetujuan eksplisit sebelum menyambung ke keputusan order. Satu jalur: pasang di atas `services/ml`, bukan mesin kedua.

## Catatan 2026-10-11 (integrasi LLM)
Provider LLM aktif ada di `services/intelligence/ai/*` (OpenAI, Gemini, Claude, DeepSeek + konsensus), dipanggil dari `trading/engine.ts` sebagai advisory. Kini tiap saran LLM + konsensus ikut dinilai shadow (flag `aiShadowPrediction`, sumber `llm:*`), rapor di ML Lab dan `GET /api/ai/performance`. Kerangka di folder ini tetap shadow.
