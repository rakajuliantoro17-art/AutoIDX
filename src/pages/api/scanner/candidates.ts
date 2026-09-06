/**
==========================================================
AURA Trade OS
Scanner Candidates API (read-only)
Version : 0.2.0 Alpha

GET -> daftar top pair hasil scan MARKET TERBARU (dokumen
       `scannerResults/latest`, ditulis services/scheduler/
       scanCycle.ts tiap siklus cron), dipakai UI checklist
       "Priority Pairs" di dashboard supaya operator cuma bisa
       pilih dari pair yang MEMANG sedang direkomendasikan
       scanner saat ini -- bukan input bebas.

v0.2.0: ditambah field DIAGNOSTIK penuh (scannedCount,
candidatesCount, qualifiedCount, maxVolIdrSeen, scoreStats) --
SEBELUMNYA cuma expose candidates+qualifiedPairs, jadi kalau
keduanya kosong operator TIDAK PUNYA CARA tahu KENAPA (market
sepi? threshold ketat? bug parsing volume?) tanpa buka log
mentah Vercel (baris "[SCAN CYCLE] ..." di scanCycle.ts cuma
console.log, TIDAK PERNAH masuk Activity Logs dashboard yang
berbasis recordLog()/Firestore -- gap ini ditemukan langsung
dari laporan user).

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
  diagnostics: {
    scannedCount: number;
    candidatesCount: number;
    qualifiedCount: number;
    maxVolIdrSeen: number;
    scoreStats: {
      analyzedCount: number;
      minScore: number;
      maxScore: number;
      avgScore: number;
      thresholdUsed: number;
    } | null;
  };
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
        diagnostics: {
          scannedCount: 0,
          candidatesCount: 0,
          qualifiedCount: 0,
          maxVolIdrSeen: 0,
          scoreStats: null,
        },
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
      diagnostics: {
        scannedCount: data.scannedCount ?? 0,
        candidatesCount: data.candidatesCount ?? 0,
        qualifiedCount: data.qualifiedCount ?? 0,
        maxVolIdrSeen: data.maxVolIdrSeen ?? 0,
        scoreStats: data.scoreStats ?? null,
      },
    });

  } catch (error) {

    console.error("[SCANNER CANDIDATES API ERROR]", error);

    return res.status(500).json({
      error: "Gagal membaca hasil scan terbaru.",
    });

  }

}
