/**
==========================================================
AURA Trade OS
API Auth Verification (server-only)
Version : 0.0.1 Alpha
==========================================================
Verifikasi Firebase ID Token yang dikirim client lewat header
"Authorization: Bearer <token>". Dipakai di API route yang
butuh proteksi (mis. toggle emergency stop / mode live).

Cara pakai di client:
  const token = await user.getIdToken();
  fetch("/api/bot/control", {
    headers: { Authorization: `Bearer ${token}` },
    ...
  });
==========================================================
*/

import type { NextApiRequest } from "next";

import { adminAuth } from "@/services/firebase/admin";

export interface VerifiedApiUser {

  uid: string;

  email?: string;

}

/**
 * Verifikasi token dari header Authorization.
 * Return null kalau tidak ada/tidak valid -- caller
 * WAJIB cek null dan balas 401 kalau begitu.
 */
export async function verifyApiAuth(

  req: NextApiRequest

): Promise<VerifiedApiUser | null> {

  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {

    return null;

  }

  const token = header.slice("Bearer ".length).trim();

  if (!token) {

    return null;

  }

  try {

    const decoded = await adminAuth.verifyIdToken(token);

    return {

      uid: decoded.uid,

      email: decoded.email,

    };

  } catch (error) {

    console.error(

      "[API AUTH VERIFY ERROR]",

      error

    );

    return null;

  }

}
