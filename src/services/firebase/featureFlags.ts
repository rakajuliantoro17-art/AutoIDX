/**
==========================================================
AURA Trade OS
Feature Flags (Firestore, server-only)
==========================================================
Saklar fitur yang bisa diubah dari Firestore TANPA redeploy:
dokumen `bot_control/flags`, berisi pasangan { namaFlag: boolean }.

Aturan keselamatan:
- Default SEMUA flag = false (fail-closed). Dokumen tidak ada,
  Firestore error, atau nilai bukan boolean -> flag mati.
- Hanya nama flag yang terdaftar di FEATURE_FLAG_DEFAULTS yang
  dibaca; field lain di dokumen diabaikan.
- Hanya MEMBACA (tidak pernah menulis/seed dokumen).
- Cache memori per instance dengan TTL pendek (hemat read
  Firestore; maksimal 1 read per TTL per instance). Di serverless
  cache bisa hilang tiap cold start -- tidak masalah, hanya
  menambah satu read.
- Flag TIDAK boleh dipakai untuk melonggarkan gate live trading
  (mode live + BOT_LIVE_CONFIRM). Hanya untuk fitur observasional
  /shadow.
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";

/** Daftar flag resmi beserta default (semua mati). */
export const FEATURE_FLAG_DEFAULTS = {
  /** Fase 3 AI/ML: catat prediksi shadow tiap siklus scan. */
  aiShadowPrediction: false,
  /** Fase 1 AI/ML: bangun label/fitur lanjutan saat membuat dataset. */
  aiAdvancedLabeling: false,
  /** Jalur event/notification terpisah (messaging) -- belum aktif. */
  eventBus: false,
  /**
   * Take-profit TETAP per posisi (persen dari harga beli, 1-5%) memakai
   * nilai slider Take Profit; stop-loss tetap berbasis ATR. Mati =
   * perilaku lama (TP = rasio TP/SL x lebar SL ATR).
   */
  fixedTakeProfit: false,
  /**
   * Cron reconcile otomatis meresolve lock order UNCERTAIN bila riwayat
   * trade DAN open order Indodax membuktikan order tidak pernah
   * tereksekusi (selain itu: tandai review manual). Mati = lock UNCERTAIN
   * tetap menahan pair+side sampai di-resolve manual.
   */
  uncertainOrderReconcile: false,
} as const;

export type FeatureFlagName = keyof typeof FEATURE_FLAG_DEFAULTS;
export type FeatureFlags = Record<FeatureFlagName, boolean>;

const FLAGS_COLLECTION = "bot_control";
const FLAGS_DOC_ID = "flags";

export const FEATURE_FLAGS_TTL_MS = 60_000;

/**
 * Murni: gabungkan data mentah dokumen dengan default.
 * Hanya flag terdaftar yang nilainya persis `true` yang aktif.
 */
export function resolveFeatureFlags(raw: unknown): FeatureFlags {
  const resolved: FeatureFlags = { ...FEATURE_FLAG_DEFAULTS };
  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    for (const name of Object.keys(FEATURE_FLAG_DEFAULTS) as FeatureFlagName[]) {
      if (record[name] === true) {
        resolved[name] = true;
      }
    }
  }
  return resolved;
}

let cache: { flags: FeatureFlags; expiresAt: number } | null = null;

/** Ambil semua flag (cache TTL; error -> semua mati). */
export async function getFeatureFlags(now: number = Date.now()): Promise<FeatureFlags> {
  if (cache && now < cache.expiresAt) {
    return cache.flags;
  }

  let flags: FeatureFlags;
  try {
    const snapshot = await adminDb
      .collection(FLAGS_COLLECTION)
      .doc(FLAGS_DOC_ID)
      .get();
    flags = resolveFeatureFlags(snapshot.exists ? snapshot.data() : undefined);
  } catch (error) {
    console.error("[FEATURE FLAGS GET ERROR]", error);
    flags = { ...FEATURE_FLAG_DEFAULTS };
  }

  cache = { flags, expiresAt: now + FEATURE_FLAGS_TTL_MS };
  return flags;
}

export async function isFeatureEnabled(name: FeatureFlagName): Promise<boolean> {
  return (await getFeatureFlags())[name];
}

/** Hanya untuk test. */
export function resetFeatureFlagsCache(): void {
  cache = null;
}
