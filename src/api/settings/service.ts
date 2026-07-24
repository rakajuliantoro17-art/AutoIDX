import { DEFAULT_SETTINGS } from "./defaults";
import { BotSettings } from "./types";

/**
 * v0.0.1
 * Masih menggunakan default.
 * v0.1.0 akan membaca dari Firebase.
 */

export async function getSettings(): Promise<BotSettings> {

    return DEFAULT_SETTINGS;

}
