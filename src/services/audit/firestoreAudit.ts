/**
==========================================================
AURA Trade OS
Firestore Audit Sink / Repository
Version : 0.1.0 Alpha

Mengaktifkan services/audit/* (AuditLogger, AuditEvent,
AuditRepository) yang sebelumnya orphan -- desainnya sudah
dependency-injection (AuditSink interface), tinggal disediakan
implementasi penyimpanan aslinya. File ini menyediakan itu:
tulis ke Firestore collection "audit_events", plus query
berdasarkan executionId/orderId/rentang waktu.

Kenapa ini penting: sebelumnya jejak BUY/SELL/mismatch cuma ada
di collection "logs" sebagai teks bebas (recordLog) -- sulit
di-query terstruktur (mis. "tunjukkan semua event untuk order
ID X"). auditRepository.ts di sini memberi query terstruktur
yang recordLog tidak bisa.

TIDAK menggantikan recordLog() -- keduanya jalan berdampingan.
recordLog tetap dipakai untuk log umum yang tampil di halaman
Activity; audit dipakai untuk jejak forensik per-eksekusi yang
butuh bisa di-query presisi (mis. investigasi setelah
reconciliation mismatch).
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";

import type { AuditEvent, AuditEventType } from "@/services/audit/auditEvent";
import type { AuditSink } from "@/services/audit/auditLogger";
import { AuditLogger } from "@/services/audit/auditLogger";
import type { AuditRepository } from "@/services/audit/auditRepository";

const AUDIT_COLLECTION = "audit_events";

class FirestoreAuditSink implements AuditSink {

  async write(event: AuditEvent): Promise<void> {

    await adminDb
      .collection(AUDIT_COLLECTION)
      .doc(event.id)
      .set(event);

  }

}

class FirestoreAuditRepository implements AuditRepository {

  async append(event: AuditEvent): Promise<void> {

    await adminDb
      .collection(AUDIT_COLLECTION)
      .doc(event.id)
      .set(event);

  }

  async findByExecution(
    executionId: string
  ): Promise<readonly AuditEvent[]> {

    const snapshot = await adminDb
      .collection(AUDIT_COLLECTION)
      .where("executionId", "==", executionId)
      .orderBy("timestamp", "asc")
      .get();

    return snapshot.docs.map((doc) => doc.data() as AuditEvent);

  }

  async findByOrder(
    orderId: string
  ): Promise<readonly AuditEvent[]> {

    const snapshot = await adminDb
      .collection(AUDIT_COLLECTION)
      .where("orderId", "==", orderId)
      .orderBy("timestamp", "asc")
      .get();

    return snapshot.docs.map((doc) => doc.data() as AuditEvent);

  }

  async findSince(
    timestamp: number
  ): Promise<readonly AuditEvent[]> {

    const snapshot = await adminDb
      .collection(AUDIT_COLLECTION)
      .where("timestamp", ">=", timestamp)
      .orderBy("timestamp", "asc")
      .get();

    return snapshot.docs.map((doc) => doc.data() as AuditEvent);

  }

}

/**
 * Singleton siap pakai -- import `auditLogger` untuk MENULIS
 * event (dipanggil dari services/trading/engine.ts dkk), import
 * `auditRepository` untuk QUERY event (mis. dari endpoint
 * investigasi/debugging).
 */
export const auditLogger = new AuditLogger(new FirestoreAuditSink());

export const auditRepository: AuditRepository = new FirestoreAuditRepository();

export type { AuditEvent, AuditEventType };
