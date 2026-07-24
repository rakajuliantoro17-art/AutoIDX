/**
==========================================================
AURA Trade OS
Health Service
Version : 0.0.1 Alpha
==========================================================
*/

import { BOT_VERSION } from "./constants";

export async function getHealthStatus() {

  return {

    success: true,

    status: "healthy",

    version: BOT_VERSION,

    timestamp: new Date().toISOString(),

    environment:
      process.env.NODE_ENV ?? "development",

    checks: {

      api: true,

      firebase: true,

      indodax: true,

      cron: true,

    },

  };

}
