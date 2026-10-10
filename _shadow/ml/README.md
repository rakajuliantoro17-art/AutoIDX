# Shadow: ml (orphan yang belum dipakai)

Dipindah dari `src/services/ml/` pada 2026-10-10 (nol importer aktif). `services/ml/` kini 0 orphan.

## Yang DIINTEGRASIKAN (tetap di `src/services/ml/`)
- `labeling/engine.ts` + `models/evaluator.ts` -> dipakai `ml/shadow/scoring.ts`: menilai prediksi model terhadap harga nyata (definisi label sama dengan training: 10 candle 1h, ±2%).
- `ml/shadow/shadowStore.ts` (baru): catat prediksi per siklus scan (flag `aiShadowPrediction`) dan nilai yang jatuh tempo dari `/api/cron/reconcile`. Hasil di Firestore `ml_shadow_predictions` dan `ml_shadow_scores/summary` (verdict: DATA_KURANG / BELUM_MENGALAHKAN_BASELINE / MENGALAHKAN_BASELINE; baseline = tebak kelas mayoritas + rata-rata return).

## Yang DISIMPAN di sini dan alasannya
| File | Alasan |
|---|---|
| `manager.ts`, `pipeline.ts`, `index.ts` | placeholder ("Phase 7 placeholder"), prediksi HOLD tetap; state in-memory tidak bertahan di Vercel |
| `models/registry.ts`, `storage/loader.ts`, `storage/archive.ts` | daftar in-memory; versi model sudah disimpan `storage/modelStore` (`ml_models/history_*`) |
| `labeling/{outcome,rules,strategies,validator}.ts` | implementasi nyata, tapi training aktif memakai `DatasetBuilder` yang sudah teruji; `TripleBarrierStrategy` layak dicoba bila label ±2% terbukti buruk |
| `features/{encoder,normalizer,selector}.ts` | `scaler.ts` aktif sudah menormalisasi; `selector` berguna kalau fitur bertambah |
| `*/index.ts` | barrel |

## Syarat aktif kembali
Verdict shadow `MENGALAHKAN_BASELINE` pada >=30 prediksi ternilai (idealnya >=200), lalu satu perubahan per langkah dan uji ulang. Gerbang order berbasis ML butuh persetujuan terpisah (lihat `docs/ai-ml-integration-map.md`, Fase 5).
