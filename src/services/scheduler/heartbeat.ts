/**
==========================================================
AURA Trade OS
Scheduler Heartbeat Service
Version : 0.0.7 Alpha
==========================================================
*/

import { db } from "../firebase/config";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

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

/**
 * Mengirim heartbeat ke Firestore
 */
export async function sendHeartbeat(): Promise<boolean> {
  try {
    await setDoc(
      doc(db, COLLECTION, DOCUMENT),
      {
        service: "Trading Engine",
        status: "ONLINE",
        version: "0.0.7-alpha",
        uptime: Math.floor(
          (Date.now() - startedAt) / 1000
        ),
        lastHeartbeat: new Date().toISOString(),
        serverTime: serverTimestamp(),
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
    const snapshot = await getDoc(
      doc(db, COLLECTION, DOCUMENT)
    );

    if (!snapshot.exists()) {
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
    await setDoc(
      doc(db, COLLECTION, DOCUMENT),
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
