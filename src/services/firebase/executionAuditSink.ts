/**
==========================================================
AURA Trade OS
Execution Audit Sink (Admin SDK, server-only)
Version : 0.1.0

Menyambungkan services/liveTrading/audit/executionAudit.ts
(Phase 38/Batch 4 - SEBELUMNYA 100% orphan, 0 importer) ke
Firestore. ExecutionAudit sendiri PURE (cuma terima
`ExecutionAuditSink` lewat constructor, tidak tahu apa-apa
soal Firestore) - file ini SATU-SATUNYA implementasi sink-nya.

BEDA dari recordLog()/recordTrade() (logService.ts) yang
sudah ada: log itu untuk activity feed dashboard yang MUDAH
DIBACA MANUSIA (string message). Audit log ini terstruktur
per-EVENT LIFECYCLE satu order (ORDER_CREATED -> ...->
ORDER_FILLED/REJECTED), field tetap (action/localOrderId/
exchangeOrderId/timestamp/metadata) - didesain untuk DIQUERY
terprogram nanti (mis. "tampilkan semua event untuk order
X", atau audit compliance "berapa lama rata-rata dari
ORDER_CREATED sampai ORDER_SUBMITTED"), bukan cuma dibaca
manusia satu-satu. Keduanya SENGAJA jalan berdampingan, BUKAN
saling menggantikan.

Non-fatal dengan sengaja (sama seperti recordCanarySafe di
live.ts) - kegagalan MENULIS audit trail tidak boleh
menggagalkan order asli yang sudah/sedang dieksekusi.
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";
import {
  ExecutionAudit,
  ExecutionAuditEvent,
  ExecutionAuditSink,
} from "@/services/liveTrading/audit";

const COLLECTION = "execution_audit_log";

class FirestoreExecutionAuditSink implements ExecutionAuditSink {

  async write(event: ExecutionAuditEvent): Promise<void> {

    try {

      // doc ID = eventId -- idempotent kalau somehow dipanggil 2x
      // dengan event yang sama persis (bukan skenario yang
      // diharapkan terjadi, tapi aman kalau terjadi).
      await adminDb
        .collection(COLLECTION)
        .doc(event.eventId)
        .set(event);

    } catch (error) {

      console.error(
        "[ExecutionAuditSink] Gagal menulis audit event (non-fatal):",
        event.action,
        event.localOrderId,
        error
      );

    }

  }

}

/**
 * Singleton - dipakai trading/live.ts. Satu instance cukup,
 * ExecutionAudit sendiri tidak menyimpan state apapun selain
 * referensi ke sink (aman dipakai lintas invocation serverless,
 * tidak ada counter in-memory yang perlu diwaspadai seperti
 * CanaryManager/CanaryGuard di canaryContextBuilder.ts yang
 * sudah dihapus - lihat Session Log 12).
 */
export const executionAudit = new ExecutionAudit(
  new FirestoreExecutionAuditSink()
);

export default executionAudit;
