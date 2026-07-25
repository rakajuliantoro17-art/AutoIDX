/**
==========================================================
AURA Trade OS
Market API
Version : 0.0.9 Alpha

Menggunakan MarketScanner (services/scanner) sebagai sumber
kebenaran tunggal -- termasuk RSI/EMA + Opportunity Score,
bukan cuma data ticker mentah.

Query params:
  ?pairs=btc_idr,eth_idr   (default: 5 pair utama)
  ?minVolume=<number>       (default: 50.000.000 IDR)
==========================================================
*/

import { NextRequest, NextResponse } from "next/server";
import MarketScanner from "@/services/scanner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const pairsParam = params.get("pairs");
  const pairs = pairsParam
    ? pairsParam.split(",").map((p) => p.trim().toLowerCase())
    : undefined;

  const minVolumeParam = Number(params.get("minVolume"));
  const minVolumeIdr =
    Number.isFinite(minVolumeParam) && minVolumeParam > 0
      ? minVolumeParam
      : undefined;

  try {
    const summary = await MarketScanner.scanMarket(pairs, { minVolumeIdr });

    return NextResponse.json({
      success: true,
      timestamp: summary.scannedAt,
      scannedCount: summary.scannedCount,
      qualifiedCount: summary.qualifiedCount,
      data: summary.topOpportunities,
    });
  } catch (error) {
    console.error("[Market API Error]", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
