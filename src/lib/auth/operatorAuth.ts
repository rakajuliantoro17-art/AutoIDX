/**
==========================================================
AURA Trade OS
Operator Auth (CRON_SECRET ATAU Firebase ID Token)
==========================================================
Untuk endpoint operator yang berat/sensitif (mis. backtest):
diterima bila header `Authorization: Bearer <token>` berisi
SALAH SATU dari:
  1. CRON_SECRET (curl / skrip / GitHub Actions), atau
  2. Firebase ID token pengguna yang sedang login di dashboard.

Fail-closed: tanpa header, token salah, atau keduanya tidak
dapat diverifikasi -> ditolak (401). CRON_SECRET belum di-set
tidak membuka akses; jalur Firebase tetap diperiksa.
==========================================================
*/

import type { NextApiRequest } from "next";
import { verifyCronSecret } from "@/lib/auth/cronAuth";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";

export async function verifyOperatorAccess(
  req: NextApiRequest,
  label: string
): Promise<boolean> {
  const header = req.headers.authorization;

  if (!header) {
    return false;
  }

  if (verifyCronSecret(header, label).ok) {
    return true;
  }

  const user = await verifyApiAuth(req);
  return user !== null;
}
