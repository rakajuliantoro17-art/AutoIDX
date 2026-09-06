/**
==========================================================
AURA Trade OS
Bot Control API
Version : 0.0.1 Alpha
==========================================================
GET  -> baca status kontrol bot saat ini (emergencyStop, mode,
        priorityPairs)
POST -> ubah status (WAJIB login, verifikasi Firebase ID Token)

Body POST (semua field opsional, kirim yang mau diubah saja):
  { "emergencyStop": true }
  { "mode": "live" }
  { "emergencyStop": false, "mode": "paper" }
  { "priorityPairs": ["btc_idr", "eth_idr"] }
  { "priorityPairs": [] }  -- kosongkan checklist, kembali ke
                              perilaku union penuh (lihat
                              services/scheduler/cron.ts)

CATATAN KEAMANAN: mengubah "mode" jadi "live" lewat endpoint
this TIDAK otomatis membuat bot mengeksekusi order asli --
engine.ts masih mensyaratkan process.env.BOT_LIVE_CONFIRM
"true" juga (gerbang kedua, cuma bisa diubah lewat Vercel env
var + redeploy). Toggle ini mengubah bot_control.mode di
Firestore, satu dari dua syarat yang dicek isLiveModeActive().

CATATAN priorityPairs: HANYA daftar pair (string), tidak
divalidasi terhadap candidatePairs siklus berjalan DI SINI --
validasi "apakah pair ini benar-benar sedang direkomendasikan
scanner" terjadi di services/scheduler/cron.ts saat eksekusi
(irisan dengan candidatePairs), bukan saat disimpan. Jadi
menyimpan pair yang TIDAK sedang qualified tidak error, cuma
tidak akan pernah dieksekusi otomatis sampai pair itu benar-
benar qualified di suatu siklus scan.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";

import {
  getBotControl,
  updateBotControl,
  BotControlMode,
} from "@/services/firebase/botControl";

import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";

export default async function handler(

  req: NextApiRequest,

  res: NextApiResponse

) {

  if (req.method === "GET") {

    try {

      const control = await getBotControl();

      return res.status(200).json(control);

    } catch (error) {

      console.error(

        "[BOT CONTROL API GET ERROR]",

        error

      );

      return res.status(500).json({

        error: "Gagal membaca status kontrol bot.",

      });

    }

  }

  if (req.method === "POST") {

    const authUser = await verifyApiAuth(req);

    if (!authUser) {

      return res.status(401).json({

        error: "Unauthorized. Login diperlukan untuk mengubah kontrol bot.",

      });

    }

    const body = req.body ?? {};

    const update: {

      emergencyStop?: boolean;

      mode?: BotControlMode;

      priorityPairs?: string[];

    } = {};

    if (typeof body.emergencyStop === "boolean") {

      update.emergencyStop = body.emergencyStop;

    }

    if (

      body.mode === "paper" ||
      body.mode === "live"

    ) {

      update.mode = body.mode;

    }

    if (

      Array.isArray(body.priorityPairs) &&
      body.priorityPairs.every((p: unknown) => typeof p === "string")

    ) {

      // Dedup + normalisasi ringan di sini (lowercase, trim) --
      // validasi "apakah pair ini valid/qualified" sengaja TIDAK
      // dilakukan di sini, lihat catatan header file ini.
      update.priorityPairs = Array.from(
        new Set(
          body.priorityPairs
            .map((p: string) => p.trim().toLowerCase())
            .filter(Boolean)
        )
      );

    }

    if (Object.keys(update).length === 0) {

      return res.status(400).json({

        error: "Tidak ada field valid untuk diubah (emergencyStop / mode / priorityPairs).",

      });

    }

    try {

      const result = await updateBotControl(

        update,

        authUser.email ?? authUser.uid

      );

      return res.status(200).json(result);

    } catch (error) {

      console.error(

        "[BOT CONTROL API POST ERROR]",

        error

      );

      return res.status(500).json({

        error: "Gagal menyimpan perubahan kontrol bot.",

      });

    }

  }

  res.setHeader("Allow", ["GET", "POST"]);

  return res.status(405).json({

    error: "Method not allowed.",

  });

}
