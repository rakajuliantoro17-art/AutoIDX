/**
 * Batas posisi gerbang canary: ikut Settings (Max Open Position) bila valid,
 * kalau tidak jatuh ke env BOT_CANARY_MAX_OPEN_ORDERS (default 1, fail-safe).
 */
export function resolveCanaryPositionLimit(settingsLimit: number | undefined, envLimit: number): number {
  return typeof settingsLimit === "number" && Number.isFinite(settingsLimit) && settingsLimit >= 1
    ? Math.floor(settingsLimit)
    : envLimit;
}
