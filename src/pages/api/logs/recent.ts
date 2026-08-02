/**
==========================================================
AURA Trade OS
Recent Logs API (Server-side)
Version : 0.1.0 Alpha

Membaca activity_logs + trades dari Firestore (lewat
getRecentLogs() yang sudah ada di logService.ts, sebelumnya
tidak pernah dipanggil dari mana pun). Dilindungi Firebase ID
Token, sama seperti /api/settings/indodax-accounts.

Dipanggil oleh src/app/activity/page.tsx lewat polling
(bukan Firestore client-side realtime listener) supaya TIDAK
perlu firestore.rules baru untuk collection ini - konsisten
dengan pola keamanan Admin-SDK-only yang sudah dipakai project.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, adminDb } from "@/services/firebase/admin";
import { getRecentLogs } from "@/services/firebase/logService";

async function getUidFromRequest(
  req: NextApiRequest
): Promise<string | null> {

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.replace("Bearer ", "");

  try {

    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;

  } catch (error) {

    console.error("[Recent Logs API] Token invalid:", error);
    return null;

  }

}

/**
 * Firestore Timestamp (Admin SDK) tidak bisa langsung
 * di-JSON.stringify dengan aman (bukan primitive) -
 * dikonversi ke ISO string dulu di sini.
 */
function serializeTimestamp(value: any): string | null {

  if (!value) return null;

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  return null;

}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uid = await getUidFromRequest(req);

  if (!uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {

    const maxLogs =
      Number(req.query.limit ?? 50);

    const [logs, tradesSnapshot] = await Promise.all([

      getRecentLogs(maxLogs),

      adminDb
        .collection("trades")
        .orderBy("timestamp", "desc")
        .limit(20)
        .get(),

    ]);

    const trades = tradesSnapshot.docs.map((doc) => {

      const data = doc.data();

      return {
        id: doc.id,
        pair: data.pair,
        type: data.type,
        price: data.price,
        amount: data.amount,
        totalIdr: data.totalIdr,
        mode: data.mode,
        reason: data.reason,
        timestamp: serializeTimestamp(data.timestamp),
      };

    });

    const serializedLogs = logs.map((log) => ({
      ...log,
      timestamp: serializeTimestamp(log.timestamp),
    }));

    return res.status(200).json({
      logs: serializedLogs,
      trades,
      fetchedAt: new Date().toISOString(),
    });

  } catch (error) {

    console.error("[Recent Logs API]", error);

    return res.status(500).json({
      error: "Gagal mengambil log.",
    });

  }

}
