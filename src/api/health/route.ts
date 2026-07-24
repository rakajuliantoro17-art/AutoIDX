/**
==========================================================
AURA Trade OS
Health API
Version : 0.0.1 Alpha
==========================================================
*/

import { NextResponse } from "next/server";
import { getHealthStatus } from "./health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {

  const health = await getHealthStatus();

  return NextResponse.json(
    health,
    {
      status: health.success ? 200 : 503,
    }
  );

}
