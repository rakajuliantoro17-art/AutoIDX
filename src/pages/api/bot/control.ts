/**
==========================================================
AURA Trade OS
Bot Control API
Version : 0.0.1 Alpha
==========================================================
GET  -> baca status kontrol bot saat ini (emergencyStop, mode)
POST -> ubah status (WAJIB login, verifikasi Firebase ID Token)

Body POST (semua field opsional, kirim yang mau diubah saja):
  { "emergencyStop": true }
  { "mode": "live" }
  { "emergencyStop": false, "mode": "paper" }

CATATAN KEAMANAN: mengubah "mode" jadi "live" lewat endpoint
ini TIDAK otomatis membuat bot mengeksekusi order asli --
engine.ts masih mensyaratkan process.env.BOT_LIVE_CONFIRM
"true" juga (gerbang kedua, cuma bisa diubah lewat Vercel env
var + redeploy). Toggle ini mengubah bot_control.mode di
Firestore, satu dari dua syarat yang dicek isLiveModeActive().
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

    if (Object.keys(update).length === 0) {

      return res.status(400).json({

        error: "Tidak ada field valid untuk diubah (emergencyStop / mode).",

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
