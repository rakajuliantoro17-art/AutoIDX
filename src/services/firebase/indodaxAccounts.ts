// src/services/firebase/indodaxAccounts.ts
/**
==========================================================
AURA Trade OS
Indodax Account Management (Client)
Version : 0.0.3 Alpha
(Diperbaiki: SEBELUMNYA nulis langsung dari browser ke
Firestore dengan API key/secret POLOS - resiko keamanan
serius. SEKARANG semua request lewat API route server
(/api/settings/indodax-accounts) yang verifikasi identitas
user via Firebase ID Token dan enkripsi secretKey sebelum
disimpan. Secret key TIDAK PERNAH dikirim balik ke client.)
==========================================================
*/
import type { User } from "firebase/auth";
import { IndodaxAccount, NewIndodaxAccount } from "@/services/indodax/accountTypes";

async function authedFetch(
  user: User,
  method: string,
  body?: Record<string, unknown>
) {

  const idToken = await user.getIdToken();

  const response = await fetch("/api/settings/indodax-accounts", {
    method,
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error ?? "Request gagal.");
  }

  return json;

}

export async function listIndodaxAccounts(
  user: User
): Promise<IndodaxAccount[]> {

  const json = await authedFetch(user, "GET");

  // Catatan: apiKey di sini SUDAH masked (dikirim server sebagai
  // apiKeyMasked). Tidak pernah ada secretKey dalam response ini.
  return (json.accounts ?? []).map((acc: any) => ({
    id: acc.id,
    label: acc.label,
    apiKey: acc.apiKeyMasked,
    secretKey: "",
    isActive: acc.isActive,
    createdAt: acc.createdAt,
  }));

}

export async function addIndodaxAccount(
  user: User,
  data: NewIndodaxAccount
) {

  return authedFetch(user, "POST", {
    label: data.label,
    apiKey: data.apiKey,
    secretKey: data.secretKey,
  });

}

export async function toggleIndodaxAccountActive(
  user: User,
  accountId: string,
  isActive: boolean
) {

  return authedFetch(user, "PATCH", { accountId, isActive });

}

export async function deleteIndodaxAccount(
  user: User,
  accountId: string
) {

  return authedFetch(user, "DELETE", { accountId });

}
