/**
==========================================================
AURA Trade OS
Settings API
Version : 0.1.0 Alpha
==========================================================
*/
import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "./service";
import { AppError } from "@/lib/error/AppError";
import { ApiError } from "@/lib/error/ApiError";
import { ApiValidator } from "@/lib/validators/api";
import type { BotSettings } from "./types";
import { verifyBearerToken } from "@/lib/auth/verifyApiAuth";

function unauthorized() {
    return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
    );
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
    // Pengaturan trading: wajib login (Firebase ID token).
    if (!(await verifyBearerToken(request.headers.get("authorization")))) {
        return unauthorized();
    }

    const settings = await getSettings();
    return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: settings,
    });
}

export async function PUT(request: Request) {
    // Mengubah trade amount/SL/TP/posisi maksimum: wajib login.
    if (!(await verifyBearerToken(request.headers.get("authorization")))) {
        return unauthorized();
    }

    try {
        // SEBELUMNYA: `await request.json()` langsung -- body yang
        // bukan JSON valid (mis. kosong/typo) ketangkap catch umum
        // di bawah dan dilaporkan sebagai 500 "Failed to save
        // settings", padahal ini kesalahan client (400), bukan
        // error server. ApiValidator.validateJsonBody() (lib/
        // validators/api.ts, sebelumnya orphan) melempar ApiError
        // 400 BAD_REQUEST yang jelas untuk kasus ini.
        const body = await ApiValidator.validateJsonBody<Partial<BotSettings>>(
            request
        );

        const updated = await saveSettings(body);
        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: updated,
        });
    } catch (error) {
        // Body bukan JSON valid.
        if (error instanceof ApiError) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                { status: error.status }
            );
        }

        // Input JSON valid tapi nilainya tidak valid
        // (RiskValidator/NumberValidator/dst di ./validate.ts) --
        // ini SALAH OPERATOR, bukan error server.
        if (error instanceof AppError && error.code === "VALIDATION_ERROR") {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                { status: 400 }
            );
        }

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
