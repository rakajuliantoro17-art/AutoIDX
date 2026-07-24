/**
==========================================================
AURA Trade OS
Market API
Version : 0.0.1 Alpha
==========================================================
*/

import { NextResponse } from "next/server";
import { scanMarket } from "./scanner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {

    const market = await scanMarket();

    return NextResponse.json({

        success: true,

        timestamp: new Date().toISOString(),

        total: market.length,

        data: market,

    });

}
