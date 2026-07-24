/**
==========================================================
AURA Trade OS
Settings API
Version : 0.0.1 Alpha
==========================================================
*/

import { NextResponse } from "next/server";
import { getSettings } from "./service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {

    const settings = await getSettings();

    return NextResponse.json({

        success: true,

        timestamp: new Date().toISOString(),

        data: settings,

    });

}
