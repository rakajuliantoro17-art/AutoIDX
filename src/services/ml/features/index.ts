/**
==========================================================
AURA Trade OS
ML Feature Engineering Module
Version : 0.2.0 Alpha

Perubahan dari 0.1.0: barrel dilengkapi -- sebelumnya cuma
re-export `encoder.ts`, padahal 5 file lain di folder ini
(`vectorizer.ts`, `scaler.ts`, `statistics.ts`, `normalizer.ts`,
`selector.ts`) sudah ada tapi harus diimpor manual per-file
(`../features/vectorizer` dst, lihat models/trainer.ts). Barrel
ini SEKARANG mencakup semuanya supaya konsisten -- TIDAK mengubah
perilaku/reachability apapun (trainer.ts/predictor.ts tetap impor
langsung per-file, sengaja tidak diubah ke barrel supaya diff
minimal). `vectorizer`/`scaler` REACHABLE dari live path (dipakai
trainer.ts/predictor.ts). `statistics` REACHABLE (dipakai
trainer.ts). `normalizer`/`selector` MASIH orphan -- diekspor di
sini cuma supaya gampang ditemukan/diimpor kalau ada use-case
konkret nanti, bukan berarti sudah tersambung ke jalur training.
==========================================================
*/


/**
 * Feature Encoder
 *
 * Orphan disengaja (Session Log 17) -- dataset/collector.ts cuma
 * menghasilkan fitur numerik, tidak ada sumber kategorikal untuk
 * dienkode. Lihat docs/claude.md Session Log 17 untuk detail.
 */

export {

  default as featureEncoder,

  FeatureEncoder

} from "./encoder";

export type {

  EncodingMethod,

  EncodedFeature

} from "./encoder";


/**
 * Feature Vectorizer
 *
 * AKTIF -- dipakai models/trainer.ts untuk membangun feature
 * matrix dari objek fitur bernama.
 */

export {

  default as featureVectorizer,

  FeatureVectorizer

} from "./vectorizer";

export type {

  VectorSchema,

  VectorResult

} from "./vectorizer";


/**
 * Feature Scaler
 *
 * AKTIF -- dipakai models/trainer.ts (normalisasi saat training)
 * dan models/predictor.ts (baca scalingMethod untuk inverse-
 * transform saat inference).
 */

export {

  default as featureScaler,

  FeatureScaler

} from "./scaler";

export type {

  ScalingMethod,

  ScalingResult

} from "./scaler";


/**
 * Feature Statistics
 *
 * AKTIF -- dipakai models/trainer.ts untuk mean/std/min/max per
 * fitur + featureWarnings (BAD/WARNING quality flag).
 */

export {

  default as featureStatistics,

  FeatureStatisticsEngine

} from "./statistics";

export type {

  FeatureStatistics,

  FeatureReport

} from "./statistics";


/**
 * Feature Normalizer
 *
 * ORPHAN -- L2/Z-score/unit vector normalization, TIDAK dipakai
 * jalur training manapun (trainer.ts pakai FeatureScaler, bukan
 * ini, untuk normalisasi per-kolom). Berbeda dari FeatureScaler:
 * ini menormalisasi SATU vector fitur relatif terhadap dirinya
 * sendiri (mis. L2 norm = 1), bukan per-kolom lintas dataset.
 * Belum ada use-case konkret yang diverifikasi butuh ini.
 */

export {

  default as featureNormalizer,

  FeatureNormalizer

} from "./normalizer";

export type {

  NormalizationMethod,

  NormalizationResult

} from "./normalizer";


/**
 * Feature Selector
 *
 * ORPHAN -- seleksi fitur (MANUAL/VARIANCE/CORRELATION/IMPORTANCE),
 * TIDAK dipakai jalur training manapun. Mengaktifkannya akan
 * mengubah featureOrder/jumlah dimensi model -- keputusan produk
 * serupa encoder.ts (lihat docs/claude.md Session Log 17), sengaja
 * tidak diintegrasikan sepihak.
 */

export {

  default as featureSelector,

  FeatureSelector

} from "./selector";

export type {

  SelectionMethod,

  FeatureScore,

  SelectionResult

} from "./selector";
