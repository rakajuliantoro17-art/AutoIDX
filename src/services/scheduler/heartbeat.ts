/**
==========================================================
AURA Trade OS
Scheduler Heartbeat Service
Version : 0.0.8 Alpha

CATATAN (audit keamanan): sebelumnya file ini pakai Client SDK
("firebase/firestore") meskipun dipanggil dari server
(liveTrading/engine, automation/*) - pola bug yang sama persis
yang sudah pernah diperbaiki di botState.ts dan
paperTradingStore.ts. Begitu firestore.rules diperketat (deny
by default), write ini akan gagal diam-diam (masuk catch,
return false) karena request.auth selalu null di context
server. Sudah diperbaiki pakai Admin SDK.
==========================================================
*/

import { adminDb } from "../firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export interface HeartbeatStatus {
  service: string;
  status: "ONLINE" | "OFFLINE";
  lastHeartbeat: string;
  uptime: number;
  version: string;
}

const COLLECTION = "system_status";
const DOCUMENT = "heartbeat";

let startedAt = Date.now();

function heartbeatRef() {
  return adminDb.collection(COLLECTION).doc(DOCUMENT);
}

/**
 * Mengirim heartbeat ke Firestore
 */
export async function sendHeartbeat(): Promise<boolean> {
  try {
    await heartbeatRef().set(
      {
        service: "Trading Engine",
        status: "ONLINE",
        version: "0.0.8-alpha",
        uptime: Math.floor(
          (Date.now() - startedAt) / 1000
        ),
        lastHeartbeat: new Date().toISOString(),
        serverTime: FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    return true;
  } catch (error) {
    console.error(
      "[Heartbeat]",
      error
    );

    return false;
  }
}

/**
 * Mengambil heartbeat terakhir
 */
export async function getHeartbeat(): Promise<HeartbeatStatus | null> {
  try {
    const snapshot = await heartbeatRef().get();

    if (!snapshot.exists) {
      return null;
    }

    return snapshot.data() as HeartbeatStatus;
  } catch (error) {
    console.error(
      "[Heartbeat]",
      error
    );

    return null;
  }
}

/**
 * Menandai service offline
 */
export async function markOffline(): Promise<void> {
  try {
    await heartbeatRef().set(
      {
        status: "OFFLINE",
        lastHeartbeat: new Date().toISOString(),
        uptime: Math.floor(
          (Date.now() - startedAt) / 1000
        ),
      },
      {
        merge: true,
      }
    );
  } catch (error) {
    console.error(
      "[Heartbeat]",
      error
    );
  }
}

/**
 * Mengecek apakah heartbeat masih valid.
 * Default timeout: 2 menit.
 */
export function isHeartbeatExpired(
  heartbeat: HeartbeatStatus,
  timeoutMs: number = 120000
): boolean {
  return (
    Date.now() -
      new Date(
        heartbeat.lastHeartbeat
      ).getTime() >
    timeoutMs
  );
}

/**
 * Membuat ringkasan status heartbeat
 */
export function summarizeHeartbeat(
  heartbeat: HeartbeatStatus | null
): string {
  if (!heartbeat) {
    return "No heartbeat available.";
  }

  if (isHeartbeatExpired(heartbeat)) {
    return `Heartbeat expired (${heartbeat.lastHeartbeat}).`;
  }

  return `Service ${heartbeat.service} is ${heartbeat.status}. Last heartbeat: ${heartbeat.lastHeartbeat}.`;
}

export default {
  sendHeartbeat,
  getHeartbeat,
  markOffline,
  isHeartbeatExpired,
  summarizeHeartbeat,
};
