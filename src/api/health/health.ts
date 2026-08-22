/**
==========================================================
AURA Trade OS
Health Service
Version : 0.1.0 Alpha

PERBAIKAN dari 0.0.1: checks sebelumnya hardcode
{ api: true, firebase: true, indodax: true, cron: true } --
SELALU true apa pun kondisi sistemnya, tidak pernah benar-benar
mengecek apa pun. Sekarang memanggil
services/health (systemHealth.check()), yang mengagregasi 7
pengecekan ASLI (Firestore, Firebase Auth, Indodax API,
konektivitas jaringan, scheduler/cron, memori, cache) --
sebagian besar dari pengecekan itu sendiri sebelumnya JUGA
placeholder kosong (TODO), sudah diperbaiki terpisah di
services/health/checks/*.
==========================================================
*/

import { BOT_VERSION } from "./constants";
import type { HealthResponse } from "./response";
import { systemHealth } from "@/services/health";

export async function getHealthStatus(): Promise<HealthResponse> {

  const report = await systemHealth.check();

  const isUnhealthy = (status: string) => status === "UNHEALTHY";

  return {

    success: report.status !== "UNHEALTHY",

    status: report.status.toLowerCase(),

    version: BOT_VERSION,

    timestamp: new Date().toISOString(),

    environment: process.env.NODE_ENV ?? "development",

    checks: {

      // "api" merepresentasikan proses Node itu sendiri -- kalau
      // kode ini sempat jalan sampai sini, API route jelas hidup.
      api: true,

      firebase:
        !isUnhealthy(report.checks.database.status) &&
        !isUnhealthy(report.checks.firebase.status),

      indodax: !isUnhealthy(report.checks.exchange.status),

      cron: !isUnhealthy(report.checks.scheduler.status),

    },

    details: report,

  };

}
