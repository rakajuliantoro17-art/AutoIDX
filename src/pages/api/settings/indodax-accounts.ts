/**
==========================================================
AURA Trade OS
Indodax Accounts API (Server-side, secure)
Version : 0.0.1 Alpha
Menggantikan tulis-langsung-dari-client ke Firestore.
Semua request WAJIB bawa Firebase ID Token (Authorization:
Bearer <idToken>) - server verifikasi identitas user, lalu
enkripsi secretKey/apiKey sebelum simpan lewat Admin SDK.
Secret key TIDAK PERNAH dikirim balik ke client dalam bentuk
utuh - cuma versi masked.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, adminDb } from "@/services/firebase/admin";
import { encrypt } from "@/services/security/encryption";
import { recordAudit } from "@/services/firebase/auditTrail";
import { getBotControl } from "@/services/firebase/botControl";
import { getOpenPositionsCount } from "@/services/firebase/botState";
import {
  activeStateForNewAccount,
  deletionChangesActiveAccount,
  evaluateAccountSwitch,
  planActivation,
  type AccountLite,
} from "@/services/accounts/accountSelection";

function maskKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}${"•".repeat(8)}${key.slice(-4)}`;
}

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

    console.error("[Indodax Accounts API] Token invalid:", error);
    return null;

  }

}

function accountsCollection(uid: string) {
  return adminDb.collection("users").doc(uid).collection("indodaxAccounts");
}

async function loadAccountsLite(uid: string): Promise<AccountLite[]> {
  const snap = await accountsCollection(uid).get();
  return snap.docs.map((d) => ({
    id: d.id,
    isActive: d.data().isActive === true,
    createdAt: Number(d.data().createdAt ?? 0),
  }));
}

/**
 * Alasan penolakan bila mengganti/menghapus/menonaktifkan akun aktif
 * berbahaya saat ini: posisi live terbuka atau order TIDAK PASTI.
 * Gagal membaca status = ditolak (fail-closed).
 */
async function switchBlockedReason(): Promise<string | null> {
  try {
    const [control, openPositions, uncertain] = await Promise.all([
      getBotControl(),
      getOpenPositionsCount(),
      adminDb.collection("live_order_locks").where("status", "==", "UNCERTAIN").limit(1).get(),
    ]);
    const verdict = evaluateAccountSwitch({
      liveMode: control.mode === "live",
      openPositions,
      uncertainLocks: uncertain.size,
    });
    return verdict.allowed ? null : verdict.reason;
  } catch (error) {
    console.error("[Indodax Accounts API] Gagal memeriksa syarat ganti akun:", error);
    return "Tidak bisa memastikan posisi/order saat ini aman untuk ganti akun. Coba lagi sebentar.";
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const uid = await getUidFromRequest(req);

  if (!uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {

    switch (req.method) {

      case "GET": {

        const snap = await accountsCollection(uid)
          .orderBy("createdAt", "desc")
          .get();

        const accounts = snap.docs.map((d) => {

          const data = d.data();

          return {
            id: d.id,
            label: data.label,
            apiKeyMasked: maskKey(data.apiKey ?? ""),
            isActive: data.isActive,
            createdAt: data.createdAt,
          };

        });

        return res.status(200).json({ accounts });

      }

      case "POST": {

        const { label, apiKey, secretKey } = req.body ?? {};

        if (!label || !apiKey || !secretKey) {

          return res.status(400).json({
            error: "label, apiKey, dan secretKey wajib diisi.",
          });

        }

        const encryptedApiKey = encrypt(apiKey);
        const encryptedSecretKey = encrypt(secretKey);

        // Hanya satu akun aktif: akun baru aktif hanya bila belum ada yang aktif.
        const isActive = activeStateForNewAccount(await loadAccountsLite(uid));

        const ref = await accountsCollection(uid).add({
          label,
          apiKey: encryptedApiKey,
          secretKey: encryptedSecretKey,
          isActive,
          createdAt: Date.now(),
        });

        await recordAudit("indodax_account.create", uid, [
          { field: "label", before: null, after: String(label) },
        ], { accountId: ref.id });

        return res.status(200).json({ id: ref.id, isActive });

      }

      case "PATCH": {

        const { accountId, isActive } = req.body ?? {};

        if (!accountId || typeof isActive !== "boolean") {

          return res.status(400).json({
            error: "accountId dan isActive (boolean) wajib diisi.",
          });

        }

        const accounts = await loadAccountsLite(uid);
        const plan = planActivation(accounts, accountId, isActive);
        if (!plan.ok) {
          return res.status(404).json({ error: plan.error });
        }
        if (plan.updates.length === 0) {
          return res.status(200).json({ success: true, unchanged: true });
        }
        if (plan.changesActiveAccount) {
          const blocked = await switchBlockedReason();
          if (blocked) {
            return res.status(409).json({ error: blocked });
          }
        }

        // Satu batch atomik: mengaktifkan satu akun menonaktifkan yang lain.
        const batch = adminDb.batch();
        for (const u of plan.updates) {
          batch.update(accountsCollection(uid).doc(u.id), { isActive: u.isActive });
        }
        await batch.commit();

        for (const u of plan.updates) {
          await recordAudit("indodax_account.update", uid, [
            { field: "isActive", before: !u.isActive, after: u.isActive },
          ], { accountId: u.id });
        }

        return res.status(200).json({ success: true });

      }

      case "DELETE": {

        const { accountId } = req.body ?? {};

        if (!accountId) {

          return res.status(400).json({
            error: "accountId wajib diisi.",
          });

        }

        const accounts = await loadAccountsLite(uid);
        if (deletionChangesActiveAccount(accounts, accountId)) {
          const blocked = await switchBlockedReason();
          if (blocked) {
            return res.status(409).json({ error: blocked });
          }
        }

        await accountsCollection(uid).doc(accountId).delete();

        await recordAudit("indodax_account.delete", uid, [], { accountId });

        return res.status(200).json({ success: true });

      }

      default:

        return res.status(405).json({ error: "Method not allowed" });

    }

  } catch (error) {

    console.error("[Indodax Accounts API]", error);

    return res.status(500).json({
      error: "Gagal memproses permintaan.",
    });

  }

}
