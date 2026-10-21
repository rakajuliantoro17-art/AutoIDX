/**
 * POST /api/settings/indodax-test -- uji koneksi API key Indodax (khusus pemilik).
 *
 * BACA-SAJA: hanya memanggil getInfo (izin "view"). TIDAK pernah mengirim order.
 * Dipanggil dari server (Vercel), jadi hasilnya membuktikan apakah Indodax
 * menerima panggilan privat dari IP server yang sama dengan yang dipakai bot.
 *
 * Batasan jujur: izin "trade" TIDAK bisa dibuktikan tanpa menempatkan order
 * sungguhan. Hasil uji ini hanya membuktikan key valid, signature benar, jam
 * server sinkron, dan Indodax tidak memblokir jalur Vercel.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { isOwner } from "@/services/agents/decisions";
import { getActiveIndodaxAccount } from "@/services/firebase/indodaxAccountsAdmin";
import { diagnoseGetInfoFailure, type ConnectionDiagnosis } from "@/services/accounts/connectionDiagnosis";
import { IndodaxClient } from "@/services/liveTrading/exchange/indodaxClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed." });
  }
  const user = await verifyApiAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized." });
  if (!isOwner(user.uid)) return res.status(403).json({ error: "Hanya pemilik." });

  const startedAt = Date.now();
  try {
    const account = await getActiveIndodaxAccount();
    if (!account) {
      return res.status(200).json({
        ok: false,
        diagnosis: "NO_ACTIVE_ACCOUNT" satisfies ConnectionDiagnosis,
        message: "Tidak ada akun Indodax aktif (atau BOT_OWNER_UID belum di-set).",
      });
    }

    const client = new IndodaxClient({ apiKey: account.apiKey, secretKey: account.secretKey });
    const info = await client.getInfo();
    const latencyMs = Date.now() - startedAt;

    if (!info.success) {
      return res.status(200).json({
        ok: false,
        diagnosis: diagnoseGetInfoFailure(info.message),
        message: info.message,
        latencyMs,
      });
    }

    const serverTimeMs = Number(info.data.server_time) * (Number(info.data.server_time) < 1e12 ? 1000 : 1);
    const idr = parseFloat(String(info.data.balance?.idr ?? "0"));
    return res.status(200).json({
      ok: true,
      diagnosis: "OK" satisfies ConnectionDiagnosis,
      message: "getInfo berhasil dari server. Izin trade tidak dapat diuji tanpa order sungguhan.",
      latencyMs,
      idrBalance: Number.isFinite(idr) ? idr : 0,
      clockSkewMs: Number.isFinite(serverTimeMs) ? Date.now() - serverTimeMs : null,
      tradePermissionVerified: false,
    });
  } catch (error) {
    console.error("[INDODAX TEST ERROR]", error);
    return res.status(500).json({ ok: false, message: error instanceof Error ? error.message : "Gagal menguji koneksi." });
  }
}
