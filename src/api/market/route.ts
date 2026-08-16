/**
==========================================================
AURA Trade OS
Market API
Version : 0.0.9 Alpha

Menggunakan MarketScanner (services/scanner) sebagai sumber
kebenaran tunggal -- termasuk RSI/EMA + Opportunity Score,
bukan cuma data ticker mentah.

Default (tanpa ?pairs=): scan SEMUA pair IDR yang aktif di
Indodax (ditarik live dari /api/pairs, di-cache 6 jam) -- bukan
lagi daftar 5 pair hardcode.

Query params:
  ?pairs=btc_idr,eth_idr   (opsional - override, default: semua pair IDR)
  ?minVolume=<number>       (default: 50.000.000 IDR)
  ?limit=<number>           (default: 50 - jumlah opportunity teratas yang dikembalikan)
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

  const limitParam = Number(params.get("limit"));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(limitParam, 200)
      : undefined;

  try {
    const summary = await MarketScanner.scanMarket(pairs, { minVolumeIdr, limit });

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
