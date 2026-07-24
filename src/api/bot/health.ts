/**
==========================================================
AutoIDX
Health Check
Version : 0.0.1 Alpha
==========================================================
*/

import { BOT } from "./constants";

export interface HealthResponse {
  success: boolean;

  status: "healthy" | "degraded" | "unhealthy";

  service: string;

  version: string;

  timestamp: string;

  uptime: number;

  environment: string;

  checks: {
    api: boolean;
    firebase: boolean;
    indodax: boolean;
  };
}

export async function getHealth(): Promise<HealthResponse> {

  /**
   * TODO
   * Replace with real health checks
   */

  const firebase = true;

  const indodax = true;

  const api = true;

  const healthy =
    api &&
    firebase &&
    indodax;

  return {

    success: healthy,

    status: healthy
      ? "healthy"
      : "degraded",

    service: BOT.NAME,

    version: BOT.VERSION,

    timestamp: new Date().toISOString(),

    uptime: Math.floor(process.uptime()),

    environment:
      process.env.NODE_ENV ?? "development",

    checks: {

      api,

      firebase,

      indodax,

    },

  };

}
