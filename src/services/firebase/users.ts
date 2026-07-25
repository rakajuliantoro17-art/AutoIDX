/**
==========================================================
AURA Trade OS
User Profile Service
Version : 0.0.2 Alpha

Menyimpan/update dokumen users/{uid} setiap kali user login,
sebagai fondasi data model multi-user (Fase A dari rencana
multi-akun Indodax).
==========================================================
*/

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./config";

export async function syncUserProfile(user: User): Promise<void> {
  try {
    const ref = doc(db, "users", user.uid);
    const existing = await getDoc(ref);

    await setDoc(
      ref,
      {
        email: user.email,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        lastLoginAt: serverTimestamp(),
        ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
      },
      { merge: true }
    );
  } catch (error) {
    console.error(
      "[User Profile Sync Error]",
      error instanceof Error ? error.message : error
    );
  }
}
