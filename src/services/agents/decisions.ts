/**
==========================================================
AURA Trade OS
Ops Agent -- keputusan pemilik (server-only)
==========================================================
HANYA pemilik (uid == BOT_OWNER_UID) yang boleh menyetujui/menolak.
Persetujuan menerapkan usulan lewat jalur yang sama dengan UI
(validasi settings + audit trail). Whitelist ketat:
- setting: hanya AGENT_SETTABLE_KEYS
- priority_pairs: bot_control.priorityPairs
- note: hanya ditandai sudah dibaca
Mode live / emergency stop / API key TIDAK PERNAH bisa diubah agen.
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";
import { getSettings, saveSettings } from "@/api/settings/service";
import { getBotControl, updateBotControl } from "@/services/firebase/botControl";
import { diffFields, recordAudit } from "@/services/firebase/auditTrail";
import { RECOMMENDATIONS } from "./opsAgent";
import { AGENT_SETTABLE_KEYS, type Recommendation } from "./types";

export function isOwner(uid: string | undefined): boolean {
  const owner = process.env.BOT_OWNER_UID?.trim();
  return !!owner && !!uid && owner === uid;
}

export type DecisionResult =
  | { ok: true; status: "approved" | "rejected" }
  | { ok: false; code: 404 | 409 | 422 | 500; error: string };

export async function decideRecommendation(
  id: string,
  decision: "approve" | "reject",
  actor: string
): Promise<DecisionResult> {
  const ref = adminDb.collection(RECOMMENDATIONS).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, code: 404, error: "Usulan tidak ditemukan." };
  const rec = snap.data() as Recommendation;
  if (rec.status !== "pending") return { ok: false, code: 409, error: "Usulan sudah diputuskan." };

  if (decision === "approve") {
    try {
      if (rec.kind === "setting") {
        const patch: Record<string, number> = {};
        for (const k of AGENT_SETTABLE_KEYS) {
          const v = rec.patch?.[k];
          if (typeof v === "number") patch[k] = v;
        }
        if (Object.keys(patch).length === 0) {
          return { ok: false, code: 422, error: "Usulan tidak berisi setting yang diizinkan." };
        }
        const before = await getSettings();
        await saveSettings(patch); // validasi bawaan; melempar bila tidak valid
        await recordAudit(
          "settings.update",
          actor,
          diffFields(before as unknown as Record<string, unknown>, patch),
          { via: "ops_agent", recommendationId: id }
        );
      } else if (rec.kind === "priority_pairs") {
        const pairs = rec.patch?.priorityPairs;
        if (!Array.isArray(pairs) || !pairs.every((p) => typeof p === "string" && /^[a-z0-9]{2,12}_[a-z]{2,6}$/.test(p))) {
          return { ok: false, code: 422, error: "Daftar pair tidak valid." };
        }
        const before = await getBotControl();
        await updateBotControl({ priorityPairs: pairs }, actor);
        await recordAudit(
          "bot_control.update",
          actor,
          diffFields(before as unknown as Record<string, unknown>, { priorityPairs: pairs }),
          { via: "ops_agent", recommendationId: id }
        );
      }
    } catch (error) {
      console.error("[OPS AGENT apply]", error);
      return { ok: false, code: 500, error: error instanceof Error ? error.message : "Gagal menerapkan usulan." };
    }
  }

  const status = decision === "approve" ? "approved" : "rejected";
  await ref.update({ status, decidedBy: actor, decidedAtMs: Date.now() });
  return { ok: true, status };
}
