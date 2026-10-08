/**
==========================================================
AutoIDX
Bot Constants
Version : 0.1.0 Alpha
==========================================================
Hanya konstanta yang benar-benar dipakai logger.ts. Konstanta
trading/risk/indikator/Firestore SEBELUMNYA ada di sini tapi
tidak diimpor siapa pun (sumber sebenarnya: src/config/*), jadi
dihapus supaya tidak ada nilai ganda yang bisa menyimpang.
==========================================================
*/
export const BOT = {
  NAME: "AutoIDX",
  VERSION: "0.0.1",
  DESCRIPTION: "Automated Indodax Trading Engine",
} as const;

export const LOG_LEVEL = {
  INFO: "INFO",
  WARNING: "WARNING",
  ERROR: "ERROR",
  SUCCESS: "SUCCESS",
} as const;
