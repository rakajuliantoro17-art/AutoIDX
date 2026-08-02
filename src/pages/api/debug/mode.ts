/**
==========================================================
AURA Trade OS
Debug: Env Var Trading Mode
Version : 0.0.1 Alpha

Endpoint SEMENTARA untuk diagnosa kenapa BOT_LIVE_CONFIRM
tidak terbaca. Buka langsung di browser:
https://domain-kamu.vercel.app/api/debug/mode

HAPUS FILE INI setelah masalah selesai.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { TRADING_CONFIG } from "@/config/trading";
import { BOT_CONFIG } from "@/config/bot";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const rawBotMode = process.env.BOT_MODE;
  const rawLiveConfirm = process.env.BOT_LIVE_CONFIRM;

  return res.status(200).json({
    raw: {
      BOT_MODE: rawBotMode,
      BOT_MODE_type: typeof rawBotMode,
      BOT_MODE_length: rawBotMode?.length,
      BOT_LIVE_CONFIRM: rawLiveConfirm,
      BOT_LIVE_CONFIRM_type: typeof rawLiveConfirm,
      BOT_LIVE_CONFIRM_length: rawLiveConfirm?.length,
      BOT_LIVE_CONFIRM_strictEqualTrue: rawLiveConfirm === "true",
    },
    resolved: {
      TRADING_CONFIG_mode: TRADING_CONFIG.mode,
      BOT_CONFIG_mode: BOT_CONFIG.mode,
    },
    isLiveModeActive:
      TRADING_CONFIG.mode === "live" &&
      process.env.BOT_LIVE_CONFIRM === "true",
    deployedAt: new Date().toISOString(),
    vercelEnv: process.env.VERCEL_ENV ?? null,
  });
}
