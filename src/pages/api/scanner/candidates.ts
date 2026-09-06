/**
==========================================================
AURA Trade OS
Scanner Candidates API (read-only)
Version : 0.1.0 Alpha

GET -> daftar top pair hasil scan MARKET TERBARU (dokumen
       `scannerResults/latest`, ditulis services/scheduler/
       scanCycle.ts tiap siklus cron), dipakai UI checklist
       "Priority Pairs" di dashboard supaya operator cuma bisa
       pilih dari pair yang MEMANG sedang direkomendasikan
       scanner saat ini -- bukan input bebas.

Read-only, tidak mengubah apapun -- makanya TIDAK pakai
verifyApiAuth (sama seperti pola /api/logs/recent, data yang
diekspos bukan rahasia/sensitif, cuma hasil analisa pasar
publik Indodax).

Kalau dokumen scannerResults/latest belum pernah ada (instalasi
baru, belum ada siklus cron yang jalan): balas array kosong,
BUKAN error -- UI checklist cukup menampilkan "belum ada data
scan" tanpa mem-block halaman.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { adminDb } from "@/services/firebase/admin";
import type { ScannedPairResult } from "@/services/scanner/types";

export interface ScannerCandidatesResponse {
  candidates: ScannedPairResult[];
  qualifiedPairs: string[];
  scannedAt: number | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScannerCandidatesResponse | { error: string }>
) {

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {

    const snapshot = await adminDb
      .collection("scannerResults")
      .doc("latest")
      .get();

    if (!snapshot.exists) {

      return res.status(200).json({
        candidates: [],
        qualifiedPairs: [],
        scannedAt: null,
      });

    }

    const data = snapshot.data() ?? {};

    return res.status(200).json({
      candidates: Array.isArray(data.topOpportunities)
        ? data.topOpportunities
        : [],
      qualifiedPairs: Array.isArray(data.qualifiedPairs)
        ? data.qualifiedPairs
        : [],
      scannedAt: typeof data.durationMs === "number"
        ? Date.now() - data.durationMs
        : null,
    });

  } catch (error) {

    console.error("[SCANNER CANDIDATES API ERROR]", error);

    return res.status(500).json({
      error: "Gagal membaca hasil scan terbaru.",
    });

  }

}
