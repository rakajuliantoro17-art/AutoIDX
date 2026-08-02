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

        const ref = await accountsCollection(uid).add({
          label,
          apiKey: encryptedApiKey,
          secretKey: encryptedSecretKey,
          isActive: true,
          createdAt: Date.now(),
        });

        return res.status(200).json({ id: ref.id });

      }

      case "PATCH": {

        const { accountId, isActive } = req.body ?? {};

        if (!accountId || typeof isActive !== "boolean") {

          return res.status(400).json({
            error: "accountId dan isActive (boolean) wajib diisi.",
          });

        }

        await accountsCollection(uid).doc(accountId).update({ isActive });

        return res.status(200).json({ success: true });

      }

      case "DELETE": {

        const { accountId } = req.body ?? {};

        if (!accountId) {

          return res.status(400).json({
            error: "accountId wajib diisi.",
          });

        }

        await accountsCollection(uid).doc(accountId).delete();

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
