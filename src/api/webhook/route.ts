/**
==========================================================
AURA Trade OS
Webhook API
Version : 0.0.1 Alpha
==========================================================
*/

import { NextRequest, NextResponse } from "next/server";

import { processWebhook } from "./service";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {

    try {

        const payload = await request.json();

        const result =
            await processWebhook(payload);

        return NextResponse.json({

            success: true,

            timestamp:
                new Date().toISOString(),

            data: result,

        });

    } catch (error) {

        return NextResponse.json({

            success: false,

            message:
                error instanceof Error
                    ? error.message
                    : "Unknown error"

        }, {

            status: 500,

        });

    }

}
