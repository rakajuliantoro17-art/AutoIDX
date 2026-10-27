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
import { pickActiveAccount } from "@/services/accounts/accountSelection";

export interface ActiveIndodaxCredentials {
  accountId: string;
  label: string;
  apiKey: string;
  secretKey: string;
  /** Kunci TAPIv2 (opsional, untuk riwayat trade/order). */
  v2ApiKey?: string;
  v2SecretKey?: string;
}

export async function getActiveIndodaxAccount(): Promise<ActiveIndodaxCredentials | null> {

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
      .get();

    if (snap.empty) {

      console.error(
        "[Indodax Accounts Admin] Tidak ada akun Indodax yang aktif."
      );

      return null;

    }

    // Bot hanya memakai SATU akun. Data lama bisa punya >1 akun aktif;
    // pilih deterministik (tertua) dan tandai di log, jangan acak.
    const picked = pickActiveAccount(
      snap.docs.map((d) => ({
        id: d.id,
        isActive: true,
        createdAt: Number(d.data().createdAt ?? 0),
      }))
    );

    if (picked.ambiguous) {
      console.error(
        "[Indodax Accounts Admin] Lebih dari satu akun aktif; memakai yang tertua. Aktifkan satu akun saja di Settings."
      );
    }

    const doc = snap.docs.find((d) => d.id === picked.account!.id)!;
    const data = doc.data();

    return {
      accountId: doc.id,
      label: data.label,
      apiKey: decrypt(data.apiKey),
      secretKey: decrypt(data.secretKey),
      ...(data.v2ApiKey && data.v2SecretKey
        ? { v2ApiKey: decrypt(data.v2ApiKey), v2SecretKey: decrypt(data.v2SecretKey) }
        : {}),
    };

  } catch (error) {

    console.error(
      "[Indodax Accounts Admin] Gagal ambil/dekripsi akun aktif:",
      error
    );

    return null;

  }

}
