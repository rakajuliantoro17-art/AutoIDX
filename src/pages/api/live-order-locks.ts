/**
==========================================================
AURA Trade OS
Live Order Locks Inspector API
Version : 0.1.0 Alpha
==========================================================
GET  /api/live-order-locks          -- lihat SEMUA lock (pair+side)
POST /api/live-order-locks/resolve  -- resolve lock UNCERTAIN manual

Celah yang ditutup: services/firebase/liveOrderLock.ts (Firestore-
based, benar untuk serverless) sudah mencegah duplikat order &
menandai order yang responsnya gagal diterima (tapi mungkin
tereksekusi di Indodax) sebagai UNCERTAIN -- TAPI TIDAK ADA satu
pun cara untuk MELIHAT status lock ini dari luar. Kalau ada lock
UNCERTAIN yang memblokir pair+side tertentu, operator tidak akan
tahu KENAPA "sinyal BUY muncul tapi tidak ada order baru" tanpa
buka Firebase Console manual.

PENTING soal resolve: endpoint ini TIDAK PERNAH mengecek ke
Indodax apakah order itu benar-benar tereksekusi atau tidak --
itu wewenang & tanggung jawab operator (WAJIB dicek manual ke
riwayat order Indodax dulu). Endpoint ini cuma pintu untuk
melihat & (setelah verifikasi manual) melepas lock -- persis
seperti fungsi resolveLiveOrderLock() aslinya.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, adminDb } from "@/services/firebase/admin";
import { resolveLiveOrderLock } from "@/services/firebase/liveOrderLock";

async function getUidFromRequest(req: NextApiRequest): Promise<string | null> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.replace("Bearer ", "");

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;
  } catch (error) {
    console.error("[Live Order Locks API] Token invalid:", error);
    return null;
  }
}

interface LiveOrderLockDoc {
  pair: string;
  side: "BUY" | "SELL";
  status: "PENDING" | "COMPLETED" | "FAILED" | "UNCERTAIN";
  lockedAt: number;
  releasedAt?: number;
  uncertainReason?: string;
  markedUncertainAt?: number;
  resolvedAt?: number;
  resolvedManually?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const uid = await getUidFromRequest(req);

  if (!uid) {
    return res.status(401).json({ error: "Unauthorized - login diperlukan" });
  }

  if (req.method === "GET") {
    try {
      const snapshot = await adminDb.collection("live_order_locks").get();

      const locks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as LiveOrderLockDoc),
      }));

      locks.sort((a, b) => (b.lockedAt ?? 0) - (a.lockedAt ?? 0));

      const uncertain = locks.filter((l) => l.status === "UNCERTAIN");
      const pending = locks.filter((l) => l.status === "PENDING");

      return res.status(200).json({
        totalLocks: locks.length,
        uncertainCount: uncertain.length,
        pendingCount: pending.length,
        uncertain,
        pending,
        all: locks,
        note:
          uncertain.length > 0
            ? `ADA ${uncertain.length} lock UNCERTAIN -- pair/side ini TIDAK BISA BUY/SELL lagi sampai di-resolve manual. WAJIB cek riwayat order asli di Indodax dulu sebelum resolve (POST /api/live-order-locks dengan {pair, side}) -- kalau order itu ternyata tereksekusi, JANGAN resolve, rekonsiliasi posisi manual dulu.`
            : "Tidak ada lock UNCERTAIN saat ini.",
      });
    } catch (error) {
      console.error("[Live Order Locks API]", error);
      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil daftar live order locks.",
      });
    }
  }

  if (req.method === "POST") {
    try {
      const { pair, side } = req.body ?? {};

      if (!pair || (side !== "BUY" && side !== "SELL")) {
        return res.status(400).json({
          error: "Body harus berisi { pair: string, side: \"BUY\"|\"SELL\" }.",
        });
      }

      await resolveLiveOrderLock(pair, side);

      return res.status(200).json({
        success: true,
        message: `Lock ${side} ${String(pair).toUpperCase()} sudah di-resolve -- pastikan kamu SUDAH verifikasi manual ke riwayat order Indodax sebelum ini.`,
      });
    } catch (error) {
      console.error("[Live Order Locks API - resolve]", error);
      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Gagal resolve live order lock.",
      });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
