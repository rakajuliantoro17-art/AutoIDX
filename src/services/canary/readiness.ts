/**
 * Pemeriksaan kesiapan canary (fungsi murni). Menilai apakah BUY live pertama
 * AKAN lolos semua gerbang, sebelum canary dimulai. Tidak pernah mengirim order.
 */
export type CheckStatus = "pass" | "fail" | "warn";

export interface ReadinessCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface ReadinessInput {
  mode: "paper" | "live";
  liveConfirm: boolean;
  emergencyStop: boolean;
  canaryEnabled: boolean;
  canaryOnly: boolean;
  canaryMaxTradeAmount: number;
  canaryMaxOpenOrders: number;
  tradeAmountIdr: number;
  maxOpenPositions: number;
  maxExposurePercent: number;
  absoluteMaxExposurePercent: number;
  portfolioExposureLimitOn: boolean;
  minOrderValue: number;
  idrBalance: number | null;
  balanceError?: string;
  hasActiveAccount: boolean;
  reconcile: { consistent: boolean; checkedAt: number; mismatchCount: number } | null;
  reconcileMaxAgeMs: number;
  uncertainLocks: number;
  openPositions: number;
  now: number;
}

const idr = (n: number) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;

export function evaluateCanaryReadiness(i: ReadinessInput): { ready: boolean; checks: ReadinessCheck[] } {
  const c: ReadinessCheck[] = [];
  const add = (id: string, label: string, status: CheckStatus, detail: string) => c.push({ id, label, status, detail });

  add("account", "Akun Indodax aktif", i.hasActiveAccount ? "pass" : "fail",
    i.hasActiveAccount ? "Ada satu akun aktif." : "Tidak ada akun aktif; BUY tidak bisa dikirim.");

  add("emergency", "Emergency stop", i.emergencyStop ? "fail" : "pass",
    i.emergencyStop ? "Emergency stop MENYALA; BUY diblokir." : "Mati.");

  add("canaryEnabled", "Gerbang canary (BOT_CANARY_ENABLED)", i.canaryEnabled ? "pass" : "fail",
    i.canaryEnabled ? "Aktif." : "Belum 'true' di Vercel; setiap live BUY ditolak.");

  add("canaryAmount", "Batas nominal canary", i.tradeAmountIdr <= i.canaryMaxTradeAmount || !i.canaryOnly ? "pass" : "fail",
    `Nominal ${idr(i.tradeAmountIdr)} vs batas canary ${idr(i.canaryMaxTradeAmount)}.`);

  add("minOrder", "Nominal >= minimum order", i.tradeAmountIdr >= i.minOrderValue ? "pass" : "fail",
    `Nominal ${idr(i.tradeAmountIdr)}, minimum ${idr(i.minOrderValue)}.`);

  add("positions", "Batas posisi bersamaan", i.maxOpenPositions === 1 ? "pass" : "warn",
    `Settings ${i.maxOpenPositions}; gerbang canary mengikuti Settings (env BOT_CANARY_MAX_OPEN_ORDERS=${i.canaryMaxOpenOrders} hanya cadangan). Disarankan 1 sampai canary lolos.`);

  if (i.idrBalance === null) {
    add("balance", "Saldo Indodax", "fail", `Gagal membaca saldo: ${i.balanceError ?? "tidak diketahui"}.`);
  } else {
    add("balance", "Saldo cukup untuk order", i.idrBalance >= i.tradeAmountIdr ? "pass" : "fail",
      `Saldo ${idr(i.idrBalance)}, order ${idr(i.tradeAmountIdr)}.`);

    const cap = Math.min(i.maxExposurePercent, i.absoluteMaxExposurePercent);
    const limit = (cap / 100) * i.idrBalance;
    const needEquity = i.tradeAmountIdr / (cap / 100);
    add("exposure", "Batas exposure per trade", i.tradeAmountIdr <= limit ? "pass" : "fail",
      i.tradeAmountIdr <= limit
        ? `Batas ${cap}% dari ${idr(i.idrBalance)} = ${idr(limit)}; order muat.`
        : `Batas ${cap}% dari ${idr(i.idrBalance)} = ${idr(limit)} < order ${idr(i.tradeAmountIdr)}. Butuh saldo minimal ${idr(needEquity)}.`);

    if (i.portfolioExposureLimitOn) {
      const after = ((i.tradeAmountIdr) / i.idrBalance) * 100;
      add("exposureTotal", "Batas exposure total (flag aktif)", after <= i.absoluteMaxExposurePercent ? "pass" : "fail",
        `Setelah order exposure ${after.toFixed(1)}% (batas ${i.absoluteMaxExposurePercent}%).`);
    }
  }

  if (!i.reconcile) {
    add("reconcile", "Rekonsiliasi segar", "fail", "Belum pernah ada hasil; BUY ditolak.");
  } else {
    const age = i.now - i.reconcile.checkedAt;
    const fresh = age <= i.reconcileMaxAgeMs;
    const ok = fresh && i.reconcile.consistent;
    add("reconcile", "Rekonsiliasi segar & konsisten", ok ? "pass" : "fail",
      `${Math.round(age / 60000)} menit lalu, ${i.reconcile.consistent ? "konsisten" : `${i.reconcile.mismatchCount} mismatch`}. Batas umur ${Math.round(i.reconcileMaxAgeMs / 60000)} menit.`);
  }

  add("locks", "Tidak ada order UNCERTAIN", i.uncertainLocks === 0 ? "pass" : "fail",
    i.uncertainLocks === 0 ? "Bersih." : `${i.uncertainLocks} order tak pasti menahan BUY.`);

  add("openPositions", "Tidak ada posisi nyangkut", i.openPositions === 0 ? "pass" : "warn",
    `${i.openPositions} posisi terbuka tercatat.`);

  add("liveConfirm", "BOT_LIVE_CONFIRM", i.liveConfirm ? "pass" : "warn",
    i.liveConfirm ? "true." : "Belum true; wajib saat benar-benar pindah ke Live.");

  add("mode", "Mode bot", i.mode === "live" ? "pass" : "warn",
    i.mode === "live" ? "Live." : "Masih Paper (benar selama soak). Pindah ke Live hanya saat canary dimulai.");

  return { ready: c.every((x) => x.status !== "fail"), checks: c };
}
