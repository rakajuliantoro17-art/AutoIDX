/**
==========================================================
AURA Trade OS
Qualified Pairs (untuk checklist pemilihan pair trading)
Version : 0.1.0

Beda dari /api/market (yang selalu men-trigger scan LIVE
penuh, ~12 detik untuk ratusan pair): endpoint ini cuma
membaca hasil scan TERAKHIR yang sudah tersimpan di
Firestore (scannerResults/latest, ditulis tiap siklus cron
oleh scanCycle.ts) -- nyaris instan, dan datanya PERSIS
sama dengan yang dipakai bot di siklus berjalan (bukan
scan terpisah yang bisa beda hasil).

Dipakai oleh halaman /settings/bot untuk menampilkan
checklist pair yang boleh dipilih user.
==========================================================
*/

import { NextResponse } from "next/server";
import { adminDb } from "@/services/firebase/admin";
import { getBotSettings } from "@/services/firebase/settingsService";
import type { ScannedPairResult } from "@/services/scanner/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const [scanSnapshot, botSettings] = await Promise.all([
      adminDb.collection("scannerResults").doc("latest").get(),
      getBotSettings(),
    ]);

    if (!scanSnapshot.exists) {
      return NextResponse.json({
        success: true,
        data: {
          opportunities: [] as ScannedPairResult[],
          qualifiedPairs: [] as string[],
          selectedPairs: botSettings.pairs ?? [],
          scanAvailable: false,
        },
      });
    }

    const data = scanSnapshot.data() ?? {};

    return NextResponse.json({
      success: true,
      data: {
        opportunities: (data.topOpportunities ?? []) as ScannedPairResult[],
        qualifiedPairs: (data.qualifiedPairs ?? []) as string[],
        selectedPairs: botSettings.pairs ?? [],
        scanAvailable: true,
      },
    });
  } catch (error) {
    console.error("[QUALIFIED PAIRS GET ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Failed to load qualified pairs." },
      { status: 500 }
    );
  }
}
