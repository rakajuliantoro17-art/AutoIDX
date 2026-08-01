/**
==========================================================
AURA Trade OS
Settings API
Version : 0.1.0 Alpha
==========================================================
*/
import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "./service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
    const settings = await getSettings();
    return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: settings,
    });
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const updated = await saveSettings(body);
        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: updated,
        });
    } catch (error) {
        console.error("[SETTINGS PUT ERROR]", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to save settings.",
            },
            { status: 500 }
        );
    }
}
