/**
==========================================================
AURA Trade OS
Health API
Version : 0.0.1 Alpha
==========================================================
*/

import { NextResponse } from "next/server";
import { getHealthStatus } from "./health";
import { cached } from "@/lib/cache/ttlCache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {

  // Cache 30 dtk: dashboard/tab lama memanggil tiap 15 dtk; cek kesehatan
  // membaca Firestore tiap panggilan (hemat kuota Spark).
  const health = await cached("health:payload", 30_000, getHealthStatus);

  return NextResponse.json(
    health,
    {
      status: health.success ? 200 : 503,
    }
  );

}
