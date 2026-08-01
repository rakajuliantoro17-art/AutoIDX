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

import { adminDb } from "./admin";
import { FieldValue } from "firebase-admin/firestore";
import { BotSettings } from "@/api/settings/types";
import { DEFAULT_SETTINGS } from "@/api/settings/defaults";

const SETTINGS_COLLECTION = "bot_settings";
const SETTINGS_DOC_ID = "default";

export async function getBotSettings(): Promise<BotSettings> {

  try {

    const ref =
      adminDb.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID);

    const snapshot = await ref.get();

    if (snapshot.exists) {
      return {
        ...DEFAULT_SETTINGS,
        ...snapshot.data(),
      } as BotSettings;
    }

    await ref.set(DEFAULT_SETTINGS);

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

    return true;

  } catch (error) {

    console.error("[BOT SETTINGS UPDATE ERROR]", error);

    return false;

  }

}
