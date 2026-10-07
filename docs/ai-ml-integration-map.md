# Peta Integrasi AI/ML — AutoIDX (Fase 0)

Tanggal: 2026-10-07. Status: **pemetaan saja, tidak ada perubahan kode/perilaku.**

## Keputusan pemilik (2026-10-07)
1. File orphan AI/ML **tidak dihapus**; disinkronkan untuk optimasi jangka panjang.
2. Urutan: **shadow mode dulu** (hanya mencatat, tidak memengaruhi BUY/SELL).
3. Training/evaluasi berat **di luar Vercel** (GitHub Actions / script manual); Vercel hanya memuat model + prediksi.
4. **Satu jalur**: yang sudah aktif di produksi menjadi dasar; modul orphan dipasang sebagai lapisan, bukan pengganti.

## Fakta hasil audit graf import (src/**, entry = pages/app/middleware)
- 113 file di `services/ai` + `services/ml`: **18 terhubung, 95 orphan (~11 ribu baris)**.
- Semua orphan murni TypeScript, **nol dependensi npm eksternal**, nol akses Firestore (kecuali `ml/storage/archive`). Aman dipasang tanpa menambah paket.
- Sudah aktif: `analytics/aiCalibration` (tiap scan), `ai/prediction/*` (engine/model/input/output), `ml/dataset/{builder,collector,...}`, `ml/features/{scaler,statistics,vectorizer}`, `ml/models/{trainer,predictor}`, `ml/storage/{modelStore,repository}`, `intelligence/ml/mlAdvisor` (advisory, non-blocking di `engine.ts`), endpoint `/api/ml/{train,predict,dataset/import}`.
- `/api/ml/predict` sudah mencatat tiap prediksi ke koleksi `ml_predictions` (observasional). Jadi pondasi shadow mode sebagian **sudah ada**, hanya belum dijalankan otomatis per siklus scan dan belum dievaluasi terhadap harga sesudahnya.
- Catatan lama (`docs/Orphanintegrationroadmap.md`): `services/ai/` ("Phase 35") adalah scaffolding model-lifecycle **generik**, risiko duplikasi tipe dengan `ml/` tinggi. Karena itu `ai/*` dipasang **selektif lewat adapter**, bukan dicolok mentah.

## Tabel keputusan per modul

| Modul orphan | File / LOC | Tumpang tindih dengan yang aktif | Keputusan | Fase |
|---|---|---|---|---|
| `ml/labeling` (engine, outcome, rules, strategies, validator) | 6 / 1795 | `DatasetBuilder.generateLabel` hanya label sederhana | **PASANG**: builder memakai LabelingEngine + LabelValidator (cegah kebocoran label) | 1 |
| `ml/features` (selector) | 1 / 282 | Tidak ada | **PASANG** untuk seleksi fitur | 1 |
| `ml/features` (normalizer, encoder) | 2 / 593 | `scaler.ts` aktif sudah menormalisasi | **EVALUASI**: pasang hanya bila ada celah, selain itu simpan | 1 |
| `ml/models` (evaluator, registry) | 2 / 380 | `modelStore` hanya simpan model aktif + riwayat | **PASANG**: registry versi + evaluator metrik | 2 |
| `ml/storage` (archive, loader) | 2 / 270 | Tidak ada | **PASANG** untuk ekspor/impor dataset ke job offline | 4 |
| `ml/manager`, `ml/pipeline`, `ml/index` | 3 / 502 | Orkestrasi belum ada | **PASANG** sebagai fasad job offline (bukan di jalur scan) | 4 |
| `ai/prediction` (manager, context) | 2 / 144 | Melengkapi modul prediksi aktif | **PASANG** | 3 |
| `ai/evaluation` | 7 / 633 | Tidak ada evaluasi prediksi vs hasil | **PASANG** untuk skor shadow: label prediksi vs harga nyata | 3 |
| `ai/lifecycle`, `ai/selection`, `ai/runtime` | 20 / 1437 | Tumpang tindih dengan `modelStore`/`predictor` | **ADAPTER** di atas `modelStore` (versi, status, pilih model terbaik) | 2 |
| `ai/features` | 7 / 727 | Tumpang tindih dengan `ml/features` | **GABUNG** lewat adapter ke `ml/features`; jangan dua jalur | 1 |
| `ai/training` (dataset, pipeline, training) | 20 / 1919 | Tumpang tindih dengan `ml/models/trainer` + `dataset` | **OFFLINE SAJA** (GitHub Actions), tidak pernah di Vercel | 4 |
| `ai/decision`, `ai/optimizer`, `ai/pipeline` | 15 / 1095 | Tidak ada | **TAHAN** sampai data shadow menunjukkan model mengalahkan baseline; butuh persetujuan | 5 |
| `ai/aiManager`, `aiRegistry`, `aiContext`, `index` | 4 / 919 | Fasad | **TERAKHIR**, setelah modul di bawahnya terhubung | 5 |

## Aturan keselamatan untuk semua fase
- Tidak ada modul AI/ML yang boleh dipanggil dari `services/execution` / `services/liveTrading` sebelum Fase 5 disetujui.
- Kode shadow di scan dibungkus try/catch, dengan batas waktu, dan tidak boleh memperlambat atau menggagalkan siklus scan.
- Beban CPU shadow diukur sebelum/sesudah (target: puluhan milidetik per siklus). Bila melebihi, kurangi jumlah pair yang diprediksi.
- Tiap fase: `npx tsc --noEmit` + `next build` lolos, commit terpisah, dicatat di `docs/claude.md`.

## Pertanyaan terbuka untuk Fase 1
- Apakah `/api/ml/train` pernah menghasilkan model aktif di Firestore (`ml_models`)? Perlu dicek di Firestore. Tanpa model aktif, shadow mode belum punya apa yang diprediksi.
- Apakah koleksi `ml_predictions` sudah berisi data? Itu bahan evaluasi pertama.
