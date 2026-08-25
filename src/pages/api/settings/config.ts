/**
==========================================================
AURA Trade OS
Settings: Runtime Config Summary API (Server-side)
Version : 0.1.0 Alpha

Mengembalikan config yang BENAR-BENAR dipakai sistem saat ini
(RISK_CONFIG/BOT_CONFIG/TRADING_CONFIG, dibaca dari env var saat
deploy, plus bot_control yang real-time dari dashboard) --
sebelumnya src/pages/dashboard/settings.tsx pakai object hardcode
yang bahkan NILAINYA SALAH (stopLoss:2 padahal RISK_CONFIG.
stopLossPercent default 1, pairs hardcode BTC/ETH/SOL padahal
env BOT_PAIRS bisa beda).

CATATAN: stopLossPercent/targetProfitPercent di sini adalah angka
SL/TP PERSENTASE STATIS yang benar-benar dieksekusi saat ini
(RISK_CONFIG, sama untuk semua pair). Field `slTpMode` disiapkan
sebagai penanda eksplisit ke UI kalau nanti diganti ke mode
berbasis ATR per pair (belum di-deploy).

Read-only (GET saja) -- belum ada endpoint untuk MENGUBAH config
dari dashboard (itu tetap lewat env var Vercel + redeploy, sesuai
alur kerja Anda yang sudah ada).
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/services/firebase/admin";
import { BOT_CONFIG } from "@/config/bot";
import { RISK_CONFIG } from "@/config/risk";
import { TRADING_CONFIG } from "@/config/trading";
import { getBotControl } from "@/services/firebase/botControl";
import EnvValidator from "@/lib/validators/env";

/**
 * Cek env var wajib (BOT_MODE/BOT_INTERVAL/BOT_DEFAULT_TRADE_AMOUNT/
 * BOT_MAX_TRADE_AMOUNT/BOT_TARGET_PROFIT/BOT_STOP_LOSS/Firebase client
 * config) TANPA pernah melempar/mem-block response ini -- endpoint
 * ini sudah berguna walau env ada yang tidak lengkap, jadi validasi
 * env HANYA jadi info tambahan (banner peringatan di dashboard),
 * bukan syarat endpoint bisa dipakai. Cuma NAMA var yang hilang yang
 * dikembalikan (dari AppError.message bawaan EnvValidator, bukan
 * nilai/secret apa pun) -- aman karena endpoint ini sudah di belakang
 * Firebase ID Token, bukan publik.
 */
function checkEnvStatus(): { ok: boolean; message: string | null } {
  try {
    EnvValidator.validate();
    return { ok: true, message: null };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Env tidak valid.",
    };
  }
}

async function getUidFromRequest(
  req: NextApiRequest
): Promise<string | null> {

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.replace("Bearer ", "");

  try {

    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;

  } catch (error) {

    console.error("[Settings Config API] Token invalid:", error);
    return null;

  }

}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uid = await getUidFromRequest(req);

  if (!uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {

    const control = await getBotControl();

    // Live trading HANYA aktif kalau DUA syarat terpenuhi -- sama
    // persis logika isLiveModeActive() di services/trading/engine.ts.
    // control.mode="live" saja TIDAK CUKUP (itu cuma toggle dashboard,
    // bisa diklik siapa saja yang login tanpa akses Vercel). Dipisah
    // dari `mode` mentah supaya UI bisa dengan jujur membedakan
    // "live DIMINTA" vs "live BENAR-BENAR jalan".
    const liveConfirmed = process.env.BOT_LIVE_CONFIRM === "true";

    const effectiveMode: "paper" | "live" =
      control.mode === "live" && liveConfirmed ? "live" : "paper";

    return res.status(200).json({

      requestedMode: control.mode,

      liveConfirmed,

      effectiveMode,

      emergencyStop: RISK_CONFIG.emergencyStop || control.emergencyStop,

      tradeAmount: BOT_CONFIG.defaultTradeAmount,

      maxTradeAmount: BOT_CONFIG.maxTradeAmount,

      startingBalance: BOT_CONFIG.startingBalance,

      slTpMode: "PERCENTAGE",

      stopLossBaselinePercent: RISK_CONFIG.stopLossPercent,

      targetProfitBaselinePercent: RISK_CONFIG.targetProfitPercent,

      maxOpenPosition: RISK_CONFIG.maxOpenPosition,

      maxExposurePercent: RISK_CONFIG.maxExposurePercent,

      maxDailyLossPercent: RISK_CONFIG.maxDailyLossPercent,

      cooldownSeconds: RISK_CONFIG.cooldownSeconds,

      trailingStop: RISK_CONFIG.trailingStop,

      pairs: TRADING_CONFIG.pairs,

      fullPairMode: TRADING_CONFIG.fullPairMode,

      minVolumeIdr: TRADING_CONFIG.minVolumeIdr,

      cronIntervalSeconds: BOT_CONFIG.interval,

      envStatus: checkEnvStatus(),

      fetchedAt: new Date().toISOString(),

    });

  } catch (error) {

    console.error("[Settings Config API]", error);

    return res.status(500).json({
      error: "Gagal mengambil konfigurasi.",
    });

  }

}
