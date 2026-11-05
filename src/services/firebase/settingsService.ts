/**
==========================================================
AURA Trade OS
Firebase Bot Settings Manager
Version : 0.1.0 Alpha

Menyimpan pengaturan bot (trade amount, stop loss, take profit,
dll) ke Firestore, supaya bisa diubah dari dashboard TANPA
perlu ganti Environment Variable + redeploy.
==========================================================
*/

import { getCached, setCached, invalidateCached } from "@/services/firebase/ttlCache";
import { adminDb } from "./admin";
import { FieldValue } from "firebase-admin/firestore";
import { BotSettings } from "@/api/settings/types";
import { DEFAULT_SETTINGS } from "@/api/settings/defaults";

const SETTINGS_COLLECTION = "bot_settings";
const SETTINGS_DOC_ID = "default";

const SETTINGS_CACHE_KEY = "bot_settings";
export const SETTINGS_CACHE_TTL_MS = 15_000;

export async function getBotSettings(): Promise<BotSettings> {

  const cached = getCached<BotSettings>(SETTINGS_CACHE_KEY, SETTINGS_CACHE_TTL_MS);

  if (cached) return cached;

  try {

    const ref =
      adminDb.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID);

    const snapshot = await ref.get();

    if (snapshot.exists) {
      const loaded = {
        ...DEFAULT_SETTINGS,
        ...snapshot.data(),
      } as BotSettings;
      setCached(SETTINGS_CACHE_KEY, loaded);
      return loaded;
    }

    await ref.set(DEFAULT_SETTINGS);

    setCached(SETTINGS_CACHE_KEY, DEFAULT_SETTINGS);

    return DEFAULT_SETTINGS;

  } catch (error) {

    console.error("[BOT SETTINGS GET ERROR]", error);

    // Kalau Firestore gagal, tetap kembalikan default supaya
    // bot tidak berhenti berfungsi.
    return DEFAULT_SETTINGS;

  }

}

export async function updateBotSettings(
  partial: Partial<BotSettings>
): Promise<boolean> {

  try {

    const ref =
      adminDb.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID);

    await ref.set(
      {
        ...partial,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    invalidateCached(SETTINGS_CACHE_KEY);

    return true;

  } catch (error) {

    console.error("[BOT SETTINGS UPDATE ERROR]", error);

    return false;

  }

}
