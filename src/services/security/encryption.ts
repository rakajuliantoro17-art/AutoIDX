/**
==========================================================
AURA Trade OS
Encryption Utility (Server-only)
Version : 0.0.1 Alpha
AES-256-GCM untuk enkripsi API key/secret sebelum disimpan
ke Firestore. Key enkripsi berasal dari env var
ACCOUNT_ENCRYPTION_KEY (WAJIB hex string 64 karakter / 32 byte).

CATATAN: file ini HANYA boleh diimport dari server
(API routes / cron). Jangan import dari komponen client.
==========================================================
*/

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {

  const keyHex = process.env.ACCOUNT_ENCRYPTION_KEY;

  if (!keyHex || keyHex.length !== 64) {

    throw new Error(
      "ACCOUNT_ENCRYPTION_KEY belum di-set atau bukan hex 64 karakter (32 byte). " +
      "Generate dengan: openssl rand -hex 32"
    );

  }

  return Buffer.from(keyHex, "hex");

}

/**
 * Enkripsi teks (misal: secret key API).
 * Hasil format: "<iv>:<authTag>:<ciphertext>" (semua hex).
 */
export function encrypt(plainText: string): string {

  const key = getKey();

  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");

}

/**
 * Dekripsi teks yang sudah dienkripsi oleh encrypt() di atas.
 */
export function decrypt(cipherText: string): string {

  const key = getKey();

  const [ivHex, authTagHex, dataHex] = cipherText.split(":");

  if (!ivHex || !authTagHex || !dataHex) {

    throw new Error("Format ciphertext tidak valid.");

  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");

}
