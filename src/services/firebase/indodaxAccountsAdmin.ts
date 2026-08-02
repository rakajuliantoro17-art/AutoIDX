/**
==========================================================
AURA Trade OS
Indodax Accounts (Admin/Server-only)
Version : 0.0.1 Alpha
Dipakai TradingEngine untuk ambil kredensial akun Indodax yang
sedang aktif (didekripsi) saat live trading jalan. Owner bot
ditentukan lewat env var BOT_OWNER_UID (uid Firebase Auth
pemilik dashboard - saat ini bot masih single-account per
siklus, akun pertama yang isActive=true yang dipakai).

CATATAN: file ini HANYA boleh diimport dari server
(API routes / cron). Jangan import dari komponen client.
==========================================================
*/

import { adminDb } from "./admin";
import { decrypt } from "@/services/security/encryption";

export interface ActiveIndodaxCredentials {
  accountId: string;
  label: string;
  apiKey: string;
  secretKey: string;
}

export async function getActiveIndodaxAccount(): Promise
  ActiveIndodaxCredentials | null
> {

  const ownerUid = process.env.BOT_OWNER_UID;

  if (!ownerUid) {

    console.error(
      "[Indodax Accounts Admin] BOT_OWNER_UID belum di-set."
    );

    return null;

  }

  try {

    const snap = await adminDb
      .collection("users")
      .doc(ownerUid)
      .collection("indodaxAccounts")
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (snap.empty) {

      console.error(
        "[Indodax Accounts Admin] Tidak ada akun Indodax yang aktif."
      );

      return null;

    }

    const doc = snap.docs[0];
    const data = doc.data();

    return {
      accountId: doc.id,
      label: data.label,
      apiKey: decrypt(data.apiKey),
      secretKey: decrypt(data.secretKey),
    };

  } catch (error) {

    console.error(
      "[Indodax Accounts Admin] Gagal ambil/dekripsi akun aktif:",
      error
    );

    return null;

  }

}
