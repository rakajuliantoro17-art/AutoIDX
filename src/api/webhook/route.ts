/**
==========================================================
AURA Trade OS
Webhook API
Version : 0.0.1 Alpha
==========================================================
*/

import { NextRequest, NextResponse } from "next/server";

import { processWebhook } from "./service";
import { validateWebhook } from "./validator";
import { verifyHeaderSignature, verifyEmbeddedSecret } from "./signature";
import { WEBHOOK_VERSION } from "./constants";
import type { WebhookPayload } from "./types";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {

    try {

        // Baca raw text DULU (bukan request.json() langsung) --
        // HMAC di verifyHeaderSignature() harus dihitung dari byte
        // persis yang dikirim pengirim, request.json() sudah
        // parse+re-serialize yang bisa mengubah whitespace/urutan
        // key dan bikin signature tidak pernah cocok.
        const rawBody = await request.text();

        const secret = process.env.WEBHOOK_SECRET;

        if (!secret) {

            // Fail-closed: TIDAK BOLEH diam-diam skip verifikasi
            // cuma karena belum dikonfigurasi.
            return NextResponse.json({

                success: false,

                message:
                    "Webhook belum dikonfigurasi (WEBHOOK_SECRET belum di-set di environment).",

            }, {

                status: 503,

            });

        }

        let payload: WebhookPayload;

        try {

            payload = JSON.parse(rawBody);

        } catch {

            return NextResponse.json({

                success: false,

                message: "Body bukan JSON valid.",

            }, {

                status: 400,

            });

        }

        // Terima kalau SALAH SATU dari dua metode verifikasi valid
        // -- lihat komentar lengkap di signature.ts kenapa dua
        // metode (header vs body-embedded) dibutuhkan.
        const headerSignature =
            request.headers.get("x-webhook-signature");

        const verifiedByHeader =
            verifyHeaderSignature(rawBody, headerSignature, secret);

        const verifiedByEmbeddedSecret =
            verifyEmbeddedSecret(payload.secret, secret);

        if (!verifiedByHeader && !verifiedByEmbeddedSecret) {

            return NextResponse.json({

                success: false,

                message:
                    "Signature/secret tidak valid atau tidak dikirim.",

            }, {

                status: 401,

            });

        }

        if (!validateWebhook(payload)) {

            return NextResponse.json({

                success: false,

                message:
                    "Payload tidak valid (source/event wajib diisi, tidak boleh kosong).",

            }, {

                status: 400,

            });

        }

        const result =
            await processWebhook(payload);

        return NextResponse.json({

            success: true,

            version: WEBHOOK_VERSION,

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
