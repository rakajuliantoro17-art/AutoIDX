import { DEFAULT_SETTINGS } from "./defaults";
import { BotSettings } from "./types";

import {
  getBotSettings,
  updateBotSettings,
} from "@/services/firebase/settingsService";

/**
 * v0.1.0 - Membaca dari Firestore (dengan fallback ke default
 * kalau Firestore gagal/belum ada data).
 */
export async function getSettings(): Promise<BotSettings> {

  return getBotSettings();

}

/**
 * Menyimpan perubahan settings ke Firestore. Hanya field yang
 * dikirim yang di-update (partial/merge), field lain tetap.
 */
export async function saveSettings(
  partial: Partial<BotSettings>
): Promise<BotSettings> {

  await updateBotSettings(partial);

  return getBotSettings();

}

export { DEFAULT_SETTINGS };
